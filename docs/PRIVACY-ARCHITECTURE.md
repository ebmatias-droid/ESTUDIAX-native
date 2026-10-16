# Privacy architecture

## Offline by default

- App launch must not call the ESTUDIAX website, Cloudflare, Turnstile, analytics, or any API.
- Local features use on-device storage.
- First-launch terms acceptance is persisted locally. The consent screen is not shown again for the same terms version.
- If the terms or privacy notice materially change, increment the version and explain the change.
- AI and Google Drive must be explicit user actions. Only the minimum required request data may be sent.
- OAuth uses system browser flows and PKCE where supported; tokens belong in Keychain/Windows Credential Manager/libsecret/Android Keystore, not source code.
- Never put provider secrets in app code or GitHub Actions artifacts.
- Do not send task titles, school information, study progress, or usage analytics to a server unless a feature explicitly requires it and the user understands that.
- Provide a clear disconnect/revoke option for Google Drive and a way to delete local data.

## Platform delivery

- macOS: sign/notarize a DMG before public distribution.
- Windows: sign the EXE/installer when a certificate is available.
- Linux: publish AppImage and/or DEB after testing on supported distributions.
- Android: produce a signed APK; keep signing material in protected CI secrets.
- iPhone/iPad: use the existing PWA and show platform-specific instructions to add it to the Home Screen. App Store distribution is a separate future decision.
