package app.vio.tv
import okhttp3.mockwebserver.MockWebServer
import okhttp3.mockwebserver.MockResponse
import org.json.JSONObject
import org.junit.Assert.*
import org.junit.Test
class PortalClientTest {
 @Test fun postsToConfiguredProviderAndNeverTrustsCredentialOverrides(){val server=MockWebServer();server.start();try{server.enqueue(MockResponse().setBody("{\"type\":\"videoportal\",\"items\":[]}"));val client=PortalClient(PortalAccess("TEST-PERSONAL-KEY",server.url("/api/v1/").toString()));val result=client.request(JSONObject().put("cmd","catalog").put("key","WRONG").put("app","WRONG"));val received=JSONObject(server.takeRequest().body.readUtf8());assertEquals("videoportal",result.getString("type"));assertEquals("TEST-PERSONAL-KEY",received.getString("key"));assertEquals("ott-play",received.getString("app"));assertEquals("catalog",received.getString("cmd"))}finally{server.shutdown()}}
 @Test fun doesNotForwardCredentialsToRedirect(){val server=MockWebServer();server.start();try{server.enqueue(MockResponse().setResponseCode(307).addHeader("Location",server.url("/other")));server.enqueue(MockResponse().setBody("{}"));val client=PortalClient(PortalAccess("TEST-KEY",server.url("/redirect").toString()));try{client.request(JSONObject());fail("Redirect must fail")}catch(_:IllegalStateException){};assertEquals(1,server.requestCount)}finally{server.shutdown()}}
}
