package app.vio.tv
import org.junit.Assert.*
import org.junit.Test
class UpdatePolicyTest {
 @Test fun restrictsDownloadsToVioReleases(){
  assertTrue(UpdatePolicy.allowedAsset("https://github.com/vioproduct1-sudo/VIO/releases/download/android-v0.2.0/VIO-TV.apk"))
  for(url in listOf("http://github.com/vioproduct1-sudo/VIO/releases/download/android-v2/a.apk","https://github.com.evil.test/vioproduct1-sudo/VIO/releases/download/android-v2/a.apk","https://github.com/other/VIO/releases/download/android-v2/a.apk","https://github.com/vioproduct1-sudo/VIO/releases/download/android-v2/../a.apk","https://user@github.com/vioproduct1-sudo/VIO/releases/download/android-v2/a.apk"))assertFalse(url,UpdatePolicy.allowedAsset(url))
 }
 @Test fun rejectsInvalidChecksums(){assertTrue(UpdatePolicy.validHash("a".repeat(64)));assertFalse(UpdatePolicy.validHash("x".repeat(64)));assertFalse(UpdatePolicy.validHash("a".repeat(63)))}
}
