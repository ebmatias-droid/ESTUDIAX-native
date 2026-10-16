# Android release keystore setup (free)

A permanent Android release key can be created for free. The private keystore must remain under the project owner's control and must never be committed to Git.

## 1. Generate the key on your Mac

Open Terminal in a private location. Check that Java's `keytool` exists with `keytool -help`. Then run:

```sh
keytool -genkeypair -v \
  -keystore estudiax-release.jks \
  -alias estudiax-release \
  -keyalg RSA -keysize 3072 -validity 10000
```

Choose strong, unique passwords and record them in a password manager. The certificate identity prompts do not need to contain sensitive personal information; use accurate project/publisher information where appropriate.

Make at least two secure backups of `estudiax-release.jks`. Do not email it or upload it to the public repository. Do not regenerate it for future updates to the same Android application ID.

## 2. Encode the keystore for GitHub Actions

On macOS:

```sh
base64 -i estudiax-release.jks | tr -d '\\n' > estudiax-release.base64.txt
```

Open the repository on GitHub and navigate to **Settings → Secrets and variables → Actions → New repository secret**. Create these secrets:

- `ANDROID_KEYSTORE_BASE64`: entire contents of `estudiax-release.base64.txt`
- `ANDROID_KEYSTORE_PASSWORD`: keystore password
- `ANDROID_KEY_ALIAS`: `estudiax-release`
- `ANDROID_KEY_PASSWORD`: key password

After configuring, securely delete the temporary base64 text file if you do not need it. Keep the original keystore and backups protected.

## 3. Build

The existing workflow at **Actions → Sign native ESTUDIAX releases → Run workflow** also contains macOS, Windows and Apple jobs that require paid certificates/accounts. It will not finish successfully until those platform credentials are configured. Do not run that combined workflow expecting only Android to run.

The current free Sigstore workflow signs the bytes of existing release downloads for tamper detection; it does not replace this Android release APK signing step. Once a separate Android-only release workflow is available, use it to build and verify the signed release APK.

Never paste passwords or keystore contents into ChatGPT, issues, commits, or logs.
