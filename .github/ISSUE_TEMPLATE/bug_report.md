---
name: Bug report
about: Create a report to help us improve
title: '[BUG] '
labels: bug
assignees: ''
---

## Bug Description
A clear and concise description of what the bug is.

## Environment
- **Frappe MCP Server Version**: [e.g., 1.0.0]
- **Node.js Version**: [e.g., 18.17.0]
- **Frappe Version**: [e.g., 15.0.0]
- **Operating System**: [e.g., Ubuntu 22.04, Windows 11, macOS 13]
- **AI Assistant**: [e.g., Claude Desktop, other MCP client]

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
A clear and concise description of what you expected to happen.

## Actual Behavior
A clear and concise description of what actually happened.

## Error Messages/Logs
```
Paste any error messages or relevant log output here
```

## Configuration
**MCP Configuration** (remove sensitive information):
```json
{
  "mcpServers": {
    "frappe": {
      "command": "npx",
      "args": ["frappe-mcp-server"],
      "env": {
        "FRAPPE_URL": "https://your-instance.com"
      }
    }
  }
}
```

**Authentication Method**:
- [ ] Environment variables
- [ ] Per-request credentials
- [ ] Mixed/hybrid

## Screenshots
If applicable, add screenshots to help explain your problem.

## Additional Context
Add any other context about the problem here.

## Possible Solution
If you have ideas on how to fix this, please describe them here.

## Checklist
- [ ] I have searched existing issues to ensure this is not a duplicate
- [ ] I have provided all the requested information
- [ ] I have removed any sensitive information from logs/configuration 