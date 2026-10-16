# Free release integrity signatures (non-Apple)

This workflow uses Sigstore keyless signing through GitHub Actions OIDC. It requires no paid certificate and no long-lived private signing key in repository secrets.

## Scope

The workflow signs the exact bytes already published for these non-Apple release assets:
- `ESTUDIAX-Android-debug.apk`
- `ESTUDIAX-Windows-Setup.exe`
- `ESTUDIAX-Linux.AppImage`
- `ESTUDIAX-Linux.deb`

It deliberately does not sign the macOS DMG, per the project's current scope. It does not rebuild, change, or replace any app package.

## Run it

1. Open **Actions → Free verifiable signatures (Sigstore) → Run workflow**.
2. Enter an existing release tag (normally `continuous`).
3. Confirm the run succeeds and the four `.sigstore.json` bundles appear beside the original assets in that GitHub Release.

## What this does and does not mean

- A successful bundle provides a verifiable, transparency-log-backed signature for the exact downloaded file and identifies the GitHub Actions workflow identity that signed it.
- This is free and helps detect tampering and establish provenance.
- It is **not** an Android APK release signature or a Windows Authenticode signature. It will not remove Android installer warnings or Windows SmartScreen warnings.
- Linux AppImage and DEB packages also have Sigstore bundles; this does not automatically install them through a signed Linux package repository.
- The current Android debug APK remains a test build, not a Play Store release. To create a native Android release-signed APK, create a permanent keystore and add it as protected GitHub Actions secrets following [ANDROID-RELEASE-KEY.md](./ANDROID-RELEASE-KEY.md).
- Windows Authenticode signing normally needs a code-signing certificate. Do not claim Authenticode signing based on a Sigstore bundle.
- Sigstore verification requires Cosign and the correct repository/workflow identity. See https://docs.sigstore.dev/cosign/verifying/verify/ for current verification instructions.

Never upload signing passwords or private keys to Git, issues, or chat.
