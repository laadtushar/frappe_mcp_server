import { frappe, createFrappeClient } from './api-client.js';
import { handleApiError } from './errors.js';

/**
 * Interface for authentication credentials
 */
export interface AuthCredentials {
  apiKey: string;
  apiSecret: string;
  frappeUrl?: string;
}

/**
 * Get the appropriate Frappe client based on provided credentials
 */
function getFrappeClient(credentials?: AuthCredentials) {
  if (credentials) {
    return createFrappeClient(credentials.apiKey, credentials.apiSecret, credentials.frappeUrl);
  }
  
  if (!frappe) {
    throw new Error("No Frappe client available. Please provide API credentials in the request or set environment variables FRAPPE_API_KEY and FRAPPE_API_SECRET.");
  }
  
  return frappe;
}

/**
 * Verify that a document was successfully created
 */
async function verifyDocumentCreation(
  doctype: string,
  values: Record<string, any>,
  creationResponse: any,
  credentials?: AuthCredentials
): Promise<{ success: boolean; message: string }> {
  try {
    const client = getFrappeClient(credentials);
    
    // First check if we have a name in the response
    if (!creationResponse.name) {
      return { success: false, message: "Response does not contain a document name" };
    }

    // Try to fetch the document directly by name
    try {
      const document = await client.db().getDoc(doctype, creationResponse.name);
      if (document && document.name === creationResponse.name) {
        return { success: true, message: "Document verified by direct fetch" };
      }
    } catch (error) {
      console.error(`Error fetching document by name during verification:`, error);
      // Continue with alternative verification methods
    }

    // Try to find the document by filtering
    const filters: Record<string, any> = {};

    // Use the most unique fields for filtering
    if (values.name) {
      filters['name'] = ['=', values.name];
    } else if (values.title) {
      filters['title'] = ['=', values.title];
    } else if (values.description) {
      // Use a substring of the description to avoid issues with long text
      filters['description'] = ['like', `%${values.description.substring(0, 20)}%`];
    }

    if (Object.keys(filters).length > 0) {
      const documents = await client.db().getDocList(doctype, {
        filters: filters as any[],
        limit: 5
      });

      if (documents && documents.length > 0) {
        // Check if any of the returned documents match our expected name
        const matchingDoc = documents.find(doc => doc.name === creationResponse.name);
        if (matchingDoc) {
          return { success: true, message: "Document verified by filter search" };
        }

        // If we found documents but none match our expected name, that's suspicious
        return {
          success: false,
          message: `Found ${documents.length} documents matching filters, but none match the expected name ${creationResponse.name}`
        };
      }

      return {
        success: false,
        message: "No documents found matching the creation filters"
      };
    }

    // If we couldn't verify with filters, return a warning
    return {
      success: false,
      message: "Could not verify document creation - no suitable filters available"
    };
  } catch (verifyError) {
    return {
      success: false,
      message: `Error during verification: ${(verifyError as Error).message}`
    };
  }
}

/**
 * Create a document with retry logic
 */
async function createDocumentWithRetry(
  doctype: string,
  values: Record<string, any>,
  credentials?: AuthCredentials,
  maxRetries = 3
): Promise<any> {
  let lastError;
  const client = getFrappeClient(credentials);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await client.db().createDoc(doctype, values);

      // Verify document creation
      const verificationResult = await verifyDocumentCreation(doctype, values, result, credentials);
      if (verificationResult.success) {
        return { ...result, _verification: verificationResult };
      }

      // If verification failed, throw an error to trigger retry
      lastError = new Error(`Verification failed: ${verificationResult.message}`);

      // Wait before retrying (exponential backoff)
      const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s, etc.
      await new Promise(resolve => setTimeout(resolve, delay));
    } catch (error) {
      lastError = error;

      // Wait before retrying
      const delay = Math.pow(2, attempt - 1) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // If we've exhausted all retries, throw the last error
  throw lastError || new Error(`Failed to create document after ${maxRetries} attempts`);
}

/**
 * Log operation for transaction-like pattern
 */
async function logOperation(
  operationId: string,
  status: 'start' | 'success' | 'failure' | 'error',
  data: any
): Promise<void> {
  // This could write to a local log file, a database, or even a separate API
  console.error(`[Operation ${operationId}] ${status}:`, JSON.stringify(data, null, 2));

  // In a production system, you might want to persist this information
  // to help with debugging and recovery
}

/**
 * Create a document with transaction-like pattern
 */
