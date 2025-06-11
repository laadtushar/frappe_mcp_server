# Local Development Setup Guide

This guide explains how to set up and run the Frappe MCP Server from a local cloned repository instead of using the published npm package.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Repository Setup](#repository-setup)
3. [Building the Project](#building-the-project)
4. [Claude Desktop Configuration](#claude-desktop-configuration)
5. [Testing the Setup](#testing-the-setup)
6. [Development Workflow](#development-workflow)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** (comes with Node.js)
- **Git** (for cloning the repository)
- **Claude Desktop** application

## Repository Setup

### Step 1: Clone the Repository

```bash
# Clone the repository to your desired location
git clone https://github.com/your-username/frappe_mcp_server.git

# Navigate to the project directory
cd frappe_mcp_server
```

### Step 2: Install Dependencies

```bash
# Install all required dependencies
npm install
```

This will install all the packages listed in `package.json`, including:
- TypeScript compiler
- Frappe JS SDK
- MCP SDK
- Other development dependencies

### Step 3: Verify Installation

```bash
# Check if TypeScript is available
npx tsc --version

# Check if all dependencies are installed
npm list --depth=0
```

## Building the Project

### Step 1: Compile TypeScript

```bash
# Build the project (compiles TypeScript to JavaScript)
npm run build
```

This command:
- Compiles all TypeScript files in the `src/` directory
- Outputs JavaScript files to the `build/` directory
- Generates source maps for debugging

### Step 2: Verify Build Output

```bash
# Check if build directory was created
ls -la build/

# You should see files like:
# - index.js (main entry point)
# - api-client.js
# - document-api.js
# - schema-api.js
# - etc.
```

### Step 3: Test the Build

```bash
# Test if the server starts without errors
node build/index.js
```

You should see output like:
```
[AUTH] Initializing Frappe JS SDK with URL: http://localhost:8000
[AUTH] INFO: Environment credentials not available. Server will use per-request authentication only.
Starting Frappe MCP server...
Frappe MCP server running on stdio
```

Press `Ctrl+C` to stop the server.

## Claude Desktop Configuration

### Step 1: Locate Your Configuration File

The Claude Desktop configuration file is located at:

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

**macOS:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Linux:**
```
~/.config/Claude/claude_desktop_config.json
```

### Step 2: Configure for Local Repository

Replace the content of your `claude_desktop_config.json` with:

```json
{
  "mcpServers": {
    "frappe": {
      "command": "node",
      "args": ["build/index.js"],
      "cwd": "/absolute/path/to/your/frappe_mcp_server",
      "env": {
        "FRAPPE_URL": "http://127.0.0.1:8000"
      },
      "disabled": false,
      "alwaysAllow": []
    }
  }
}
```

**Important:** Replace `/absolute/path/to/your/frappe_mcp_server` with the actual absolute path to your cloned repository.

### Step 3: Path Examples

**Windows Example:**
```json
{
  "mcpServers": {
    "frappe": {
      "command": "node",
      "args": ["build/index.js"],
      "cwd": "C:\\Users\\YourName\\Projects\\frappe_mcp_server",
      "env": {
        "FRAPPE_URL": "http://127.0.0.1:8000"
      },
      "disabled": false,
      "alwaysAllow": []
    }
  }
}
```

**macOS/Linux Example:**
```json
{
  "mcpServers": {
    "frappe": {
      "command": "node",
      "args": ["build/index.js"],
      "cwd": "/home/yourname/projects/frappe_mcp_server",
      "env": {
        "FRAPPE_URL": "http://127.0.0.1:8000"
      },
      "disabled": false,
      "alwaysAllow": []
    }
  }
}
```

### Step 4: Configuration with Environment Credentials (Optional)

If you want to use environment-based authentication:

```json
{
  "mcpServers": {
    "frappe": {
      "command": "node",
      "args": ["build/index.js"],
      "cwd": "/absolute/path/to/your/frappe_mcp_server",
      "env": {
        "FRAPPE_URL": "http://127.0.0.1:8000",
        "FRAPPE_API_KEY": "your_api_key_here",
        "FRAPPE_API_SECRET": "your_api_secret_here"
      },
      "disabled": false,
      "alwaysAllow": []
    }
  }
}
```

## Testing the Setup

### Step 1: Restart Claude Desktop

After updating the configuration:
1. Completely quit Claude Desktop
2. Restart the application
3. Wait for it to fully load

### Step 2: Check Server Status

In Claude Desktop, you can ask:
> "Can you list the available MCP tools?"

You should see Frappe-related tools like:
- `create_document`
- `get_document`
- `list_documents`
- `get_doctype_schema`
- etc.

### Step 3: Test a Simple Operation

Try a schema request:
> "Can you get the schema for the User doctype in Frappe?"

If using per-request authentication, provide your credentials:
> "Get the Customer doctype schema using API key 'your_key' and secret 'your_secret'"

### Step 4: Check Server Logs

If you need to debug, you can run the server manually to see logs:

```bash
cd /path/to/your/frappe_mcp_server
node build/index.js
```

## Development Workflow

### Making Changes

1. **Edit Source Files**: Make changes to TypeScript files in the `src/` directory
2. **Rebuild**: Run `npm run build` to compile changes
3. **Restart Claude**: Restart Claude Desktop to pick up changes
4. **Test**: Verify your changes work as expected

### Continuous Development

For active development, you can use:

```bash
# Watch for changes and rebuild automatically
npm run build -- --watch
```

This will automatically rebuild when you save changes to TypeScript files.

### Adding New Features

1. Create new TypeScript files in appropriate directories
2. Update exports in `src/index.ts` if needed
3. Add new tool definitions to operation files
4. Build and test

## Troubleshooting

### Common Issues

#### 1. "Command not found" Error

**Error:** Claude Desktop shows "Command not found: node"

**Solution:**
- Ensure Node.js is installed and in your system PATH
- Try using the full path to node:
  ```json
  "command": "/usr/local/bin/node"  // macOS/Linux
  "command": "C:\\Program Files\\nodejs\\node.exe"  // Windows
  ```

#### 2. "Cannot find module" Error

**Error:** `Error: Cannot find module 'build/index.js'`

**Solution:**
- Ensure you've run `npm run build`
- Check that the `build/` directory exists
- Verify the `cwd` path is correct in your configuration

#### 3. "Permission Denied" Error

**Error:** Permission denied when running the server

**Solution:**
- Check file permissions: `chmod +x build/index.js`
- Ensure the directory is readable
- Try running with full paths

#### 4. TypeScript Compilation Errors

**Error:** Build fails with TypeScript errors

**Solution:**
```bash
# Clean and rebuild
rm -rf build/
npm run build

# Check for syntax errors
npx tsc --noEmit
```

#### 5. Port Already in Use

**Error:** Server fails to start due to port conflicts

**Solution:**
- The MCP server uses stdio, not HTTP ports
- If you see port errors, check if another Frappe instance is running
- Ensure your `FRAPPE_URL` points to the correct Frappe instance

### Debug Mode

Enable detailed logging:

```bash
# Set debug environment variable
DEBUG=frappe-mcp-server node build/index.js
```

### Checking Configuration

Verify your Claude Desktop configuration:

```bash
# On macOS/Linux
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json

# On Windows
type %APPDATA%\Claude\claude_desktop_config.json
```

### Testing Without Claude Desktop

You can test the server directly:

```bash
# Start the server
node build/index.js

# In another terminal, send a test message
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}' | node build/index.js
```

## Advanced Configuration

### Using Different Node Versions

If you have multiple Node.js versions:

```json
{
  "mcpServers": {
    "frappe": {
      "command": "/path/to/specific/node/version",
      "args": ["build/index.js"],
      "cwd": "/path/to/frappe_mcp_server"
    }
  }
}
```

### Environment-Specific Configurations

You can create different configurations for different environments:

```json
{
  "mcpServers": {
    "frappe-dev": {
      "command": "node",
      "args": ["build/index.js"],
      "cwd": "/path/to/frappe_mcp_server",
      "env": {
        "FRAPPE_URL": "http://localhost:8000",
        "NODE_ENV": "development"
      }
    },
    "frappe-staging": {
      "command": "node",
      "args": ["build/index.js"],
      "cwd": "/path/to/frappe_mcp_server",
      "env": {
        "FRAPPE_URL": "https://staging.example.com",
        "NODE_ENV": "staging"
      }
    }
  }
}
```

## Next Steps

- Review the [Multi-User Guide](./MULTI_USER_GUIDE.md) for authentication options
- Check the [API Reference](./API_REFERENCE.md) for available tools
- Explore the [examples](../examples/) directory for usage patterns
- Consider contributing improvements back to the repository

## Getting Help

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section above
2. Review the server logs for error messages
3. Verify your Frappe instance is running and accessible
4. Check that your API credentials are valid
5. Open an issue on GitHub with detailed error information 