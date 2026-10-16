# Privacy architecture

- App launch must not call the ESTUDIAX website, Cloudflare, Turnstile, analytics, or any API.
- Local features use on-device storage.
- First-launch terms acceptance is persisted locally by terms version.
- AI and Google Drive must be explicit user actions and transmit only necessary data.
- OAuth uses system browser flows and PKCE where supported; tokens belong in Keychain, Windows Credential Manager, Linux Secret Service/libsecret, or Android Keystore.
- Never put provider secrets in app code or CI artifacts.
- Do not send task titles, school information, study progress, or usage analytics to a server unless explicitly required and clearly disclosed.
- Provide a clear disconnect/revoke option for Google Drive and a way to delete local data.
- Sign/notarize macOS and sign Windows installers before stable public distribution. Maintain a stable Android signing key for update compatibility.
