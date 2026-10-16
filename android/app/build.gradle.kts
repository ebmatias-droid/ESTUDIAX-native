plugins { id("com.android.application"); id("org.jetbrains.kotlin.android") }
android { namespace = "app.estudiax.android"; compileSdk = 35
 defaultConfig { applicationId = "app.estudiax.android"; minSdk = 26; targetSdk = 35; versionCode = 1; versionName = "0.1.0" }
 compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
 kotlinOptions { jvmTarget = "17" }
 signingConfigs {
  create("release") {
   val keystorePath = System.getenv("ANDROID_KEYSTORE_PATH")
   if (!keystorePath.isNullOrBlank()) {
    storeFile = file(keystorePath)
    storePassword = System.getenv("ANDROID_KEYSTORE_PASSWORD")
    keyAlias = System.getenv("ANDROID_KEY_ALIAS")
    keyPassword = System.getenv("ANDROID_KEY_PASSWORD")
   }
  }
 }
 buildTypes {
  release {
   isMinifyEnabled = true
   isShrinkResources = true
   proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
   val keystorePath = System.getenv("ANDROID_KEYSTORE_PATH")
   if (!keystorePath.isNullOrBlank()) signingConfig = signingConfigs.getByName("release")
  }
 }
}
