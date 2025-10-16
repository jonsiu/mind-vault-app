## Desktop app error handling

- **Global Error Handler**: Implement global error handler for uncaught exceptions
- **Process Crashes**: Handle renderer and main process crashes gracefully
- **Error Reporting**: Integrate error reporting (Sentry, Bugsnag)
- **User-Friendly Messages**: Show user-friendly error messages
- **Error Recovery**: Attempt recovery when possible; offer restart option
- **Crash Reports**: Generate and send crash reports with user consent
- **Logging**: Log errors to file for debugging
- **Debug Mode**: Provide debug mode for detailed error information
- **Graceful Degradation**: Degrade gracefully when features fail
- **Network Errors**: Handle offline and network error scenarios
- **File System Errors**: Handle permission denied, disk full, etc.
- **Update Errors**: Handle update failures gracefully
- **Error Dialogs**: Use native error dialogs for critical errors
- **Stack Traces**: Capture and log stack traces for debugging
