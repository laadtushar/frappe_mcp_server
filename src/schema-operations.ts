import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  ListResourceTemplatesRequestSchema,
  ReadResourceRequestSchema,
  ErrorCode,
  McpError,
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import {
  getDocTypeSchema,
  getFieldOptions,
  FrappeApiError,
  getAllDocTypes,
  getAllModules
} from "./frappe-api.js";
import { AuthCredentials } from "./document-api.js";
import { formatFilters } from "./frappe-helpers.js";
import {
  getDocTypeHints,
  getWorkflowHints,
  findWorkflowsForDocType,
  initializeStaticHints
} from "./static-hints.js";
import {
  getDocTypeUsageInstructions,
  getAppForDocType,
  getAppUsageInstructions,
  initializeAppIntrospection
} from "./app-introspection.js";

// Define schema tools with API credentials
export const SCHEMA_TOOLS = [
  {
    name: "get_doctype_schema",
    description: "Get the complete schema for a DocType including field definitions, validations, and linked DocTypes. Use this to understand the structure of a DocType before creating or updating documents.",
    inputSchema: {
      type: "object",
      properties: {
        doctype: { type: "string", description: "DocType name" },
        api_key: { type: "string", description: "Frappe API key for authentication" },
        api_secret: { type: "string", description: "Frappe API secret for authentication" },
        frappe_url: { type: "string", description: "Frappe instance URL (optional, defaults to server configuration)" },
      },
      required: ["doctype", "api_key", "api_secret"]
    }
  },
  {
    name: "get_field_options",
    description: "Get available options for a Link or Select field. For Link fields, returns documents from the linked DocType. For Select fields, returns the predefined options.",
    inputSchema: {
      type: "object",
      properties: {
        doctype: { type: "string", description: "DocType name" },
        fieldname: { type: "string", description: "Field name" },
        filters: {
          type: "object",
          description: "Filters to apply to the linked DocType (optional, for Link fields only)",
          additionalProperties: true
        },
        api_key: { type: "string", description: "Frappe API key for authentication" },
        api_secret: { type: "string", description: "Frappe API secret for authentication" },
        frappe_url: { type: "string", description: "Frappe instance URL (optional, defaults to server configuration)" },
      },
      required: ["doctype", "fieldname", "api_key", "api_secret"]
    }
  },
  {
    name: "get_frappe_usage_info",
    description: "Get combined information about a DocType or workflow, including schema metadata and usage guidance from static hints.",
    inputSchema: {
      type: "object",
      properties: {
        doctype: { type: "string", description: "DocType name (optional if workflow is provided)" },
        workflow: { type: "string", description: "Workflow name (optional if doctype is provided)" },
        api_key: { type: "string", description: "Frappe API key for authentication" },
        api_secret: { type: "string", description: "Frappe API secret for authentication" },
        frappe_url: { type: "string", description: "Frappe instance URL (optional, defaults to server configuration)" },
      },
      required: ["api_key", "api_secret"]
    }
  }
];

/**
 * Format error response with detailed information
 */
function formatErrorResponse(error: any, operation: string, credentials?: AuthCredentials): any {
  console.error(`Error in ${operation}:`, error);

  // Include authentication context in error details
  const apiKey = credentials?.apiKey || process.env.FRAPPE_API_KEY;
  const apiSecret = credentials?.apiSecret || process.env.FRAPPE_API_SECRET;

  let errorMessage = `Error in ${operation}: ${error.message || 'Unknown error'}`;
  let errorDetails = null;

  // Check for missing credentials first
  if (!apiKey || !apiSecret) {
    errorMessage = `Authentication failed: ${!apiKey && !apiSecret ? 'Both API key and API secret are missing' :
                    !apiKey ? 'API key is missing' : 'API secret is missing'}. Please provide API credentials in the request or set environment variables.`;
    errorDetails = {
      error: "Missing credentials",
      apiKeyAvailable: !!apiKey,
      apiSecretAvailable: !!apiSecret,
      perRequestAuth: !!credentials
    };
  } else if (error instanceof FrappeApiError) {
    errorMessage = error.message;
    errorDetails = {
      statusCode: error.statusCode,
      endpoint: error.endpoint,
      details: error.details,
      perRequestAuth: !!credentials
    };
  }

  return {
    content: [
      {
        type: "text",
        text: errorMessage,
      },
      ...(errorDetails ? [
        {
          type: "text",
          text: `\nDetails: ${JSON.stringify(errorDetails, null, 2)}`,
        }
      ] : [])
    ],
    isError: true,
  };
}

