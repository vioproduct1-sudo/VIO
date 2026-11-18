package app.vio.tv
import com.sun.net.httpserver.HttpServer
import java.net.InetSocketAddress
import org.json.JSONObject
import org.junit.Assert.*
import org.junit.Test
class PortalClientTest {
 @Test fun postsToConfiguredProviderAndNeverTrustsCredentialOverrides(){
  val server=HttpServer.create(InetSocketAddress("127.0.0.1",0),0);var received=JSONObject()
  server.createContext("/api/v1/"){exchange->received=JSONObject(exchange.requestBody.bufferedReader().use{it.readText()});val bytes="{\"type\":\"videoportal\",\"items\":[]}".toByteArray();exchange.sendResponseHeaders(200,bytes.size.toLong());exchange.responseBody.use{it.write(bytes)}};server.start()
  try{val client=PortalClient(PortalAccess("TEST-PERSONAL-KEY","http://127.0.0.1:${server.address.port}/api/v1/"));val result=client.request(JSONObject().put("cmd","catalog").put("key","WRONG").put("app","WRONG"));assertEquals("videoportal",result.getString("type"));assertEquals("TEST-PERSONAL-KEY",received.getString("key"));assertEquals("ott-play",received.getString("app"));assertEquals("catalog",received.getString("cmd"))}finally{server.stop(0)}
 }
 @Test fun doesNotForwardCredentialsToRedirect(){
  val server=HttpServer.create(InetSocketAddress("127.0.0.1",0),0);var followed=false
  server.createContext("/redirect"){e->e.responseHeaders.set("Location","/other");e.sendResponseHeaders(307,-1);e.close()};server.createContext("/other"){e->followed=true;e.sendResponseHeaders(200,-1);e.close()};server.start()
  try{val client=PortalClient(PortalAccess("TEST-KEY","http://127.0.0.1:${server.address.port}/redirect"));try{client.request(JSONObject());fail("Redirect must fail")}catch(_:IllegalStateException){};assertFalse(followed)}finally{server.stop(0)}
 }
}
