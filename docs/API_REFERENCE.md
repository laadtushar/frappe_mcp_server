# API Reference

This document provides detailed information about all available tools in the Frappe MCP Server.

## Table of Contents

1. [Authentication Parameters](#authentication-parameters)
2. [Document Operations](#document-operations)
3. [Schema Operations](#schema-operations)
4. [Common Parameters](#common-parameters)
5. [Response Formats](#response-formats)
6. [Error Handling](#error-handling)

## Authentication Parameters

All tools support both per-request authentication and environment-based authentication.

### Per-Request Authentication (Recommended)

Include these parameters in each tool call:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `api_key` | string | Yes* | Your Frappe API key |
| `api_secret` | string | Yes* | Your Frappe API secret |
| `frappe_url` | string | No | Override default Frappe URL |

*Required unless environment variables are set

### Environment-Based Authentication

Set these environment variables:

| Variable | Description |
|----------|-------------|
| `FRAPPE_URL` | Default Frappe instance URL |
| `FRAPPE_API_KEY` | Default API key (fallback) |
| `FRAPPE_API_SECRET` | Default API secret (fallback) |

## Document Operations

### create_document

Creates a new document in Frappe.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `doctype` | string | Yes | The DocType to create |
| `values` | object | Yes | Field values for the new document |
| `api_key` | string | No* | API key for authentication |
| `api_secret` | string | No* | API secret for authentication |
| `frappe_url` | string | No | Frappe instance URL |

**Example:**
```javascript
{
  "name": "create_document",
  "arguments": {
    "doctype": "Customer",
    "values": {
      "customer_name": "John Doe",
      "customer_type": "Individual",
      "customer_group": "All Customer Groups",
      "territory": "All Territories",
      "email_id": "john@example.com"
    },
    "api_key": "your_api_key",
    "api_secret": "your_api_secret"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "CUST-00001",
    "customer_name": "John Doe",
    "creation": "2024-01-15 10:30:00",
    "...": "other fields"
  }
}
```

### get_document

Retrieves a specific document by name.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `doctype` | string | Yes | The DocType to retrieve |
| `name` | string | Yes | The document name/ID |
| `fields` | array | No | Specific fields to retrieve |
| `api_key` | string | No* | API key for authentication |
| `api_secret` | string | No* | API secret for authentication |
| `frappe_url` | string | No | Frappe instance URL |

**Example:**
```javascript
{
  "name": "get_document",
  "arguments": {
    "doctype": "Customer",
    "name": "CUST-00001",
    "fields": ["customer_name", "email_id", "phone", "status"],
    "api_key": "your_api_key",
    "api_secret": "your_api_secret"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "CUST-00001",
    "customer_name": "John Doe",
    "email_id": "john@example.com",
    "phone": "+1234567890",
    "status": "Active"
  }
}
```

### update_document

Updates an existing document.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `doctype` | string | Yes | The DocType to update |
| `name` | string | Yes | The document name/ID |
| `values` | object | Yes | Field values to update |
| `api_key` | string | No* | API key for authentication |
| `api_secret` | string | No* | API secret for authentication |
| `frappe_url` | string | No | Frappe instance URL |

**Example:**
```javascript
{
  "name": "update_document",
  "arguments": {
    "doctype": "Customer",
    "name": "CUST-00001",
    "values": {
      "phone": "+1987654321",
      "customer_group": "VIP Customers"
    },
    "api_key": "your_api_key",
    "api_secret": "your_api_secret"
  }
}
```

### delete_document

Deletes a document.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `doctype` | string | Yes | The DocType to delete from |
| `name` | string | Yes | The document name/ID |
| `api_key` | string | No* | API key for authentication |
| `api_secret` | string | No* | API secret for authentication |
| `frappe_url` | string | No | Frappe instance URL |

**Example:**
```javascript
{
  "name": "delete_document",
  "arguments": {
    "doctype": "Customer",
    "name": "CUST-00001",
    "api_key": "your_api_key",
    "api_secret": "your_api_secret"
  }
}
```

### list_documents

Lists documents with optional filtering and pagination.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `doctype` | string | Yes | The DocType to list |
| `fields` | array | No | Fields to include in results |
| `filters` | object | No | Filter conditions |
| `limit` | number | No | Maximum number of results (default: 20) |
| `offset` | number | No | Number of results to skip |
| `order_by` | string | No | Sort order (e.g., "creation desc") |
| `api_key` | string | No* | API key for authentication |
| `api_secret` | string | No* | API secret for authentication |
| `frappe_url` | string | No | Frappe instance URL |

**Filter Examples:**
```javascript
// Simple equality
"filters": {
  "status": "Active",
  "customer_type": "Individual"
}

// Comparison operators
"filters": {
  "creation": [">=", "2024-01-01"],
  "grand_total": [">", 1000]
}

// Pattern matching
"filters": {
  "customer_name": ["like", "%John%"],
  "email_id": ["not like", "%test%"]
}

// Multiple values (IN operator)
"filters": {
  "status": ["in", ["Active", "Pending"]]
}
```

**Example:**
```javascript
{
  "name": "list_documents",
  "arguments": {
    "doctype": "Sales Order",
    "fields": ["name", "customer", "grand_total", "status", "transaction_date"],
    "filters": {
      "status": ["in", ["Draft", "Pending"]],
      "grand_total": [">", 500],
      "transaction_date": [">=", "2024-01-01"]
    },
    "limit": 50,
    "order_by": "transaction_date desc",
    "api_key": "your_api_key",
    "api_secret": "your_api_secret"
  }
}
```

### search_documents

Performs full-text search across documents.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `doctype` | string | Yes | The DocType to search |
| `query` | string | Yes | Search query |
| `fields` | array | No | Fields to include in results |
| `limit` | number | No | Maximum number of results |
| `api_key` | string | No* | API key for authentication |
| `api_secret` | string | No* | API secret for authentication |
| `frappe_url` | string | No | Frappe instance URL |

**Example:**
```javascript
{
  "name": "search_documents",
  "arguments": {
    "doctype": "Customer",
    "query": "john doe email",
    "fields": ["name", "customer_name", "email_id"],
    "limit": 10,
    "api_key": "your_api_key",
    "api_secret": "your_api_secret"
  }
}
```

### count_documents

Counts documents matching specified criteria.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `doctype` | string | Yes | The DocType to count |
| `filters` | object | No | Filter conditions |
| `api_key` | string | No* | API key for authentication |
| `api_secret` | string | No* | API secret for authentication |
| `frappe_url` | string | No | Frappe instance URL |

**Example:**
```javascript
{
  "name": "count_documents",
  "arguments": {
    "doctype": "Sales Order",
    "filters": {
      "status": "Draft",
      "creation": [">=", "2024-01-01"]
    },
    "api_key": "your_api_key",
    "api_secret": "your_api_secret"
  }
}
```

## Schema Operations

### get_doctype_schema

Retrieves the schema/metadata for a DocType.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `doctype` | string | Yes | The DocType name |
| `api_key` | string | No* | API key for authentication |
| `api_secret` | string | No* | API secret for authentication |
| `frappe_url` | string | No | Frappe instance URL |

**Example:**
```javascript
{
  "name": "get_doctype_schema",
  "arguments": {
    "doctype": "Customer",
    "api_key": "your_api_key",
    "api_secret": "your_api_secret"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "Customer",
    "module": "Selling",
    "fields": [
      {
        "fieldname": "customer_name",
        "fieldtype": "Data",
        "label": "Customer Name",
        "reqd": 1,
        "in_list_view": 1
      },
      {
        "fieldname": "customer_type",
        "fieldtype": "Select",
        "label": "Customer Type",
        "options": "Individual\nCompany",
        "default": "Individual"
      }
    ],
    "permissions": [...],
    "links": [...]
  }
}
```

### list_doctypes

Lists all available DocTypes.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `module` | string | No | Filter by module |
| `custom` | boolean | No | Include only custom DocTypes |
| `api_key` | string | No* | API key for authentication |
| `api_secret` | string | No* | API secret for authentication |
| `frappe_url` | string | No | Frappe instance URL |

**Example:**
```javascript
{
  "name": "list_doctypes",
  "arguments": {
    "module": "Selling",
    "api_key": "your_api_key",
    "api_secret": "your_api_secret"
  }
}
```

### get_field_options

Retrieves options for Select, Link, and other option-based fields.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `doctype` | string | Yes | The DocType name |
| `fieldname` | string | Yes | The field name |
| `api_key` | string | No* | API key for authentication |
| `api_secret` | string | No* | API secret for authentication |
| `frappe_url` | string | No | Frappe instance URL |

**Example:**
```javascript
{
  "name": "get_field_options",
  "arguments": {
    "doctype": "Customer",
    "fieldname": "customer_group",
    "api_key": "your_api_key",
    "api_secret": "your_api_secret"
  }
}
```

## Common Parameters

### Pagination

Most list operations support pagination:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 20 | Maximum results per page |
| `offset` | number | 0 | Number of results to skip |

### Sorting

Use the `order_by` parameter for sorting:

```javascript
"order_by": "creation desc"        // Sort by creation date, newest first
"order_by": "name asc"            // Sort by name, A-Z
"order_by": "modified desc"       // Sort by last modified
"order_by": "grand_total desc"    // Sort by amount, highest first
```

### Field Selection

Use the `fields` parameter to limit returned data:

```javascript
"fields": ["name", "customer_name", "email_id"]  // Only these fields
"fields": ["*"]                                  // All fields (default)
```

## Response Formats

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "message": "Optional success message"
}
```

### List Response

```json
{
  "success": true,
  "data": [
    { /* document 1 */ },
    { /* document 2 */ },
    // ...
  ],
  "total_count": 150,
  "returned_count": 20
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "error_code": "PERMISSION_DENIED",
  "details": {
    // Additional error details
  }
}
```

## Error Handling

### Common Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| `AUTHENTICATION_FAILED` | Invalid credentials | Check API key and secret |
| `PERMISSION_DENIED` | Insufficient permissions | Verify user roles in Frappe |
| `DOCUMENT_NOT_FOUND` | Document doesn't exist | Check document name/ID |
| `VALIDATION_ERROR` | Invalid field values | Review field requirements |
| `NETWORK_ERROR` | Connection issues | Check Frappe URL and connectivity |
| `RATE_LIMIT_EXCEEDED` | Too many requests | Implement request throttling |

### Error Response Details

Errors include helpful context:

```json
{
  "success": false,
  "error": "Validation Error",
  "error_code": "VALIDATION_ERROR",
  "details": {
    "doctype": "Customer",
    "field_errors": {
      "email_id": "Invalid email format",
      "customer_name": "This field is required"
    }
  }
}
```

### Handling Authentication Errors

When using per-request authentication, handle missing credentials gracefully:

```javascript
// Check for authentication parameters
if (!api_key || !api_secret) {
  return {
    success: false,
    error: "Missing required authentication: api_key and api_secret are required",
    error_code: "AUTHENTICATION_REQUIRED"
  };
}
```

## Best Practices

### 1. Error Handling

Always check the `success` field in responses:

```javascript
const response = await callTool("get_document", {
  doctype: "Customer",
  name: "CUST-00001",
  api_key: "your_key",
  api_secret: "your_secret"
});

if (!response.success) {
  console.error("Error:", response.error);
  return;
}

// Use response.data
console.log("Customer:", response.data.customer_name);
```

### 2. Pagination

For large datasets, use pagination:

```javascript
let offset = 0;
const limit = 100;
let allDocuments = [];

while (true) {
  const response = await callTool("list_documents", {
    doctype: "Sales Order",
    limit: limit,
    offset: offset,
    api_key: "your_key",
    api_secret: "your_secret"
  });
  
  if (!response.success || response.data.length === 0) {
    break;
  }
  
  allDocuments.push(...response.data);
  offset += limit;
}
```

### 3. Field Selection

Only request needed fields for better performance:

```javascript
// Good - only get needed fields
{
  "name": "list_documents",
  "arguments": {
    "doctype": "Customer",
    "fields": ["name", "customer_name", "email_id"],
    "limit": 100
  }
}

// Avoid - getting all fields when not needed
{
  "name": "list_documents",
  "arguments": {
    "doctype": "Customer",
    "limit": 100
  }
}
```

### 4. Filtering

Use specific filters to reduce data transfer:

```javascript
// Good - specific filters
"filters": {
  "status": "Active",
  "creation": [">=", "2024-01-01"],
  "customer_type": "Company"
}

// Avoid - no filters on large datasets
"filters": {}
```

## Rate Limits

The server respects Frappe's rate limiting. If you encounter rate limit errors:

1. Implement exponential backoff
2. Reduce request frequency
3. Use pagination to process data in smaller chunks
4. Consider caching frequently accessed data

## Version Compatibility

This API reference is compatible with:

- Frappe Framework v13+
- ERPNext v13+
- Custom Frappe applications

Some features may not be available in older versions. Check your Frappe instance version if you encounter compatibility issues. 