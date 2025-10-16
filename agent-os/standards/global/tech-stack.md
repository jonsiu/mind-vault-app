## Tech stack for Desktop App projects

Define your technical stack below. This serves as a reference for all team members and helps maintain consistency across the project.

### Desktop Framework
- **Framework:** [e.g., Electron, Tauri, React Native Desktop, Next.js + Tauri]
- **Frontend Framework:** [e.g., React, Vue, Svelte, Solid]
- **Language/Runtime:** [e.g., TypeScript, JavaScript, Rust]
- **Build Tool:** [e.g., Vite, webpack, Turbopack, Tauri CLI]

### UI & Styling
- **UI Library:** [e.g., shadcn/ui, Radix UI, Mantine, Chakra UI, Material UI]
- **Styling:** [e.g., Tailwind CSS, CSS Modules, styled-components, vanilla CSS]
- **Design System:** [e.g., custom design system, platform-native, Fluent UI]
- **State Management:** [e.g., Zustand, Jotai, Redux, MobX, Valtio, Context API]
- **Animation:** [e.g., Framer Motion, react-spring, CSS animations]

### Native Integration
- **IPC:** [e.g., Electron IPC, Tauri commands, custom protocol]
- **Native Modules:** [e.g., Node N-API addons, Rust crates, native bindings]
- **System APIs:** [How you access clipboard, notifications, file system, etc.]

### Data & Storage
- **Local Database:** [e.g., SQLite, LevelDB, IndexedDB, Dexie.js]
- **ORM/Query Builder:** [e.g., Prisma, better-sqlite3, Drizzle, Kysely]
- **Settings Storage:** [e.g., electron-store, conf, JSON files, native preferences]
- **Encryption:** [e.g., node-forge, webcrypto, OS keychain libraries]

### Backend/API (if applicable)
- **Backend API:** [e.g., REST API, GraphQL, tRPC]
- **API Client:** [e.g., fetch, axios, tRPC client, GraphQL client]
- **Authentication:** [e.g., JWT, OAuth 2.0, session-based]
- **Real-Time Sync:** [e.g., WebSockets, Server-Sent Events, polling]

### AI Integration (if applicable)
- **Local AI:** [e.g., llama.cpp, ONNX Runtime, TensorFlow.js, Transformers.js]
- **Cloud AI Provider:** [e.g., OpenAI, Anthropic, local models, OpenRouter]
- **AI SDK/Library:** [e.g., OpenAI SDK, LangChain, llama.cpp bindings]
- **Model Format:** [e.g., GGML, ONNX, CoreML, TensorFlow]
- **Inference Engine:** [e.g., llama.cpp, ONNX Runtime, native ML APIs]

### Testing & Quality
- **Testing Framework:** [e.g., Jest, Vitest, Mocha]
- **E2E Testing:** [e.g., Spectron, Playwright, WebdriverIO]
- **Component Testing:** [e.g., React Testing Library, Vue Test Utils]
- **Native Testing:** [How you test native modules and IPC]
- **Linting/Formatting:** [e.g., ESLint, Prettier, Biome]

### Build & Packaging
- **Packager:** [e.g., electron-builder, Tauri CLI, electron-forge]
- **Code Signing:** [e.g., electron-builder signing, manual signing]
- **Notarization:** [How you notarize macOS builds]
- **Target Platforms:** [e.g., macOS (x64 + ARM64), Windows (x64), Linux (x64)]
- **Target Formats:** [e.g., DMG, EXE, MSI, AppImage, deb, rpm]

### Distribution & Updates
- **Distribution:** [e.g., GitHub Releases, direct download, Mac App Store, Microsoft Store]
- **Auto-Update:** [e.g., electron-updater, Tauri updater, custom solution]
- **Update Server:** [e.g., GitHub Releases, custom server, S3 + CloudFront]
- **Package Managers:** [e.g., Homebrew Cask, Chocolatey, Winget, Snap, Flatpak]

### Monitoring & Analytics
- **Error Tracking:** [e.g., Sentry, Bugsnag, Rollbar]
- **Analytics:** [e.g., Google Analytics, Mixpanel, PostHog, custom telemetry]
- **Crash Reporting:** [e.g., Sentry, Crashlytics, built-in]
- **Usage Telemetry:** [e.g., custom telemetry, analytics SDK]

### Developer Tools
- **Version Control:** [e.g., GitHub, GitLab]
- **CI/CD:** [e.g., GitHub Actions, GitLab CI, CircleCI]
- **Hot Reload:** [e.g., Vite HMR, webpack HMR, Tauri dev server]
- **DevTools:** [e.g., React DevTools, Redux DevTools, Electron DevTools]
