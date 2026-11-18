package app.vio.tv

import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.io.ByteArrayOutputStream

class PortalClient(private val access:PortalAccess){
 @Volatile private var connection:HttpURLConnection?=null
 fun cancel(){connection?.disconnect();connection=null}
 fun request(params:JSONObject):JSONObject{
  val body=JSONObject(params.toString())
  // Protocol identifier required by the provider API; it is not a UI brand.
  body.put("app","ott-play");body.put("key",access.key)
  val c=URL(access.endpoint).openConnection() as HttpURLConnection
  connection=c;c.instanceFollowRedirects=false;c.connectTimeout=15000;c.readTimeout=20000;c.requestMethod="POST";c.doOutput=true
  c.setRequestProperty("Content-Type","application/json; charset=UTF-8");c.setRequestProperty("User-Agent","VIO-Android/${BuildConfig.VERSION_NAME}")
  try{c.outputStream.use{it.write(body.toString().toByteArray(Charsets.UTF_8))};check(c.responseCode==200){"PORTAL_HTTP_${c.responseCode}"}
   val bytes=ByteArrayOutputStream();c.inputStream.use{input->val buffer=ByteArray(8192);while(true){if(Thread.currentThread().isInterrupted)error("CANCELLED");val n=input.read(buffer);if(n<0)break;check(bytes.size()+n<=4*1024*1024){"PORTAL_SIZE"};bytes.write(buffer,0,n)}}
   return JSONObject(bytes.toString("UTF-8"))
  }finally{if(connection===c)connection=null;c.disconnect()}
 }
}
