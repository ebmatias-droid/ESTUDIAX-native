# iPhone, iPad, Apple Watch: TestFlight and App Store

## Project targets

The XcodeGen specification is `project.yml`. Generate the project with:

```sh
brew install xcodegen
xcodegen generate --spec project.yml
open ESTUDIAXApple.xcodeproj
```

Before building, generate the icon asset described in `scripts/generate-icons.py` (script setup is being added to CI). The App Store submission requires a real 1024×1024 app icon and valid signing.

## Required account-owned steps

A GitHub Actions runner cannot sign or publish to the user's Apple account without the account's explicit signing material and App Store Connect authorization. To upload to TestFlight/App Store:

1. Enroll in the Apple Developer Program and create the app record in App Store Connect.
2. Confirm unique bundle IDs and configure signing for iOS and watchOS in Xcode.
3. Select the user's Apple Developer Team and enable automatic signing.
4. Add the app icon and verify privacy labels, age rating, support URL, privacy policy URL, screenshots, and store description.
5. Product-test on a physical iPhone/iPad and Apple Watch; simulator compilation alone is not a TestFlight-ready verification.
6. Product > Archive, validate the archive, then Distribute App > App Store Connect > Upload.

Do not put Apple account passwords, private keys, or provisioning profiles in the source repository. If CI signing is added, use protected GitHub Actions secrets and an App Store Connect API key.

## Current native feature scope

iPhone/iPad currently includes local tasks, due-date list/calendar, flashcards, local progress, local reminders, local export/deletion, and a link to the existing web app for optional online AI/Drive features. The watch companion is limited to calendar events and local reminders. It is not yet a feature-for-feature port of the full web app; do not claim otherwise in store metadata.

## Privacy

The native app should not load Turnstile, Cloudflare, analytics, or the web server at launch. Core records stay on device. Online features should send data only after an explicit user action. Re-review the privacy manifest and App Store privacy answers whenever code or SDKs change.
