plugins { id("com.android.application"); id("org.jetbrains.kotlin.android") }
android {
    namespace = "app.vio.tv"
    compileSdk = 35
    defaultConfig { applicationId = "app.vio.tv"; minSdk = 23; targetSdk = 35; versionCode = System.getenv("VIO_VERSION_CODE")?.toInt() ?: 3; versionName = System.getenv("VIO_VERSION_NAME") ?: "0.3.0" }
    sourceSets.getByName("main").assets.srcDir("../server/catalog")
    buildFeatures { buildConfig = true }
    signingConfigs {
        if (System.getenv("VIO_KEYSTORE") != null) create("vio") {
            storeFile = file(System.getenv("VIO_KEYSTORE"))
            storePassword = System.getenv("VIO_STORE_PASSWORD")
            keyAlias = "vio"
            keyPassword = System.getenv("VIO_STORE_PASSWORD")
        }
    }
    buildTypes { getByName("release") { if (signingConfigs.findByName("vio") != null) signingConfig = signingConfigs.getByName("vio") } }
    compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
    kotlinOptions { jvmTarget = "17" }
}
dependencies {
    implementation("androidx.core:core:1.15.0")
    testImplementation("junit:junit:4.13.2")
    testImplementation("org.json:json:20240303")
    testImplementation("com.squareup.okhttp3:mockwebserver:4.12.0")
    implementation("androidx.media3:media3-exoplayer:1.5.1")
    implementation("androidx.media3:media3-exoplayer-hls:1.5.1")
    implementation("androidx.media3:media3-ui:1.5.1")
}
