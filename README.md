# ESTUDIAX Native & Desktop

ESTUDIAX is a local-first study app project. The live web app is available at https://estudiax.higgsfield.app.

## Project layout

- `Sources/`: SwiftUI macOS app and local-storage core.
- `AppleApps/`: iPhone/iPad app and Apple Watch calendar/reminder companion.
- `desktop/`: Tauri app for Windows and Linux.
- `android/`: native Kotlin app for Android.
- `website/`: public source snapshot of the live ESTUDIAX web app, including UI components, server routes, migrations, configuration and assets. See [website/README-SNAPSHOT.md](website/README-SNAPSHOT.md).
- `docs/`: privacy architecture, platform roadmap, production readiness and signing instructions.

## Privacy contract

- Native startup does not require an account or network request.
- Native study data stays on the device unless the user explicitly exports it.
- Terms are accepted locally on first launch.
- AI and Google Drive are optional online services opened only by user action.
- No Turnstile/CAPTCHA in native startup and no API secrets in app bundles.

## Build locally

```sh
swift test && swift build -c release
cd desktop && npm install && npm run tauri -- build
gradle -p android assembleDebug
cd website/app && bun install --frozen-lockfile && bun run typecheck && bun run build
```

## Native downloads and signing

GitHub Actions publishes test artifacts for macOS, Windows, Linux and Android, and builds iPhone/iPad and Watch simulator targets. Current `continuous` assets remain test builds until the signed-release workflow is run successfully with real signing credentials.

See [docs/PRODUCTION-READINESS.md](docs/PRODUCTION-READINESS.md) for release limitations and [docs/SIGNING-SETUP.md](docs/SIGNING-SETUP.md) for required protected GitHub Actions secrets and the signing workflow. That workflow covers macOS Developer ID signing and notarization, Windows Authenticode signing, an Android release APK, Linux detached signatures, and TestFlight upload for iPhone/iPad with the Watch companion.

**Important:** the workflow is configured but does not magically create publisher identity or certificates. The owner must supply valid certificates/keys and complete platform-account setup. No private credentials belong in this repository or in chat. An unsigned build is not automatically malware; signing lets the operating system verify the publisher and, for Apple distribution, notarization status.
