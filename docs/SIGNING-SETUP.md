# Native release signing

The native projects are source code; an unsigned package is not automatically malware. Signing gives users a verifiable publisher identity and, on Apple platforms, is required for the normal trusted distribution path.

## Required setup

Open the repository's **Settings → Secrets and variables → Actions** and add the secrets below. Never commit certificate files, keystores, API private keys, or passwords, and never paste them into a chat.

### macOS DMG + notarization

Requires Apple Developer Program membership and a **Developer ID Application** certificate exported as a password-protected PKCS#12 (.p12).

- `MACOS_CERTIFICATE_P12_BASE64`: base64 text of the .p12 file.
- `MACOS_CERTIFICATE_PASSWORD`: password used to export the .p12.
- `MACOS_SIGNING_IDENTITY`: exact Developer ID Application identity shown by Keychain Access, including the team ID.
- `APPLE_ID`: Apple account email used for notarization.
- `APPLE_APP_SPECIFIC_PASSWORD`: app-specific password for that Apple account.
- `APPLE_TEAM_ID`: 10-character Apple Developer Team ID.

A valid signature alone is not enough for normal distribution: the workflow also submits the DMG to Apple's notarization service and staples the result.

### Windows installer

Use an Authenticode certificate from a trusted certificate authority. A self-signed certificate does not remove SmartScreen warnings for the public.

- `WINDOWS_CERTIFICATE_PFX_BASE64`: base64 text of the password-protected PFX.
- `WINDOWS_CERTIFICATE_PASSWORD`: PFX password.

### Android APK

Create a release keystore on a trusted computer, back it up securely in at least two safe places, and never regenerate it for an update to the same app ID.

- `ANDROID_KEYSTORE_BASE64`: base64 text of the persistent release keystore.
- `ANDROID_KEYSTORE_PASSWORD`: keystore password.
- `ANDROID_KEY_ALIAS`: alias of the release key.
- `ANDROID_KEY_PASSWORD`: key password.

The Gradle release build reads these values from environment variables; no signing material is stored in source.

### Linux AppImage and DEB

Create a long-lived project release-signing key and publish its **public** key fingerprint in a trusted project location so users can verify signatures. Keep the private key offline except when releasing.

- `RELEASE_GPG_PRIVATE_KEY`: armored private key text (not the public key).
- `RELEASE_GPG_PASSPHRASE`: private-key passphrase.

The workflow uploads detached `.asc` signatures and a signed checksum manifest. Linux package signatures do not behave like macOS Gatekeeper or Windows SmartScreen; users must verify them against the trusted project public key.

### iPhone, iPad and Apple Watch → TestFlight

Requires an active Apple Developer Program membership, App Store Connect access, registered bundle IDs, an App Store Connect app record, and an **Apple Distribution** certificate. The iOS target embeds the watch companion; test the pairing and notification flow on real devices before release.

- `IOS_CERTIFICATE_P12_BASE64`: base64 text of the Apple Distribution .p12.
- `IOS_CERTIFICATE_PASSWORD`: password used to export the certificate.
- `APP_STORE_CONNECT_KEY_ID`: App Store Connect API key ID.
- `APP_STORE_CONNECT_ISSUER_ID`: App Store Connect issuer ID.
- `APP_STORE_CONNECT_PRIVATE_KEY_BASE64`: base64 text of the matching .p8 private key.
- `APPLE_TEAM_ID`: same Apple Developer Team ID as above.

The workflow uses Xcode automatic signing and uploads the archived iPhone/iPad app (including the watch target) to TestFlight. App Store Connect may require bundle IDs and app records to be created before the first upload. TestFlight processing is asynchronous; an uploaded build is not immediately available to testers.

## Run the workflow

1. Configure every secret required above. The combined workflow runs every platform job and intentionally fails with a clear error if signing configuration is missing.
2. Open **Actions → Sign native ESTUDIAX releases → Run workflow**.
3. Enter an existing release tag, normally `continuous`, and start the workflow.
4. Review every job. Do not announce the packages as signed unless macOS notarization, Windows signature verification, Android APK verification, Linux signatures, and the TestFlight upload all succeed.

## Trust and scope

- Do not tell users to disable Gatekeeper, SmartScreen, Play Protect, or other operating-system security checks.
- Do not describe an unsigned build as malware merely because the operating system cannot verify its publisher.
- Signing does not replace malware review, dependency review, privacy review, or physical-device testing.
- The workflow cannot sign anything until the owner configures the required certificates and protected repository secrets. These credentials are intentionally not included in Git.
