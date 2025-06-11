# Frappe MCP Server

A Model Context Protocol (MCP) server for Frappe Framework that exposes Frappe's functionality to AI assistants through the official REST API, with a focus on document CRUD operations, schema handling, and detailed API instructions.

## Overview

This MCP server allows AI assistants to interact with Frappe applications through a standardized interface using the official Frappe REST API. It provides tools for:

- Document operations (create, read, update, delete, list)
- Schema and metadata handling
- DocType discovery and exploration
- Detailed API usage instructions and examples

The server includes comprehensive error handling, validation, and helpful responses to make it easier for AI assistants to work with Frappe.

## Installation

### Prerequisites

- Node.js 18 or higher
- A running Frappe instance (version 15 or higher)
- API key and secret from Frappe (provided per request or via environment variables)

### Setup

1. Install via npm:

```bash
npm install -g frappe-mcp-server
```

Alternatively, run directly with npx:

```bash
npx frappe-mcp-server
```

(no installation needed)

## Configuration

The server supports two authentication modes:

### 1. Per-Request Authentication (Recommended for Multi-User)

Users provide their API credentials with each request. This allows multiple users to use the same server installation with their own credentials.

**Environment variables (optional):**
- `FRAPPE_URL`: The URL of your Frappe instance (default: `http://localhost:8000`)

**Per-request parameters:**
- `api_key`: Your Frappe API key (**required in each request**)
- `api_secret`: Your Frappe API secret (**required in each request**)
- `frappe_url`: Frappe instance URL (optional, defaults to server configuration)

### 2. Environment-Based Authentication (Legacy)

Set credentials as environment variables for all requests:

- `FRAPPE_URL`: The URL of your Frappe instance (default: `http://localhost:8000`)
- `FRAPPE_API_KEY`: Your Frappe API key
- `FRAPPE_API_SECRET`: Your Frappe API secret

> **Note**: Per-request authentication takes precedence over environment variables when both are provided.

### Authentication

This MCP server **only supports API key/secret authentication** via the Frappe REST API. Username/password authentication is not supported.

#### Getting API Credentials

To get API credentials from your Frappe instance:

1. Go to User > API Access > New API Key
2. Select the user for whom you want to create the key
3. Click "Generate Keys"
4. Copy the API Key and API Secret

#### Multi-User Setup

For organizations where multiple users need to access Frappe through the same MCP server installation:

1. Each user gets their own API key/secret from the Frappe instance
2. Users provide their credentials with each request
3. No server-side credential storage required
4. Each user's permissions are enforced by Frappe based on their API key

#### Authentication Troubleshooting

If you encounter authentication errors:

1. Verify that both `api_key` and `api_secret` are provided in the request
2. Ensure the API key is active and not expired in your Frappe instance
3. Check that the user associated with the API key has the necessary permissions
4. Verify the Frappe URL is correct and accessible

The server provides detailed error messages to help diagnose authentication issues.

## Usage

### Starting the Server

```bash
npx frappe-mcp-server
```

Or with environment variables (optional):

```bash
FRAPPE_URL=https://your-frappe-instance.com npx frappe-mcp-server
```

### Integrating with AI Assistants

To use this MCP server with an AI assistant, you need to configure the assistant to connect to this server. The exact configuration depends on the AI assistant platform you're using.

#### For Claude (Per-Request Authentication)

Add the following to your MCP settings configuration file:

```json
{
  "mcpServers": {
    "frappe": {
      "command": "npx",
      "args": ["frappe-mcp-server"],
      "env": {
        "FRAPPE_URL": "https://your-frappe-instance.com"
      },
      "disabled": false,
      "alwaysAllow": []
    }
  }
}
```

#### For Claude (Environment-Based Authentication - Legacy)

```json
{
  "mcpServers": {
    "frappe": {
      "command": "npx",
      "args": ["frappe-mcp-server"],
      "env": {
        "FRAPPE_URL": "https://your-frappe-instance.com",
        "FRAPPE_API_KEY": "your_api_key",
        "FRAPPE_API_SECRET": "your_api_secret"
      },
      "disabled": false,
      "alwaysAllow": []
    }
  }
}
```

### Using Per-Request Authentication

When using per-request authentication, include your credentials in each tool call:

```javascript
// Example tool call with per-request authentication
{
  "name": "create_document",
  "arguments": {
    "doctype": "Customer",
    "values": {
      "customer_name": "John Doe",
      "customer_type": "Individual"
    },
    "api_key": "your_api_key_here",
    "api_secret": "your_api_secret_here",
    "frappe_url": "https://your-frappe-instance.com"  // optional
  }
}
```

## Available Tools

### Document Operations

- `create_document`: Create a new document in Frappe
- `get_document`: Retrieve a document from Frappe
- `update_document`: Update an existing document in Frappe
- `delete_document`: Delete a document from Frappe
- `list_documents`: List documents with filters and pagination

### Schema Operations

- `get_doctype_schema`: Get complete schema for a DocType
- `get_field_options`: Get available options for Link/Select fields
- `get_frappe_usage_info`: Get usage guidance and hints

### Helper Tools

- `get_instructions`: Get comprehensive API usage instructions
- `get_required_fields`: Get required fields for a DocType

All tools now support per-request authentication by including `api_key`, `api_secret`, and optionally `frappe_url` parameters.

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:

- Setting up the development environment
- Code style and standards
- Testing procedures
- Submitting pull requests

### Quick Start for Contributors

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/frappe_mcp_server.git`
3. Install dependencies: `npm install`
4. Build the project: `npm run build`
5. Make your changes and test them
6. Submit a pull request

## Support

- **Documentation**: Check our comprehensive [docs/](docs/) directory
- **Issues**: Report bugs or request features on [GitHub Issues](https://github.com/appliedrelevance/frappe_mcp_server/issues)
- **Discussions**: Join conversations on [GitHub Discussions](https://github.com/appliedrelevance/frappe_mcp_server/discussions)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Multi-User Benefits

The per-request authentication model provides several advantages:

1. **Security**: No credential storage on the server
2. **Scalability**: Single server instance supports unlimited users
3. **Permissions**: Each user's Frappe permissions are respected
4. **Isolation**: Users can only access data they have permissions for
5. **Flexibility**: Users can connect to different Frappe instances

## Migration from Environment-Based Auth

Existing setups using environment variables will continue to work. To migrate to per-request authentication:

1. Remove `FRAPPE_API_KEY` and `FRAPPE_API_SECRET` from environment variables
2. Update your client code to include credentials in each request
3. Keep `FRAPPE_URL` in environment variables as a default (optional)

## Error Handling

The server provides detailed error messages for authentication issues:

- Missing credentials (either in request or environment)
- Invalid credentials
- Permission errors
- Network connectivity issues

## Security Considerations

- API keys and secrets are transmitted with each request
- Use HTTPS for production deployments
- Regularly rotate API keys
- Monitor API key usage in Frappe
- Consider network-level security for server access

## Examples

See the `examples/` directory for sample implementations and usage patterns.

## Contributing

Contributions are welcome! Please read the contributing guidelines and submit pull requests for any improvements.

## License

ISC License
