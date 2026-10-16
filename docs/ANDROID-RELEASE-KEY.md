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

Choose strong, unique passwords and record them in a password manager. Use accurate project/publisher information where appropriate, without adding unnecessary personal information.

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

After configuring, securely delete the temporary base64 text file if you do not need it. Keep the original keystore and backups protected. Never paste the secrets into ChatGPT or GitHub issues.

## 3. Build the release APK

After all four secrets exist, open **Actions → Android signed release APK (free) → Run workflow**, select the existing tag (normally `continuous`), and run it. It will build the release APK, verify its native Android signature with `apksigner`, and upload `ESTUDIAX-Android.apk` to that release.

The separate **Free verifiable signatures (Sigstore)** workflow signs existing Android, Windows and Linux downloads for tamper detection; it does not replace native Android APK signing.

Do not run the combined **Sign native ESTUDIAX releases** workflow expecting it to work without the platform-specific paid certificates/accounts it requires.
