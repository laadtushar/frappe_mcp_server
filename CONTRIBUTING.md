# Contributing to Frappe MCP Server

Thank you for your interest in contributing to the Frappe MCP Server! This document provides guidelines and information for contributors.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Code Style](#code-style)
- [Reporting Issues](#reporting-issues)

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- TypeScript knowledge
- Basic understanding of Frappe Framework
- Familiarity with Model Context Protocol (MCP)

### Development Setup

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/frappe-mcp-server.git
   cd frappe-mcp-server
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Build the project:
   ```bash
   npm run build
   ```

5. Set up your development environment:
   ```bash
   # Copy the example configuration
   cp claude_desktop_config.json.example claude_desktop_config.json
   # Edit with your Frappe instance details
   ```

## Project Structure

```
frappe_mcp_server/
├── src/                    # Source code
│   ├── index.ts           # Main server entry point
│   ├── api-client.ts      # Frappe API client
│   ├── auth.ts            # Authentication handling
│   ├── document-api.ts    # Document operations
│   ├── document-operations.ts # Document MCP tools
│   ├── schema-api.ts      # Schema operations
│   ├── schema-operations.ts   # Schema MCP tools
│   ├── frappe-helpers.ts  # Helper functions
│   └── server_hints/      # Server hints and instructions
├── docs/                  # Documentation
├── examples/              # Usage examples
├── build/                 # Compiled JavaScript (generated)
└── tests/                 # Test files (future)
```

## Making Changes

### Branch Naming

Use descriptive branch names:
- `feature/add-new-tool` - for new features
- `fix/authentication-bug` - for bug fixes
- `docs/update-readme` - for documentation updates
- `refactor/api-client` - for refactoring

### Commit Messages

Follow conventional commit format:
- `feat: add support for custom fields`
- `fix: resolve authentication timeout issue`
- `docs: update multi-user setup guide`
- `refactor: simplify error handling`

### Code Changes

1. **Adding New Tools**: 
   - Add the tool definition in the appropriate operations file
   - Implement the API function in the corresponding API file
   - Update documentation and examples

2. **Modifying Authentication**:
   - Ensure backward compatibility
   - Update both per-request and environment-based auth
   - Test with multiple scenarios

3. **API Changes**:
   - Maintain compatibility with existing Frappe versions
   - Add proper error handling
   - Include comprehensive JSDoc comments

## Testing

### Manual Testing

1. Start a local Frappe instance
2. Build and run the MCP server:
   ```bash
   npm run build
   npm start
   ```

3. Test with different authentication methods:
   - Environment variables
   - Per-request credentials
   - Mixed scenarios

### Test Scenarios

- [ ] Server starts without environment variables
- [ ] Server starts with environment variables
- [ ] Per-request authentication works
- [ ] Environment authentication works
- [ ] Error handling for invalid credentials
- [ ] Multi-user scenarios
- [ ] Different Frappe instances

### Future: Automated Testing

We plan to add automated tests. Contributions for test setup are welcome!

## Submitting Changes

### Pull Request Process

1. Ensure your code follows the project style
2. Update documentation if needed
3. Add examples for new features
4. Test your changes thoroughly
5. Create a pull request with:
   - Clear title and description
   - Reference any related issues
   - List of changes made
   - Testing performed

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Testing
- [ ] Tested with environment auth
- [ ] Tested with per-request auth
- [ ] Tested error scenarios
- [ ] Updated documentation

## Checklist
- [ ] Code follows project style
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Examples added/updated
```

## Code Style

### TypeScript Guidelines

- Use TypeScript strict mode
- Provide proper type definitions
- Use interfaces for complex objects
- Add JSDoc comments for public functions

### Formatting

- Use 2 spaces for indentation
- Use semicolons
- Use single quotes for strings
- Maximum line length: 100 characters

### Error Handling

- Always provide meaningful error messages
- Include context in error responses
- Use proper HTTP status codes
- Log errors appropriately

### Example Code Style

```typescript
/**
 * Creates a new document in Frappe
 * @param doctype - The DocType name
 * @param values - Document field values
 * @param credentials - Optional authentication credentials
 * @returns Promise with created document data
 */
export async function createDocument(
  doctype: string,
  values: Record<string, any>,
  credentials?: AuthCredentials
): Promise<any> {
  try {
    const client = createFrappeClient(credentials);
    const response = await client.post(`/api/resource/${doctype}`, values);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to create ${doctype}: ${error.message}`);
  }
}
```

## Reporting Issues

### Bug Reports

Include:
- Frappe version
- Node.js version
- MCP server version
- Steps to reproduce
- Expected vs actual behavior
- Error messages/logs
- Configuration (without sensitive data)

### Feature Requests

Include:
- Use case description
- Proposed solution
- Alternative solutions considered
- Additional context

### Security Issues

For security vulnerabilities, please email directly instead of creating public issues.

## Development Tips

### Debugging

1. Use TypeScript compiler for type checking:
   ```bash
   npx tsc --noEmit
   ```

2. Enable debug logging:
   ```bash
   DEBUG=* npm start
   ```

3. Test with different Frappe versions and configurations

### Documentation

- Keep README.md updated
- Add JSDoc comments to functions
- Update examples when adding features
- Include configuration examples

## Community

- Be respectful and inclusive
- Help others learn and contribute
- Share knowledge and best practices
- Provide constructive feedback

## Questions?

- Create an issue for general questions
- Check existing issues and documentation first
- Provide context and details in questions

Thank you for contributing to make Frappe MCP Server better for everyone! 