package app.vio.tv

import java.net.URI

data class PortalAccess(val key:String,val endpoint:String)
object ProviderAccess {
 fun parsePortal(value:String):PortalAccess? = try {
  val match=if(value.any{it.code<32||it.code==127})null else Regex("^portal::\\[key:([^\\[\\]\\s<>\"\\\\]{1,1024})](https?://[^\\s<>\"\\\\]+)$",RegexOption.IGNORE_CASE).matchEntire(value.trim())
  if(match==null)null else {val u=URI(match.groupValues[2]);if(u.host.isNullOrBlank()||u.userInfo!=null||u.fragment!=null||u.query!=null)null else PortalAccess(match.groupValues[1],u.toASCIIString())}
 }catch(_:Exception){null}
 fun validKey(value:String)=value.matches(Regex("[A-Za-z0-9_-]{8,256}"))
 fun mediaUrl(value:String):Boolean=try{val u=URI(value);u.scheme in listOf("http","https")&&!u.host.isNullOrBlank()&&u.userInfo==null&&u.fragment==null}catch(_:Exception){false}
 fun replayUrl(live:String,seconds:Int,now:Long=System.currentTimeMillis()/1000):String {
  require(mediaUrl(live)&&seconds in 60..345600)
  return live+(if(live.contains('?'))"&" else "?")+"utc=${now-seconds}&lutc=$now"
 }
}
