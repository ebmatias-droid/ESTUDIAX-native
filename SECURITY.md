# Security policy

## Supported release channel

The `continuous` GitHub Release is a rolling **pre-release for testing**, not a production/stable release. Native apps have a smaller feature set than the web app. Do not use a missing publisher signature as proof of malware, and do not disable Gatekeeper, SmartScreen, Play Protect, or other OS protections to install a package.

## Reporting a vulnerability

Please report suspected security issues privately through GitHub's **Report a vulnerability** feature on this repository, if enabled. Include the affected platform, version or commit, impact, and safe reproduction steps. Do not publish API keys, private signing keys, passwords, personal data, or exploit details in a public issue.

## Release integrity

- Verify SHA-256 checksums against the published `SHA256SUMS.txt`.
- Verify `.sigstore.json` bundles using Cosign and the expected repository/workflow identity.
- Sigstore integrity signatures are not the same as native Android APK signing, Windows Authenticode, or Apple Developer ID signing/notarization.
- Never distribute a package as stable unless the required platform build, tests, signatures, and manual device checks have passed.

## Secrets and signing keys

Private keys, keystores, certificates, passwords, API tokens, and App Store Connect private keys must never be committed to Git or sent in chat. Use protected GitHub Actions secrets and keep offline backups of long-lived release keys.
