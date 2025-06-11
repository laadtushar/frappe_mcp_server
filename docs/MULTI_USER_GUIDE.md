# Multi-User Guide for Frappe MCP Server

This guide explains how to set up and use the Frappe MCP Server in multi-user environments where multiple users need to access Frappe with their own credentials.

## Table of Contents

1. [Overview](#overview)
2. [Authentication Methods](#authentication-methods)
3. [Setup Guide](#setup-guide)
4. [Usage Examples](#usage-examples)
5. [Migration Guide](#migration-guide)
6. [Security Best Practices](#security-best-practices)
7. [Troubleshooting](#troubleshooting)

## Overview

The Frappe MCP Server now supports **per-request authentication**, allowing multiple users to use the same server installation while maintaining individual access control and permissions. This enables:

- **Multi-tenancy**: Multiple users with different Frappe accounts
- **Multi-instance**: Users connecting to different Frappe installations
- **Enhanced Security**: No shared credentials or server-side storage
- **Individual Permissions**: Each user's Frappe permissions are respected
- **Scalability**: Single server supports unlimited users

## Authentication Methods

### 1. Per-Request Authentication (Recommended)

Users provide their API credentials with each request.

**Benefits:**
- ✅ No credential storage on server
- ✅ Individual user permissions
- ✅ Multi-instance support
- ✅ Better security isolation
- ✅ Scalable for enterprise use

**Configuration:**
```json
{
  "mcpServers": {
    "frappe": {
      "command": "npx",
      "args": ["frappe-mcp-server"],
      "env": {
        "FRAPPE_URL": "http://localhost:8000"
      },
      "disabled": false,
      "alwaysAllow": []
    }
  }
}
```

### 2. Environment-Based Authentication (Legacy)

Credentials are set as environment variables for all requests.

**Benefits:**
- ✅ Simpler setup for single-user scenarios
- ✅ No need to include credentials in each request
- ✅ Backward compatibility

**Configuration:**
```json
{
  "mcpServers": {
    "frappe": {
      "command": "npx",
      "args": ["frappe-mcp-server"],
      "env": {
        "FRAPPE_URL": "http://localhost:8000",
        "FRAPPE_API_KEY": "your_api_key",
        "FRAPPE_API_SECRET": "your_api_secret"
      },
      "disabled": false,
      "alwaysAllow": []
    }
  }
}
```

### 3. Hybrid Authentication

Environment variables provide fallback, per-request auth takes precedence.

**Configuration:**
```json
{
  "mcpServers": {
    "frappe": {
      "command": "npx",
      "args": ["frappe-mcp-server"],
      "env": {
        "FRAPPE_URL": "http://localhost:8000",
        "FRAPPE_API_KEY": "default_api_key",
        "FRAPPE_API_SECRET": "default_api_secret"
      },
      "disabled": false,
      "alwaysAllow": []
    }
  }
}
```

## Setup Guide

### Step 1: Install the Server

```bash
npm install -g frappe-mcp-server
```

### Step 2: Configure Claude Desktop

Create or update your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "frappe": {
      "command": "npx",
      "args": ["frappe-mcp-server"],
      "env": {
        "FRAPPE_URL": "http://localhost:8000"
      },
      "disabled": false,
      "alwaysAllow": []
    }
  }
}
```

### Step 3: Obtain API Credentials

Each user needs to get their API credentials from Frappe:

1. Log into your Frappe instance
2. Go to **User** → **API Access** → **New API Key**
3. Select the user for whom you want to create the key
4. Click **"Generate Keys"**
5. Copy the **API Key** and **API Secret**

### Step 4: Test the Setup

Use any document operation with your credentials:

```javascript
{
  "name": "get_doctype_schema",
  "arguments": {
    "doctype": "Customer",
    "api_key": "your_api_key_here",
    "api_secret": "your_api_secret_here"
  }
}
```

## Usage Examples

### Creating Documents

```javascript
{
  "name": "create_document",
  "arguments": {
    "doctype": "Customer",
    "values": {
      "customer_name": "John Doe",
      "customer_type": "Individual",
      "customer_group": "All Customer Groups",
      "territory": "All Territories"
    },
    "api_key": "your_api_key",
    "api_secret": "your_api_secret",
    "frappe_url": "https://your-frappe-instance.com"
  }
}
```

### Retrieving Documents

```javascript
{
  "name": "get_document",
  "arguments": {
    "doctype": "Customer",
    "name": "CUST-00001",
    "fields": ["customer_name", "email_id", "phone"],
    "api_key": "your_api_key",
    "api_secret": "your_api_secret"
  }
}
```

### Listing Documents with Filters

```javascript
{
  "name": "list_documents",
  "arguments": {
    "doctype": "Sales Order",
    "filters": {
      "status": "Draft",
      "customer": ["like", "%John%"]
    },
    "fields": ["name", "customer", "grand_total", "status"],
    "limit": 20,
    "order_by": "creation desc",
    "api_key": "your_api_key",
    "api_secret": "your_api_secret"
  }
}
```

### Getting Schema Information

```javascript
{
  "name": "get_doctype_schema",
  "arguments": {
    "doctype": "Sales Order",
    "api_key": "your_api_key",
    "api_secret": "your_api_secret"
  }
}
```

### Multi-Instance Usage

Users can connect to different Frappe instances:

```javascript
// User 1 connecting to Company A's Frappe
{
  "name": "create_document",
  "arguments": {
    "doctype": "Customer",
    "values": { "customer_name": "Company A Customer" },
    "api_key": "user1_api_key",
    "api_secret": "user1_api_secret",
    "frappe_url": "https://company-a.frappe.cloud"
  }
}

// User 2 connecting to Company B's Frappe
{
  "name": "create_document",
  "arguments": {
    "doctype": "Supplier",
    "values": { "supplier_name": "Company B Supplier" },
    "api_key": "user2_api_key",
    "api_secret": "user2_api_secret",
    "frappe_url": "https://company-b.frappe.cloud"
  }
}
```

## Migration Guide

### From Environment-Based to Per-Request Authentication

#### Step 1: Backup Current Configuration
Save your current `claude_desktop_config.json` file.

#### Step 2: Remove Environment Credentials
```json
{
  "mcpServers": {
    "frappe": {
      "command": "npx",
      "args": ["frappe-mcp-server"],
      "env": {
        "FRAPPE_URL": "http://localhost:8000"
        // Remove FRAPPE_API_KEY and FRAPPE_API_SECRET
      },
      "disabled": false,
      "alwaysAllow": []
    }
  }
}
```

#### Step 3: Update Client Code
Add credentials to each tool call:

**Before:**
```javascript
{
  "name": "create_document",
  "arguments": {
    "doctype": "Customer",
    "values": { "customer_name": "John Doe" }
  }
}
```

**After:**
```javascript
{
  "name": "create_document",
  "arguments": {
    "doctype": "Customer",
    "values": { "customer_name": "John Doe" },
    "api_key": "your_api_key",
    "api_secret": "your_api_secret"
  }
}
```

#### Step 4: Test with Multiple Users
Verify that different users can use their own credentials.

### Gradual Migration (Hybrid Approach)

Keep environment variables as fallback while enabling per-request auth:

```json
{
  "mcpServers": {
    "frappe": {
      "command": "npx",
      "args": ["frappe-mcp-server"],
      "env": {
        "FRAPPE_URL": "http://localhost:8000",
        "FRAPPE_API_KEY": "default_api_key",
        "FRAPPE_API_SECRET": "default_api_secret"
      },
      "disabled": false,
      "alwaysAllow": []
    }
  }
}
```

This allows:
- Existing code to work without changes (uses environment credentials)
- New code to use per-request authentication
- Gradual migration of users

## Security Best Practices

### 1. API Key Management

- **Rotate Keys Regularly**: Change API keys every 90 days
- **Use Unique Keys**: Each user should have their own API key
- **Monitor Usage**: Track API key usage in Frappe
- **Revoke Unused Keys**: Remove keys for inactive users

### 2. Network Security

- **Use HTTPS**: Always use HTTPS for production deployments
- **Network Isolation**: Consider VPN or private networks
- **Firewall Rules**: Restrict access to necessary ports only
- **Rate Limiting**: Implement rate limiting at the network level

### 3. Access Control

- **Principle of Least Privilege**: Grant minimum necessary permissions
- **Role-Based Access**: Use Frappe's role system effectively
- **Regular Audits**: Review user permissions regularly
- **Session Management**: Monitor active sessions

### 4. Monitoring and Logging

- **Log All Requests**: Enable comprehensive logging
- **Monitor Failed Attempts**: Track authentication failures
- **Alert on Anomalies**: Set up alerts for unusual activity
- **Regular Security Reviews**: Conduct periodic security assessments

## Troubleshooting

### Common Issues

#### 1. Authentication Errors

**Error:** "Missing required authentication: api_key and api_secret are required"

**Solution:**
- Ensure you're providing both `api_key` and `api_secret` in your request
- Check that the credentials are not empty or undefined
- Verify the API key is active in Frappe

#### 2. Permission Errors

**Error:** "You don't have permission to access this resource"

**Solution:**
- Check user permissions in Frappe
- Verify the user has the necessary roles
- Ensure the DocType permissions are correctly set

#### 3. Connection Errors

**Error:** "Network error during operation"

**Solution:**
- Verify the `frappe_url` is correct and accessible
- Check network connectivity
- Ensure Frappe instance is running
- Verify firewall settings

#### 4. Invalid Credentials

**Error:** "Authentication failed with status 401"

**Solution:**
- Verify API key and secret are correct
- Check if the API key has expired
- Ensure the user account is active
- Regenerate API credentials if necessary

### Debug Mode

Enable debug logging by setting environment variable:

```bash
DEBUG=frappe-mcp-server node build/index.js
```

### Server Logs

The server provides detailed logging for troubleshooting:

```
[AUTH] Creating Frappe client with URL: https://your-instance.com
[AUTH] API Key prefix: abcd...
[REQUEST] Making request to: /api/resource/Customer
[RESPONSE] Status: 200
```

### Testing Connectivity

Test your setup with a simple schema request:

```javascript
{
  "name": "get_doctype_schema",
  "arguments": {
    "doctype": "User",
    "api_key": "your_api_key",
    "api_secret": "your_api_secret"
  }
}
```

## Support

For additional support:

1. Check the [main README](../README.md) for general information
2. Review the [API documentation](./API_REFERENCE.md)
3. See [configuration examples](../claude_desktop_config_examples.json)
4. Open an issue on GitHub for bugs or feature requests

## Next Steps

- Explore the [API Reference](./API_REFERENCE.md) for detailed tool documentation
- Check out [examples](../examples/) for more usage patterns
- Review [security considerations](./SECURITY.md) for production deployments 