# Free release integrity signatures

This workflow uses Sigstore keyless signing through GitHub Actions OIDC. It requires no paid certificate and no long-lived private signing key in repository secrets.

## Run it

1. Open **Actions → Free verifiable signatures (Sigstore) → Run workflow**.
2. Enter an existing release tag (normally `continuous`).
3. Confirm the run succeeds and the five `.sigstore.json` bundles appear beside the original assets in that GitHub Release.

It signs the exact bytes already published for Android, macOS, Windows, and Linux. It does **not** rebuild, change, or replace any app package.

## What this does and does not mean

- A successful bundle gives a verifiable, transparency-log-backed signature for the downloaded file and identifies the GitHub Actions workflow identity that signed it.
- This is useful for tamper detection and provenance, and costs nothing.
- It is **not** an Android APK release signature, macOS Developer ID signature/notarization, or Windows Authenticode signature. It will not remove Gatekeeper or SmartScreen warnings.
- The current Android debug APK remains a test build, not a Play Store release. A persistent Android release keystore must be created and backed up, then stored as protected GitHub Actions secrets before building a release APK.
- Sigstore verification needs Cosign installed and the correct repository/workflow identity. See https://docs.sigstore.dev/cosign/verifying/verify/ for current verification instructions.

Never upload signing passwords or private keys to Git, issues, or chat.
