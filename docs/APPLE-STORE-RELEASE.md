# iPhone, iPad, Apple Watch: TestFlight and App Store

Generate the Xcode project from `project.yml` with `brew install xcodegen && xcodegen generate --spec project.yml`.

## Account-owned publishing steps
1. Enroll in the Apple Developer Program and create the app record in App Store Connect.
2. Confirm unique bundle IDs and configure iOS/watchOS signing in Xcode.
3. Select your Apple Developer Team and enable automatic signing.
4. Verify app icon, privacy labels, age rating, support URL, privacy policy URL, screenshots and store description.
5. Test on physical iPhone/iPad/Apple Watch; simulator compilation alone is not TestFlight verification.
6. Product > Archive, validate, then Distribute App > App Store Connect > Upload.

A signed IPA requires the developer's signing certificates/profiles or authenticated Xcode account. Do not commit passwords, private keys, or provisioning profiles. CI signing requires protected GitHub Actions secrets and App Store Connect authorization.

## Current feature scope
iPhone/iPad currently includes local tasks, due-date list/calendar, flashcards, local progress, local reminders, local export/deletion, and a link to the existing web app for optional online AI/Drive features. The watch companion is limited to calendar events and local reminders. It is not yet a feature-for-feature port of the full web app.

## Privacy
The native app must not load Turnstile, Cloudflare, analytics, or the web server at launch. Core records stay on device. Online features should send data only after an explicit user action. Re-review the privacy manifest and store privacy answers whenever code or SDKs change.
