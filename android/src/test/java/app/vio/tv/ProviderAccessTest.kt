package app.vio.tv
import org.junit.Assert.*
import org.junit.Test
class ProviderAccessTest {
 @Test fun portalIsPersonalAndRejectsAmbiguousAddresses(){val p=ProviderAccess.parsePortal("portal::[key:TEST-KEY]http://portal.example/api/v1/");assertEquals("TEST-KEY",p?.key);assertEquals("http://portal.example/api/v1/",p?.endpoint);for(v in listOf("http://portal.example/","portal::[key:k]http://user:pass@portal.example/","portal::[key:k]http://portal.example/#x","portal::[key:k]file:///etc/test"))assertNull(ProviderAccess.parsePortal(v))}
 @Test fun replayFixesTimeAndPreservesLiveAddress(){assertEquals("http://provider.example/live.m3u8?utc=6400&lutc=10000",ProviderAccess.replayUrl("http://provider.example/live.m3u8",3600,10000));assertTrue(ProviderAccess.replayUrl("https://provider.example/live?x=1",3600,10000).contains("x=1&utc="))}
 @Test fun providerKeysKeepLeadingZeroes(){assertTrue(ProviderAccess.validKey("00001234"));assertFalse(ProviderAccess.validKey("1234567"));assertFalse(ProviderAccess.mediaUrl("javascript:alert(1)"))}
}