async function createDocumentTransactional(
  doctype: string,
  values: Record<string, any>,
  credentials?: AuthCredentials
): Promise<any> {
  // 1. Create a temporary log entry to track this operation
  const operationId = `create_${doctype}_${Date.now()}`;
  try {
    // Log the operation start
    await logOperation(operationId, 'start', { doctype, values });

    // 2. Attempt to create the document
    const result = await createDocumentWithRetry(doctype, values, credentials);

    // 3. Verify the document was created
    const verificationResult = await verifyDocumentCreation(doctype, values, result, credentials);

    // 4. Log the operation result
    await logOperation(operationId, verificationResult.success ? 'success' : 'failure', {
      result,
      verification: verificationResult
    });

    // 5. Return the result with verification info
    return {
      ...result,
      _verification: verificationResult
    };
  } catch (error) {
    // Log the operation error
    await logOperation(operationId, 'error', { error: (error as Error).message });
    throw error;
  }
}

// Document operations
export async function getDocument(
  doctype: string,
  name: string,
  fields?: string[],
  credentials?: AuthCredentials
): Promise<any> {
  if (!doctype) throw new Error("DocType is required");
  if (!name) throw new Error("Document name is required");

  const client = getFrappeClient(credentials);
  const fieldsParam = fields ? `?fields=${JSON.stringify(fields)}` : "";
  try {
    const response = await client.db().getDoc(
      doctype,
      name
    );

    if (!response) {
      throw new Error(`Invalid response format for document ${doctype}/${name}`);
    }

    return response;
  } catch (error) {
    handleApiError(error, `get_document(${doctype}, ${name})`);
  }
}

export async function createDocument(
  doctype: string,
  values: Record<string, any>,
  credentials?: AuthCredentials
): Promise<any> {
  if (!doctype) throw new Error("DocType is required");
  if (!values || Object.keys(values).length === 0) {
    throw new Error("Document values are required");
  }

  console.error(`Creating document of type ${doctype} with values:`, JSON.stringify(values, null, 2));

  try {
    const result = await createDocumentTransactional(doctype, values, credentials);
    console.error(`Create document response:`, JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error(`Error in createDocument:`, error);
    return handleApiError(error, `create_document(${doctype})`);
  }
}

export async function updateDocument(
  doctype: string,
  name: string,
  values: Record<string, any>,
  credentials?: AuthCredentials
): Promise<any> {
  if (!doctype) throw new Error("DocType is required");
  if (!name) throw new Error("Document name is required");
  if (!values || Object.keys(values).length === 0) {
    throw new Error("Document values are required");
  }

  const client = getFrappeClient(credentials);
  try {
    const response = await client.db().updateDoc(doctype, name, values);

    if (!response) {
      throw new Error(`Invalid response format for updating ${doctype}/${name}`);
    }

    return response;
  } catch (error) {
    handleApiError(error, `update_document(${doctype}, ${name})`);
  }
}

export async function deleteDocument(
  doctype: string,
  name: string,
  credentials?: AuthCredentials
): Promise<any> {
  if (!doctype) throw new Error("DocType is required");
  if (!name) throw new Error("Document name is required");

  const client = getFrappeClient(credentials);
  try {
    const response = await client.db().deleteDoc(doctype, name);
    return response;
  } catch (error) {
    handleApiError(error, `delete_document(${doctype}, ${name})`);
  }
}

export async function listDocuments(
  doctype: string,
  filters?: Record<string, any>,
  fields?: string[],
  limit?: number,
  order_by?: string,
  limit_start?: number,
  credentials?: AuthCredentials
): Promise<any[]> {
  if (!doctype) throw new Error("DocType is required");

  const client = getFrappeClient(credentials);
  try {
    const options: any = {};

    if (filters) {
      options.filters = filters;
    }

    if (fields) {
      options.fields = fields;
    }

    if (limit) {
      options.limit = limit;
    }

    if (order_by) {
      options.order_by = order_by;
    }

    if (limit_start) {
      options.limit_start = limit_start;
    }

    const response = await client.db().getDocList(doctype, options);

    if (!Array.isArray(response)) {
      throw new Error(`Invalid response format for listing ${doctype} documents`);
    }

    return response;
  } catch (error) {
    handleApiError(error, `list_documents(${doctype})`);
  }
}

export async function callMethod(
  method: string,
  params?: Record<string, any>,
  credentials?: AuthCredentials
): Promise<any> {
  if (!method) throw new Error("Method name is required");

  const client = getFrappeClient(credentials);
  try {
    const response = await client.call().post(method, params || {});

    return response;
  } catch (error) {
    handleApiError(error, `call_method(${method})`);
  }
}