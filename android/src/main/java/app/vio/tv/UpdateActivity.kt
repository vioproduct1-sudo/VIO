package app.vio.tv

import android.app.Activity
import android.app.AlertDialog
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.widget.*
import androidx.core.content.FileProvider
import org.json.JSONObject
import java.io.File
import java.net.HttpURLConnection
import java.net.URL
import java.security.MessageDigest
import java.util.concurrent.Executors

class UpdateActivity:Activity(){
 private val worker=Executors.newSingleThreadExecutor()
 private val prefs by lazy{getSharedPreferences("vio",0)}
 private lateinit var status:TextView
 private lateinit var checkButton:Button
 private var busy=false
 private var pending:File?=null
 private var permissionRequested=false
 private var automatic=false
 @Volatile private var closed=false
 override fun onCreate(state:Bundle?){super.onCreate(state)
  automatic=intent.getBooleanExtra("automatic",false)
  val box=LinearLayout(this).apply{orientation=LinearLayout.VERTICAL;setPadding(48,32,48,32);setBackgroundColor(0xff0a1019.toInt())}
  fun label(value:String,size:Float)=TextView(this).apply{text=value;textSize=size;setTextColor(-1);box.addView(this)}
  label("Обновление VIO",30f)
  label("Версия ${BuildConfig.VERSION_NAME}. Настройки сохраняются при обновлении. Android попросит подтвердить установку.",21f)
  val auto=CheckBox(this).apply{text="Разрешить проверку и скачивание обновлений при запуске";textSize=22f;setTextColor(-1);isChecked=prefs.getBoolean("autoUpdate",false);setOnCheckedChangeListener{_,value->prefs.edit().putBoolean("autoUpdate",value).apply()}}
  box.addView(auto)
  status=label("Обновления загружаются только из GitHub VIO.",22f)
  checkButton=Button(this).apply{text="Проверить обновление";textSize=24f;setOnClickListener{checkUpdate()}};box.addView(checkButton)
  box.addView(Button(this).apply{text="Назад";textSize=24f;setOnClickListener{finish()}})
  setContentView(ScrollView(this).apply{addView(box)})
  if(automatic)checkUpdate()
 }
 private fun ui(action:()->Unit){runOnUiThread{if(!closed&&!isFinishing)action()}}
 private fun connection(value:String):HttpURLConnection {
  val c=URL(value).openConnection() as HttpURLConnection
  c.connectTimeout=15000;c.readTimeout=30000;c.setRequestProperty("User-Agent","VIO-Android/${BuildConfig.VERSION_NAME}")
  return c
 }
 private fun json(value:String):JSONObject{val c=connection(value);try{check(c.responseCode==200){"HTTP ${c.responseCode}"};val bytes=java.io.ByteArrayOutputStream();c.inputStream.use{input->val buffer=ByteArray(8192);while(true){val n=input.read(buffer);if(n<0)break;check(bytes.size()+n<=1024*1024);bytes.write(buffer,0,n)}};return JSONObject(bytes.toString("UTF-8"))}finally{c.disconnect()}}
 private fun checkUpdate(){if(busy)return;busy=true;checkButton.isEnabled=false;status.text="Проверяем GitHub…"
  worker.execute{try{
   val release=json(UpdatePolicy.LATEST);check(!release.optBoolean("draft")&&!release.optBoolean("prerelease"))
   check(release.getString("tag_name").startsWith("android-v"))
   val assets=release.getJSONArray("assets")
   fun asset(name:String):String{for(i in 0 until assets.length()){val a=assets.getJSONObject(i);if(a.getString("name")==name)return a.getString("browser_download_url").also{check(UpdatePolicy.allowedAsset(it))}};error("Нет файла обновления")}
   val metadata=json(asset("android-update.json"));val code=metadata.getLong("versionCode")
   if(code<=BuildConfig.VERSION_CODE){ui{busy=false;checkButton.isEnabled=true;status.text="Установлена актуальная версия";if(automatic)finish()};return@execute}
   val apkUrl=asset("VIO-TV.apk");val hash=metadata.getString("sha256");check(UpdatePolicy.validHash(hash));check(metadata.getString("applicationId")==packageName)
   ui{busy=false;checkButton.isEnabled=true;if(automatic)download(apkUrl,hash,code) else AlertDialog.Builder(this).setTitle("Доступна VIO ${metadata.getString("versionName")}").setMessage("Скачать обновление и открыть установку? Ваши настройки сохранятся.").setPositiveButton("Обновить"){_,_->download(apkUrl,hash,code)}.setNegativeButton("Позже"){_,_->if(automatic)finish()}.show()}
  }catch(_:Exception){ui{busy=false;checkButton.isEnabled=true;status.text="Не удалось проверить обновление. Проверьте интернет или повторите позже."}}
  }
 }
 private fun download(value:String,expected:String,version:Long){if(busy)return;busy=true;checkButton.isEnabled=false;status.text="Скачиваем обновление…"
  worker.execute{val dir=File(cacheDir,"updates").apply{mkdirs()};val file=File(dir,"VIO-TV.apk");try{
   val c=connection(value);val digest=MessageDigest.getInstance("SHA-256");var total=0L
   try{check(c.responseCode==200);c.inputStream.use{input->file.outputStream().use{out->val buffer=ByteArray(65536);while(true){if(closed||Thread.currentThread().isInterrupted)error("cancelled");val count=input.read(buffer);if(count<0)break;total+=count;check(total<=150L*1024*1024);digest.update(buffer,0,count);out.write(buffer,0,count)}}}}finally{c.disconnect()}
   val actual=digest.digest().joinToString(""){"%02x".format(it)};check(actual.equals(expected,true)){"Checksum mismatch"}
   verify(file,version);ui{pending=file;install()}
  }catch(_:Exception){file.delete();ui{status.text="Обновление не загружено или не прошло проверку. Установка отменена."}}
   finally{ui{busy=false;checkButton.isEnabled=true}}
  }
 }
 @Suppress("DEPRECATION") private fun verify(file:File,version:Long){
  val flags=if(Build.VERSION.SDK_INT>=28)PackageManager.GET_SIGNING_CERTIFICATES else PackageManager.GET_SIGNATURES
  val installed=packageManager.getPackageInfo(packageName,flags)
  val candidate=packageManager.getPackageArchiveInfo(file.path,flags)?:error("Invalid APK")
  check(candidate.packageName==packageName)
  val code=if(Build.VERSION.SDK_INT>=28)candidate.longVersionCode else candidate.versionCode.toLong()
  check(code==version&&code>BuildConfig.VERSION_CODE)
  fun signatures(info:android.content.pm.PackageInfo):Set<String>{val values=if(Build.VERSION.SDK_INT>=28)info.signingInfo?.apkContentsSigners else info.signatures;return values?.map{MessageDigest.getInstance("SHA-256").digest(it.toByteArray()).joinToString(""){b->"%02x".format(b)}}?.toSet()?:emptySet()}
  val trusted=signatures(installed);check(trusted.isNotEmpty()&&trusted==signatures(candidate)){"Signature mismatch"}
 }
 private fun install(){val file=pending?:return
  if(Build.VERSION.SDK_INT>=26&&!packageManager.canRequestPackageInstalls()){
   AlertDialog.Builder(this).setTitle("Разрешите обновление VIO").setMessage("В настройках Android разрешите установку из этого приложения, затем вернитесь в VIO.").setPositiveButton("Открыть настройки"){_,_->try{permissionRequested=true;startActivity(Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,Uri.parse("package:$packageName")))}catch(_:Exception){permissionRequested=false;status.text="Настройки Android → Приложения → Специальный доступ → Установка неизвестных приложений → VIO"}}.setNegativeButton("Позже",null).show();return
  }
  try{permissionRequested=false;val uri=FileProvider.getUriForFile(this,"$packageName.updates",file);startActivity(Intent(Intent.ACTION_VIEW).setDataAndType(uri,"application/vnd.android.package-archive").addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION));status.text="Подтвердите обновление в окне Android. Удалять VIO не нужно."}catch(_:Exception){status.text="На этом устройстве не найден установщик APK."}
 }
 override fun onResume(){super.onResume();if(permissionRequested&&Build.VERSION.SDK_INT>=26&&packageManager.canRequestPackageInstalls()){permissionRequested=false;install()}}
 override fun onDestroy(){closed=true;worker.shutdownNow();super.onDestroy()}
}
