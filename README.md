# ESTUDIAX Native & Desktop

Local-first study tools for desktop and Android. The original website remains available at https://estudiax.higgsfield.app.

## Current implementations
- `Sources/`: SwiftUI macOS starter and Swift local-storage core.
- `desktop/`: Tauri desktop app for Windows/Linux: local tasks, calendar, flashcards, progress, data export/deletion.
- `android/`: Kotlin app for Android: local tasks, a daily calendar view and progress.
- `docs/`: privacy architecture and honest platform roadmap.

## Privacy contract
- No required account or network request on startup.
- Local study data stays on device.
- Terms are stored locally by terms version.
- AI and Google Drive are optional and should connect only on explicit action.
- No Turnstile/CAPTCHA in native startup; no API secrets inside app bundles.

## Build
```sh
swift test && swift build -c release
cd desktop && npm install && npm run tauri -- build
gradle -p android assembleDebug
``

GitHub Actions creates installable test artifacts for macOS, Windows, Linux, and Android, and runs iOS/iPadOS and watchOS simulator builds. The rolling `continuous` release is a prerelease, not a stable release. The Android APK is debug-signed; the macOS DMG is unsigned and unnotarized; Windows installers are not code-signed. Treat these as test builds, not store-ready releases. CI also publishes `SHA256SUMS.txt` so downloaded artifacts can be integrity-checked. iOS/iPadOS and watchOS are currently simulator-build targets only: no signed IPA/watchOS package is distributed yet. Real-device testing, Apple Developer signing, privacy/store metadata, and App Store Connect submission are still required before public Apple releases.