// Export a handler function for schema tool calls
export async function handleSchemaToolCall(request: any): Promise<any> {
  const { name, arguments: args } = request.params;

  if (!args) {
    return {
      content: [
        {
          type: "text",
          text: "Missing arguments for tool call",
        },
      ],
      isError: true,
    };
  }

  // Extract credentials from arguments
  const credentials: AuthCredentials | undefined = args.api_key && args.api_secret ? {
    apiKey: args.api_key,
    apiSecret: args.api_secret,
    frappeUrl: args.frappe_url
  } : undefined;

  try {
    console.error(`Handling schema tool: ${name} with args:`, args);

    if (name === "get_doctype_schema") {
      const doctype = args.doctype as string;
      if (!doctype) {
        return {
          content: [
            {
              type: "text",
              text: "Missing required parameter: doctype",
            },
          ],
          isError: true,
        };
      }

      if (!credentials) {
        return {
          content: [
            {
              type: "text",
              text: "Missing required authentication: api_key and api_secret are required",
            },
          ],
          isError: true,
        };
      }

      try {
        let schema;
        let authMethod = "per-request";

        // Get schema using per-request authentication
        schema = await getDocTypeSchema(doctype, credentials);
        console.error(`Retrieved schema for ${doctype} using per-request auth`);

        // Add a summary of the schema for easier understanding
        const fieldTypes = schema.fields.reduce((acc: Record<string, number>, field: any) => {
          acc[field.fieldtype] = (acc[field.fieldtype] || 0) + 1;
          return acc;
        }, {});

        const requiredFields = schema.fields
          .filter((field: any) => field.required)
          .map((field: any) => field.fieldname);

        const summary = {
          name: schema.name,
          module: schema.module,
          isSingle: schema.issingle,
          isTable: schema.istable,
          isCustom: schema.custom,
          autoname: schema.autoname,
          fieldCount: schema.fields.length,
          fieldTypes: fieldTypes,
          requiredFields: requiredFields,
          permissions: schema.permissions.length,
          authMethod: authMethod
        };

        return {
          content: [
            {
              type: "text",
              text: `Schema Summary (retrieved using ${authMethod} authentication):\n${JSON.stringify(summary, null, 2)}\n\nFull Schema:\n${JSON.stringify(schema, null, 2)}`,
            },
          ],
        };
      } catch (error) {
        return formatErrorResponse(error, `get_doctype_schema(${doctype})`, credentials);
      }
    } else if (name === "get_field_options") {
      const doctype = args.doctype as string;
      const fieldname = args.fieldname as string;

      if (!doctype || !fieldname) {
        return {
          content: [
            {
              type: "text",
              text: "Missing required parameters: doctype and fieldname are required",
            },
          ],
          isError: true,
        };
      }

      if (!credentials) {
        return {
          content: [
            {
              type: "text",
              text: "Missing required authentication: api_key and api_secret are required",
            },
          ],
          isError: true,
        };
      }

      try {
        const filters = args.filters as Record<string, any> | undefined;
        let authMethod = "per-request";

        // Get field options using per-request authentication
        const options = await getFieldOptions(doctype, fieldname, filters, credentials);
        console.error(`Retrieved field options for ${doctype}.${fieldname} using per-request auth`);

        return {
          content: [
            {
              type: "text",
              text: `Field options for ${doctype}.${fieldname} (retrieved using ${authMethod} authentication):\n\n${JSON.stringify(options, null, 2)}`,
            },
          ],
        };
      } catch (error) {
        return formatErrorResponse(error, `get_field_options(${doctype}, ${fieldname})`, credentials);
      }
    } else if (name === "get_frappe_usage_info") {
      const doctype = args.doctype as string;
      const workflow = args.workflow as string;

      if (!doctype && !workflow) {
        return {
          content: [
            {
              type: "text",
              text: "At least one of doctype or workflow must be provided",
            },
          ],
          isError: true,
        };
      }

      if (!credentials) {
        return {
          content: [
            {
              type: "text",
              text: "Missing required authentication: api_key and api_secret are required",
            },
          ],
          isError: true,
        };
      }

      try {
        let result: any = {};
        let authMethod = "per-request";

        if (doctype) {
          // Get DocType schema using per-request authentication
          const schema = await getDocTypeSchema(doctype, credentials);
          result.schema = schema;

          // Get static hints (these don't require authentication)
          const hints = await getDocTypeHints(doctype);
          result.hints = hints;

          // Get app-specific usage instructions (these don't require authentication)
          const app = await getAppForDocType(doctype);
          if (app) {
            const appInstructions = await getAppUsageInstructions(app);
            result.appInstructions = appInstructions;
          }

          // Get DocType-specific usage instructions (these don't require authentication)
          const usageInstructions = await getDocTypeUsageInstructions(doctype);
          result.usageInstructions = usageInstructions;

          // Find workflows for this DocType (these don't require authentication)
          const workflows = await findWorkflowsForDocType(doctype);
          if (workflows.length > 0) {
            result.workflows = workflows;
          }
        }

        if (workflow) {
          // Get workflow hints (these don't require authentication)
          const workflowHints = await getWorkflowHints(workflow);
          result.workflowHints = workflowHints;
        }

        return {
          content: [
            {
              type: "text",
              text: `Frappe usage information (retrieved using ${authMethod} authentication):\n\n${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      } catch (error) {
        return formatErrorResponse(error, `get_frappe_usage_info(${doctype || workflow})`, credentials);
      }
    }

    return {
      content: [
        {
          type: "text",
          text: `Unknown schema tool: ${name}`,
        },
      ],
      isError: true,
    };
  } catch (error) {
    return formatErrorResponse(error, `schema_operations.${name}`, credentials);
  }
}

export function setupSchemaTools(server: Server): void {
  // Initialize static hints
  console.error("Initializing static hints...");
  initializeStaticHints().then(() => {
    console.error("Static hints initialized successfully");
  }).catch(error => {
    console.error("Error initializing static hints:", error);
  });
  
  // Initialize app introspection
  console.error("Initializing app introspection...");
  initializeAppIntrospection().then(() => {
    console.error("App introspection initialized successfully");
  }).catch(error => {
    console.error("Error initializing app introspection:", error);
  });

  // We no longer register tools here, only resources
  // Tools are now registered in the central handler in index.ts

  // Register schema resources
  server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => ({
    resourceTemplates: [
      {
        uriTemplate: "schema://{doctype}",
        name: "DocType Schema",
        mimeType: "application/json",
        description:
          "Schema information for a DocType including field definitions and validations",
      },
      {
        uriTemplate: "schema://{doctype}/{fieldname}/options",
        name: "Field Options",
        mimeType: "application/json",
        description: "Available options for a Link or Select field",
      },
      {
        uriTemplate: "schema://modules",
        name: "Module List",
        mimeType: "application/json",
        description: "List of all modules in the system",
      },
      {
        uriTemplate: "schema://doctypes",
        name: "DocType List",
        mimeType: "application/json",
        description: "List of all DocTypes in the system",
      },
    ],
  }));

  // Handle schema resource requests
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;

    try {
      // Handle DocType schema resource
      const schemaMatch = uri.match(/^schema:\/\/([^\/]+)$/);
      if (schemaMatch) {
        const doctype = decodeURIComponent(schemaMatch[1]);

        // Special case for modules list
        if (doctype === "modules") {
          const modules = await getAllModules();
          return {
            contents: [
              {
                uri,
                mimeType: "application/json",
                text: JSON.stringify(modules, null, 2),
              },
            ],
          };
        }

        // Special case for doctypes list
        if (doctype === "doctypes") {
          const doctypes = await getAllDocTypes();
          return {
            contents: [
              {
                uri,
                mimeType: "application/json",
                text: JSON.stringify(doctypes, null, 2),
              },
            ],
          };
        }

        // Regular DocType schema
        const schema = await getDocTypeSchema(doctype);
        return {
          contents: [
            {
              uri,
              mimeType: "application/json",
              text: JSON.stringify(schema, null, 2),
            },
          ],
        };
      }

      // Handle field options resource
      const optionsMatch = uri.match(/^schema:\/\/([^\/]+)\/([^\/]+)\/options$/);
      if (optionsMatch) {
        const doctype = decodeURIComponent(optionsMatch[1]);
        const fieldname = decodeURIComponent(optionsMatch[2]);
        const options = await getFieldOptions(doctype, fieldname);

        return {
          contents: [
            {
              uri,
              mimeType: "application/json",
              text: JSON.stringify(options, null, 2),
            },
          ],
        };
      }

      throw new McpError(
        ErrorCode.InvalidRequest,
        `Unknown resource URI: ${uri}`
      );
    } catch (error) {
      console.error(`Error handling resource request for ${uri}:`, error);

      if (error instanceof McpError) {
        throw error;
      }

      if (error instanceof FrappeApiError) {
        throw new McpError(
          ErrorCode.InternalError,
          error.message
        );
      }

      throw new McpError(
        ErrorCode.InternalError,
        `Error processing resource request: ${(error as Error).message}`
      );
    }
  });
}