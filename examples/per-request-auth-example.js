/**
 * Example: Using Frappe MCP Server with Per-Request Authentication
 * 
 * This example demonstrates how multiple users can use the same MCP server
 * installation by providing their own API credentials with each request.
 */

// Example tool calls with per-request authentication

// User 1 creates a customer
const user1CreateCustomer = {
  name: "create_document",
  arguments: {
    doctype: "Customer",
    values: {
      customer_name: "John Doe",
      customer_type: "Individual",
      customer_group: "All Customer Groups",
      territory: "All Territories"
    },
    api_key: "user1_api_key_here",
    api_secret: "user1_api_secret_here",
    frappe_url: "https://user1-frappe.com"  // Optional: different Frappe instance
  }
};

// User 2 creates a supplier (different credentials, different instance)
const user2CreateSupplier = {
  name: "create_document",
  arguments: {
    doctype: "Supplier",
    values: {
      supplier_name: "ABC Corp",
      supplier_type: "Company",
      supplier_group: "All Supplier Groups"
    },
    api_key: "user2_api_key_here",
    api_secret: "user2_api_secret_here",
    frappe_url: "https://user2-frappe.com"  // Different Frappe instance
  }
};

// User 1 gets their customer list
const user1ListCustomers = {
  name: "list_documents",
  arguments: {
    doctype: "Customer",
    filters: {
      customer_type: "Individual"
    },
    fields: ["name", "customer_name", "email_id"],
    limit: 10,
    api_key: "user1_api_key_here",
    api_secret: "user1_api_secret_here"
    // frappe_url is optional - will use server default
  }
};

// User 2 gets schema information
const user2GetSchema = {
  name: "get_doctype_schema",
  arguments: {
    doctype: "Purchase Order",
    api_key: "user2_api_key_here",
    api_secret: "user2_api_secret_here"
  }
};

// User 3 gets field options (yet another user)
const user3GetFieldOptions = {
  name: "get_field_options",
  arguments: {
    doctype: "Sales Order",
    fieldname: "customer",
    filters: {
      customer_type: "Company"
    },
    api_key: "user3_api_key_here",
    api_secret: "user3_api_secret_here",
    frappe_url: "https://company-erp.example.com"
  }
};

/**
 * Benefits of Per-Request Authentication:
 * 
 * 1. Security: No credentials stored on the server
 * 2. Multi-tenancy: Each user can connect to their own Frappe instance
 * 3. Permissions: Each user's Frappe permissions are enforced
 * 4. Scalability: Single server supports unlimited users
 * 5. Isolation: Users can only access their own data
 * 
 * Server Configuration (claude_desktop_config.json):
 * {
 *   "mcpServers": {
 *     "frappe": {
 *       "command": "npx",
 *       "args": ["frappe-mcp-server"],
 *       "env": {
 *         "FRAPPE_URL": "https://default-frappe.com"  // Optional default
 *       },
 *       "disabled": false,
 *       "alwaysAllow": []
 *     }
 *   }
 * }
 * 
 * Migration from Environment-Based Auth:
 * 
 * Old way (environment variables):
 * - FRAPPE_API_KEY=your_key
 * - FRAPPE_API_SECRET=your_secret
 * - All users share the same credentials
 * 
 * New way (per-request):
 * - Each user provides their own api_key and api_secret
 * - No shared credentials
 * - Better security and isolation
 */

export {
  user1CreateCustomer,
  user2CreateSupplier,
  user1ListCustomers,
  user2GetSchema,
  user3GetFieldOptions
}; 