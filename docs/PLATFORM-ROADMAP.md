# Platform delivery roadmap

| Platform | Planned delivery | Current state |
|---|---|---|
| macOS | Native SwiftUI app, signed/notarized DMG | Initial local-first Swift package scaffold; build/test validation pending |
| iPhone / iPad | Existing PWA via Safari → Share → Add to Home Screen | Available as web app; native App Store package is not in scope yet |
| Windows | Signed EXE/installer | Planned; no verified installer yet |
| Linux | AppImage and/or DEB | Planned; no verified package yet |
| Android | Signed APK | Planned; no verified APK yet |
| Web | Existing hosted ESTUDIAX | Remains available |

## Shared behavioral contract

- Local tasks and study data work offline.
- No mandatory account or startup network request.
- First-run terms/privacy consent is stored on-device by terms version.
- No Turnstile/CAPTCHA in native app startup.
- AI and Google Drive network access happens only after the user chooses those features.
- Secrets never ship inside app bundles. OAuth tokens are stored using each platform's secure credential storage.
- Build artifacts are published only after CI tests, platform-specific validation, and signing requirements are satisfied.

## Release integrity

A GitHub Releases URL is not an installer. The website must not advertise a working APK, DMG, EXE, or Linux package until the corresponding artifact is built and verified. The downloads page links to Releases while each native target is under development.
