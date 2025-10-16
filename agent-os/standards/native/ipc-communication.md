## Inter-process communication (IPC)

- **IPC Architecture**: Use IPC for main/renderer communication (Electron) or frontend/backend (Tauri)
- **Message Protocol**: Define clear IPC message protocol
- **Type Safety**: Use TypeScript for type-safe IPC messages
- **Request/Response**: Implement request/response pattern for IPC
- **Error Handling**: Handle IPC errors gracefully
- **Message Validation**: Validate IPC messages from untrusted contexts
- **Async Communication**: Use async IPC patterns
- **Channels**: Organize IPC into logical channels
- **Events**: Use event emitters for one-way communication
- **Streaming**: Support streaming data over IPC for large payloads
- **Security**: Never expose privileged APIs directly to renderer
- **Preload Scripts**: Use preload scripts to expose safe IPC APIs (Electron)
- **Commands**: Use command pattern for Tauri IPC
- **State Sync**: Sync state between processes when needed
