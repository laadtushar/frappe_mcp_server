# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-12-19

### Added
- **Multi-user authentication support**: Users can now provide API credentials with each request
- **Per-request authentication**: No need to store credentials on the server
- **Multi-instance support**: Connect to different Frappe instances per request
- **Hybrid authentication**: Support both environment variables and per-request credentials
- **Enhanced security**: No server-side credential storage required
- **Comprehensive documentation**: Multi-user guide, examples, and configuration templates
- **GitHub Actions CI/CD**: Automated building, testing, and releases
- **Contributing guidelines**: Detailed guide for contributors
- **Issue and PR templates**: Structured templates for better collaboration

### Changed
- **Breaking**: All MCP tools now require `api_key` and `api_secret` parameters when not using environment variables
- **Improved**: Better error messages and authentication troubleshooting
- **Enhanced**: More robust error handling throughout the application
- **Updated**: Package metadata and licensing (MIT)

### Security
- **Improved**: Per-request authentication eliminates need for server-side credential storage
- **Enhanced**: Better credential validation and error handling

### Documentation
- **Added**: Comprehensive multi-user setup guide
- **Added**: Configuration examples for different scenarios
- **Added**: Usage examples with per-request authentication
- **Updated**: README with multi-user features and contribution guidelines
- **Added**: Contributing guide with development setup instructions

### Technical
- **Fixed**: TypeScript compilation issues with module system
- **Improved**: Server startup handling when no environment credentials provided
- **Enhanced**: API client architecture for per-request instances
- **Added**: Proper npm package configuration for publication

## [0.2.16] - 2024-12-18

### Added
- Initial multi-user authentication implementation
- Basic per-request credential support

### Fixed
- Server startup issues
- Authentication flow improvements

## [0.2.x] - 2024-12-17

### Added
- Basic MCP server functionality
- Document CRUD operations
- Schema operations
- Environment-based authentication

### Features
- Document operations (create, read, update, delete, list)
- Schema and metadata handling
- DocType discovery and exploration
- Detailed API usage instructions and examples

---

## Release Notes

### Version 1.0.0 - Major Multi-User Release

This is a major release that transforms the Frappe MCP Server from a single-user tool to a comprehensive multi-user platform. The key innovation is **per-request authentication**, which allows multiple users to use the same server installation with their own credentials.

#### Key Benefits:
- **Enterprise Ready**: Multiple users can access their own Frappe data
- **Secure**: No credential storage on the server
- **Scalable**: Single server installation supports unlimited users
- **Flexible**: Connect to different Frappe instances per request
- **Backward Compatible**: Existing environment-based setups continue to work

#### Migration Guide:
- **Existing users**: No changes required if using environment variables
- **New multi-user setups**: Include `api_key` and `api_secret` in each tool call
- **Mixed environments**: Per-request credentials take precedence over environment variables

#### What's Next:
- Automated testing framework
- Performance optimizations
- Additional Frappe API endpoints
- Enhanced error reporting
- Community contributions and feedback 