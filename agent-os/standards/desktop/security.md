## Desktop app security best practices

- **Context Isolation**: Enable context isolation (Electron) to prevent renderer access to Node
- **Sandbox**: Enable sandbox mode for renderer processes
- **CSP**: Implement Content Security Policy
- **Node Integration**: Disable nodeIntegration in renderer processes
- **Remote Module**: Avoid using remote module (deprecated in Electron)
- **Secure IPC**: Validate all IPC messages from renderer
- **Input Validation**: Validate and sanitize all user inputs
- **XSS Prevention**: Prevent XSS in webviews and renderer content
- **External Links**: Open external links in browser, not in app
- **Code Signing**: Sign app bundles on macOS and Windows
- **Auto-Update Security**: Verify update signatures before installing
- **Secrets Management**: Never expose API keys or secrets in renderer
- **Secure Storage**: Encrypt sensitive data at rest
- **HTTPS Only**: Only make HTTPS requests; no HTTP
- **Permission Model**: Request minimum necessary OS permissions
