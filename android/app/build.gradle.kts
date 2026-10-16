plugins { id("com.android.application"); id("org.jetbrains.kotlin.android") }
android { namespace = "app.estudiax.android"; compileSdk = 35
 defaultConfig { applicationId = "app.estudiax.android"; minSdk = 26; targetSdk = 35; versionCode = 1; versionName = "0.1.0" }
 buildTypes { release { isMinifyEnabled = false } }
}
