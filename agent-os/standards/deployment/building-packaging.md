## Desktop app building and packaging

- **Build Tool**: Use electron-builder, Tauri CLI, or custom build scripts
- **Cross-Platform Builds**: Build for macOS, Windows, Linux from CI
- **Code Signing**: Sign apps on macOS (Developer ID) and Windows (Authenticode)
- **Notarization**: Notarize macOS apps for Gatekeeper
- **App Formats**: Package as DMG (macOS), EXE/MSI (Windows), AppImage/deb/rpm (Linux)
- **Bundle Size**: Minimize bundle size; exclude dev dependencies
- **Asset Optimization**: Optimize images, fonts, and other assets
- **Native Dependencies**: Handle native dependencies correctly per platform
- **Universal Builds**: Create universal binaries for macOS (x64 + ARM64)
- **Portable Builds**: Optionally create portable/standalone versions
- **Update Channels**: Support stable, beta, alpha update channels
- **Build Reproducibility**: Ensure reproducible builds
- **Build Automation**: Automate builds in CI/CD
- **Build Verification**: Verify builds before releasing
