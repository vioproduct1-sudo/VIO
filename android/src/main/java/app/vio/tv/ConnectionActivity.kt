package app.vio.tv

import android.app.Activity
import android.app.AlertDialog
import android.graphics.Color
import android.os.Bundle
import android.text.InputFilter
import android.text.InputType
import android.widget.*
import java.security.MessageDigest
import java.security.SecureRandom
import java.util.concurrent.Executors
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.PBEKeySpec

class ConnectionActivity:Activity(){
 private val prefs by lazy{getSharedPreferences("vio",0)}
 private val worker=Executors.newSingleThreadExecutor()
 private var verified=false
 private fun box()=LinearLayout(this).apply{orientation=LinearLayout.VERTICAL;setPadding(32,20,32,20)}
 private fun pinInput()=EditText(this).apply{hint="8 цифр";textSize=24f;inputType=InputType.TYPE_CLASS_NUMBER or InputType.TYPE_NUMBER_VARIATION_PASSWORD;filters=arrayOf(InputFilter.LengthFilter(8))}
 private fun hash(pin:String,salt:ByteArray):ByteArray{val spec=PBEKeySpec(pin.toCharArray(),salt,120000,256);return try{SecretKeyFactory.getInstance("PBKDF2WithHmacSHA1").generateSecret(spec).encoded}finally{spec.clearPassword()}}
 override fun onCreate(state:Bundle?){super.onCreate(state);authenticate(false)}
 private fun authenticate(reset:Boolean){
  if(System.currentTimeMillis()<prefs.getLong("nativePinBlocked",0)){Toast.makeText(this,"Три ошибки PIN. Подождите 30 секунд.",Toast.LENGTH_LONG).show();finish();return}
  val setup=reset||!prefs.contains("nativePinHash");val box=box();val first=pinInput();box.addView(first);val repeat=if(setup)pinInput().also{it.hint="Повторите PIN";box.addView(it)}else null
  val dialog=AlertDialog.Builder(this).setTitle(if(setup)"Создайте PIN администратора VIO" else "Администратор VIO").setView(box).setPositiveButton("Продолжить",null).setNegativeButton("Отмена"){_,_->if(!verified)finish()}.setOnCancelListener{if(!verified)finish()}.create()
  dialog.setOnShowListener{dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener{
   val pin=first.text.toString();if(!pin.matches(Regex("\\d{8}"))){first.error="Нужно ровно 8 цифр";return@setOnClickListener};if(repeat!=null&&repeat.text.toString()!=pin){repeat.error="PIN не совпадает";return@setOnClickListener}
   dialog.getButton(AlertDialog.BUTTON_POSITIVE).isEnabled=false
   worker.execute{try{val salt=if(setup)ByteArray(16).also{SecureRandom().nextBytes(it)}else android.util.Base64.decode(prefs.getString("nativePinSalt","")!!,android.util.Base64.NO_WRAP);val derived=hash(pin,salt);val ok=setup||MessageDigest.isEqual(derived,android.util.Base64.decode(prefs.getString("nativePinHash","")!!,android.util.Base64.NO_WRAP))
    runOnUiThread{if(isFinishing||isDestroyed)return@runOnUiThread;dialog.getButton(AlertDialog.BUTTON_POSITIVE).isEnabled=true;if(ok){if(setup)prefs.edit().putString("nativePinSalt",android.util.Base64.encodeToString(salt,android.util.Base64.NO_WRAP)).putString("nativePinHash",android.util.Base64.encodeToString(derived,android.util.Base64.NO_WRAP)).apply();prefs.edit().putInt("nativePinFailures",0).apply();verified=true;dialog.dismiss();showSettings()}else{first.text.clear();first.error="Неверный PIN";val failures=prefs.getInt("nativePinFailures",0)+1;prefs.edit().putInt("nativePinFailures",if(failures>=3)0 else failures).apply();if(failures>=3){prefs.edit().putLong("nativePinBlocked",System.currentTimeMillis()+30000).apply();dialog.dismiss();finish()}}}
   }catch(_:Exception){runOnUiThread{if(!isFinishing){dialog.getButton(AlertDialog.BUTTON_POSITIVE).isEnabled=true;first.error="Не удалось проверить PIN. Повторите попытку."}}}}
  }};dialog.show()
 }
 private fun showSettings(){if(!verified)return;val box=box().apply{setBackgroundColor(0xff0a1019.toInt())}
  fun title(value:String){box.addView(TextView(this).apply{text=value;textSize=23f;setTextColor(Color.WHITE);setPadding(0,16,0,8)})}
  title("Подключение VIO · только на этом устройстве")
  val direct=CheckBox(this).apply{text="Каналы напрямую по ключу iEdem (без NAS)";textSize=22f;setTextColor(Color.WHITE);isChecked=prefs.getBoolean("directMode",prefs.getString("server","").isNullOrEmpty())};box.addView(direct)
  title("Ключ телеканалов iEdem")
  val key=EditText(this).apply{setSingleLine(true);textSize=23f;setTextColor(Color.WHITE);setText(prefs.getString("iedemKey",""));inputType=InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_FLAG_NO_SUGGESTIONS};box.addView(key)
  title("Персональная ссылка медиатеки из кабинета")
  val portal=EditText(this).apply{minLines=2;maxLines=4;textSize=20f;setTextColor(Color.WHITE);hint="portal::[key:ВАШ_КЛЮЧ]http://адрес/api/v1/";setText(prefs.getString("mediaPortal",""));inputType=InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_FLAG_MULTI_LINE or InputType.TYPE_TEXT_FLAG_NO_SUGGESTIONS};box.addView(portal)
  title("Ключи не отправляются в GitHub. Адрес медиатеки можно заменить, если провайдер обновит домен.")
  box.addView(Button(this).apply{text="Сохранить подключение";textSize=24f;setOnClickListener{
   val k=key.text.toString().trim();val p=portal.text.toString().trim();if(k.isNotEmpty()&&!ProviderAccess.validKey(k)){key.error="Ключ: от 8 букв или цифр, также _ и -";return@setOnClickListener};if(p.isNotEmpty()&&ProviderAccess.parsePortal(p)==null){portal.error="Вставьте полную ссылку portal::[key:…]http(s)://…";return@setOnClickListener}
   if(direct.isChecked&&k.isEmpty()&&p.isEmpty()){key.error="Введите ключ каналов или ссылку медиатеки";return@setOnClickListener}
   prefs.edit().putBoolean("directMode",direct.isChecked).putString("iedemKey",k).putString("mediaPortal",p).putInt("sourceRevision",prefs.getInt("sourceRevision",0)+1).apply();Toast.makeText(this@ConnectionActivity,"Подключение сохранено на устройстве",Toast.LENGTH_LONG).show();finish()
  }})
  box.addView(Button(this).apply{text="Сменить PIN администратора";textSize=22f;setOnClickListener{authenticate(true)}})
  box.addView(Button(this).apply{text="Назад";textSize=22f;setOnClickListener{finish()}})
  setContentView(ScrollView(this).apply{addView(box)})
 }
 override fun onDestroy(){worker.shutdownNow();super.onDestroy()}
}
