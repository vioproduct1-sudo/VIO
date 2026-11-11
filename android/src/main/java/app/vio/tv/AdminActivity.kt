package app.vio.tv
import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.webkit.*

class AdminActivity:Activity(){
 private lateinit var web:WebView
 private var upload:ValueCallback<Array<Uri>>?=null
 @Suppress("SetJavaScriptEnabled") override fun onCreate(state:Bundle?){super.onCreate(state);val base=intent.getStringExtra("server")?:run{finish();return};val origin=Uri.parse(base);if(origin.scheme !in listOf("http","https")||origin.host.isNullOrEmpty()){finish();return}
  web=WebView(this);setContentView(web);web.settings.javaScriptEnabled=true;web.settings.domStorageEnabled=true;web.settings.allowFileAccess=false;web.settings.allowContentAccess=false
  web.webViewClient=object:WebViewClient(){override fun shouldOverrideUrlLoading(view:WebView,request:WebResourceRequest):Boolean{val u=request.url;return u.scheme!=origin.scheme||u.host!=origin.host||u.port!=origin.port}}
  web.webChromeClient=object:WebChromeClient(){override fun onShowFileChooser(view:WebView,callback:ValueCallback<Array<Uri>>,params:FileChooserParams):Boolean{upload?.onReceiveValue(null);upload=callback;return try{startActivityForResult(params.createIntent(),100);true}catch(_:Exception){upload=null;false}}}
  web.loadUrl(base.trimEnd('/')+"/admin")
 }
 @Deprecated("Document chooser") override fun onActivityResult(requestCode:Int,resultCode:Int,data:Intent?){super.onActivityResult(requestCode,resultCode,data);if(requestCode==100){upload?.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(resultCode,data));upload=null}}
 override fun onDestroy(){upload?.onReceiveValue(null);web.destroy();super.onDestroy()}
}
