# ESTUDIAX production release checklist

This repository intentionally publishes the `continuous` release as a **prerelease for testing**. A successful CI build proves compilation and packaging checks; it does not replace physical-device QA, code signing, notarization, store review, or a privacy/security audit.

## Before calling a release stable

- [ ] Test every installer on a clean device/VM for its supported OS version.
- [ ] Test creating, editing, completing, deleting, restarting, and retaining tasks/cards.
- [ ] Test data export and deletion, date/time-zone edge cases, empty states, keyboard navigation, screen readers, and high-contrast/large-text settings.
- [ ] Test airplane mode/offline operation. Verify that local features make no network calls and that optional web/AI links open only after a user action.
- [ ] Test reminder permission denial/grant, reboot, completed/deleted tasks, past dates, and duplicate notifications.
- [ ] Verify every published asset against `SHA256SUMS.txt` and retain the exact source commit for the release.
- [ ] Review dependency advisories, permissions, privacy statements, licenses, and the open-source MIT license.
- [ ] Publish release notes listing supported OS versions, limitations, migration/backup behavior, and known issues.

## Signing and distribution requirements

### macOS

A production download needs a valid **Developer ID Application** certificate, hardened runtime, and Apple notarization/stapling. The current unsigned DMG is a test build and may be blocked by Gatekeeper.

1. Enroll in the Apple Developer Program and create a Developer ID Application certificate.
2. Configure repository Actions secrets for the certificate exported as base64 PKCS#12, its password, signing identity, Apple Developer Team ID, Apple ID, and an app-specific password (or use an approved App Store Connect API-key workflow).
3. Add a reviewed signing/notarization step to CI, sign the app with hardened runtime, verify the signature, notarize the DMG with `notarytool`, staple the ticket, then verify the stapled result before publishing.
4. Never commit certificates, private keys, passwords, or provisioning profiles to the repository or paste them into chat.

The existing CI smoke test checks that the DMG mounts and contains `ESTUDIAX.app`; it does not establish Apple trust or notarization.

### Windows

The current NSIS installer is unsigned. Obtain an Authenticode signing certificate (prefer hardware-backed or managed signing), store credentials as protected CI secrets, sign the final installer, and verify the signature before publishing. Without signing, SmartScreen may warn users.

### Android

The current `ESTUDIAX-Android-debug.apk` is a debug-signed test package, not a production release. Create a release keystore locally, back it up securely, and store the keystore plus passwords as protected CI secrets. Configure a release build with R8/minification and a stable application ID/versioning policy; sign the release APK or Android App Bundle and verify its signature. Never upload the private keystore to GitHub or send it in chat. Keep the debug APK clearly labeled as a test build.

### iPhone, iPad, and Apple Watch

Simulator builds are not installable on physical devices. Enroll in the Apple Developer Program, configure bundle IDs, capabilities, signing and provisioning profiles, build an iOS archive, test on real devices, and distribute through TestFlight before App Store submission. Confirm the watch app embeds, installs, and syncs with its paired iPhone. Store privacy disclosures and review metadata must match the actual data flows.

### Linux

Test the AppImage and DEB on supported distributions, including clean machines with no development toolchain installed. Publish supported distribution/runtime requirements and verify package integrity.

## Scope of the current native apps

The native clients currently provide local tasks, a calendar/deadline view, flashcards, progress, and settings/export/delete functions. AI tutoring, AI-generated exams, and Google Drive are linked to the web app rather than implemented as fully native offline features. Do not advertise full feature parity with the website until those flows are implemented and tested independently on each platform.
