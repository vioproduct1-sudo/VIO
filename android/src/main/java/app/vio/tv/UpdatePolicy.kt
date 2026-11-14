package app.vio.tv

import java.net.URI

object UpdatePolicy {
 const val REPOSITORY = "vioproduct1-sudo/VIO"
 const val LATEST = "https://api.github.com/repos/$REPOSITORY/releases/latest"
 fun allowedAsset(value:String):Boolean = try {
  val u=URI(value)
  u.scheme=="https" && u.host=="github.com" && u.userInfo==null && (u.port==-1||u.port==443) &&
   u.rawPath.startsWith("/$REPOSITORY/releases/download/android-v") && u.rawQuery==null && u.rawFragment==null && !u.rawPath.contains("..")
 } catch (_:Exception){false}
 fun validHash(value:String)=value.matches(Regex("[a-fA-F0-9]{64}"))
}
