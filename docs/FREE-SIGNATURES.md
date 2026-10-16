# Free release integrity signatures (Sigstore)

ESTUDIAX uses Sigstore keyless signing through GitHub Actions OIDC. This requires no paid certificate and no long-lived private signing key in repository secrets.

## Scope

The platform build workflow signs the exact bytes it publishes for these assets:
- `ESTUDIAX-Android-debug.apk`
- `ESTUDIAX-Windows-Setup.exe`
- `ESTUDIAX-Linux.AppImage`
- `ESTUDIAX-Linux.deb`
- `ESTUDIAX-macOS.dmg` (separate Apple preview job; provenance only)

The signatures are published as matching `.sigstore.json` bundles beside the files. CI generates a fresh bundle for each artifact it publishes. The separate **Free verifiable signatures (Sigstore)** workflow can be run manually to sign Android, Windows and Linux assets on an existing release. The macOS DMG is handled by a separate Apple-preview job. Sigstore signatures provide verifiable artifact integrity and workflow identity, not operating-system publisher trust.

## Verify

1. Download the asset and its matching `.sigstore.json` bundle from the same GitHub Release.
2. Install Cosign from the official Sigstore instructions: https://docs.sigstore.dev/cosign/system_config/installation/.
3. Verify the blob using Cosign's bundle verification instructions: https://docs.sigstore.dev/cosign/verifying/verify/.
4. Confirm the certificate identity matches the expected ESTUDIAX repository workflow and GitHub Actions OIDC issuer. Do not trust a bundle solely because a file with that name exists.

Also compare the file's SHA-256 digest with `SHA256SUMS.txt` from the same release. A checksum detects accidental or malicious changes only if the checksum file itself is obtained from a trusted source; it is not a signature.

## What this does and does not mean

- A valid bundle provides a verifiable signature for the exact downloaded bytes and helps establish the GitHub Actions workflow identity and provenance.
- It is **not** an Android APK release signature or a Windows Authenticode signature. It does not remove Android installer warnings or Windows SmartScreen warnings.
- Linux AppImage and DEB packages have Sigstore bundles; this does not automatically create a signed Linux package repository.
- The current Android `debug` APK remains a test build, not a Play Store release. For a production APK, create a permanent keystore locally and configure the protected GitHub Actions secrets described in [ANDROID-RELEASE-KEY.md](./ANDROID-RELEASE-KEY.md). Never send the keystore or passwords in chat or commit them to Git.
- Windows Authenticode signing normally needs a code-signing certificate. Do not claim Authenticode signing based on a Sigstore bundle.
- The macOS DMG receives a free Sigstore provenance signature only. This does **not** sign the `.app` bundle with Apple Developer ID, notarize it, satisfy Gatekeeper, or enable trusted App Store distribution. Apple Developer ID signing/notarization remain unavailable without the required Apple credentials.

Never upload signing passwords or private keys to Git, issues, or chat.
