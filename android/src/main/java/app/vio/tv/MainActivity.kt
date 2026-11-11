package app.vio.tv

import android.app.Activity
import android.app.AlertDialog
import android.content.ComponentName
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.graphics.drawable.StateListDrawable
import android.net.Uri
import android.os.Bundle
import android.view.Gravity
import android.view.KeyEvent
import android.view.View
import android.widget.*
import androidx.media3.common.C
import androidx.media3.common.MediaItem
import androidx.media3.common.PlaybackException
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.Executors

data class Channel(val id:String,val name:String,val category:String,val url:String,val now:String,val next:String,val number:Int=0)
@androidx.annotation.OptIn(androidx.media3.common.util.UnstableApi::class)
class MainActivity : Activity() {
 private val prefs by lazy {getSharedPreferences("vio",0)}
 private val worker=Executors.newSingleThreadExecutor()
 private var player:ExoPlayer?=null
 private lateinit var video:PlayerView
 private lateinit var header:LinearLayout
 private lateinit var nav:LinearLayout
 private lateinit var menu:LinearLayout
 private lateinit var list:LinearLayout
 private lateinit var watch:LinearLayout
 private lateinit var details:LinearLayout
 private lateinit var title:TextView
 private lateinit var programme:TextView
 private lateinit var status:TextView
 private lateinit var star:Button
 private var channels=listOf<Channel>()
 private var current:Channel?=null
 private var category="Все категории"
 private var favoritesOnly=false
 private var full=false
 private var destroyed=false
 private var loading=false
 private var generation=0
 private val mint=0xff79ebce.toInt()
 private val favorites get()=prefs.getStringSet("favorites",emptySet())!!.toMutableSet()
 private fun dp(n:Int)=(n*resources.displayMetrics.density).toInt()
 override fun onCreate(state:Bundle?) {super.onCreate(state);window.decorView.systemUiVisibility=View.SYSTEM_UI_FLAG_FULLSCREEN or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION or View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY;build();load()}
 private fun column()=LinearLayout(this).apply{orientation=LinearLayout.VERTICAL}
 private fun text(value:String,size:Float,color:Int=Color.WHITE)=TextView(this).apply{text=value;textSize=size;setTextColor(color)}
 private fun shape(color:Int,stroke:Int=0)=GradientDrawable().apply{setColor(color);cornerRadius=dp(9).toFloat();if(stroke!=0)setStroke(dp(3),stroke)}
 private fun button(value:String,parent:LinearLayout,action:()->Unit):Button {
  val b=Button(this);b.text=value;b.textSize=if(prefs.getBoolean("large",false))23f else 18f;b.isAllCaps=false;b.setTextColor(Color.WHITE);b.gravity=Gravity.CENTER_VERTICAL or Gravity.START;b.setPadding(dp(16),dp(9),dp(16),dp(9))
  b.background=StateListDrawable().apply{addState(intArrayOf(android.R.attr.state_focused),shape(0xff24463f.toInt(),mint));addState(intArrayOf(),shape(0xff152332.toInt()))}
  val lp=LinearLayout.LayoutParams(-1,-2);lp.setMargins(dp(3),dp(4),dp(3),dp(4));b.layoutParams=lp;b.minHeight=dp(if(prefs.getBoolean("large",false))78 else 60);b.setOnClickListener{action()};parent.addView(b);return b
 }
 private fun navButton(value:String,action:()->Unit){button(value,nav,action).layoutParams=LinearLayout.LayoutParams(-2,dp(53)).apply{setMargins(dp(3),0,dp(6),0)}}
 private fun build(){
  val root=column().apply{setPadding(dp(24),dp(16),dp(24),dp(12));setBackgroundColor(0xff0a1019.toInt())};setContentView(root)
  header=LinearLayout(this).apply{gravity=Gravity.CENTER_VERTICAL};root.addView(header)
  header.addView(text("VIO",32f,mint),LinearLayout.LayoutParams(0,dp(55),1f));header.addView(text("ТЕЛЕВИДЕНИЕ",13f,0xff9aaabd.toInt()))
  nav=LinearLayout(this);root.addView(nav)
  navButton("Телеканалы"){favoritesOnly=false;category="Все категории";render()};navButton("★ Избранное"){favoritesOnly=true;render()}
  navButton("Категории"){val names=listOf("Все категории")+channels.map{it.category}.distinct();AlertDialog.Builder(this).setTitle("Категории").setItems(names.toTypedArray()){_,i->category=names[i];render()}.show()}
  navButton("Настройки"){settings()}
  val row=LinearLayout(this);root.addView(row,LinearLayout.LayoutParams(-1,0,1f))
  menu=column();row.addView(menu,LinearLayout.LayoutParams(0,-1,0.42f));menu.addView(text("КАНАЛЫ",13f,0xff9aaabd.toInt()).apply{setPadding(dp(5),dp(16),0,dp(8))})
  val scroll=ScrollView(this);menu.addView(scroll,LinearLayout.LayoutParams(-1,0,1f));list=column();scroll.addView(list);menu.addView(text("↑ ↓ Выбор · OK Просмотр · Назад Список",12f,0xff9aaabd.toInt()))
  watch=column().apply{setPadding(dp(24),dp(12),0,0)};row.addView(watch,LinearLayout.LayoutParams(0,-1,0.58f))
  video=PlayerView(this);video.useController=true;video.setBackgroundColor(Color.BLACK);watch.addView(video,LinearLayout.LayoutParams(-1,0,1f))
  details=column();watch.addView(details);title=text("Ваше телевидение",25f);details.addView(title);programme=text("Подключите каналы через администратора",16f,0xff9aaabd.toInt());details.addView(programme)
  val actions=LinearLayout(this);details.addView(actions)
  button("⛶ Весь экран",actions){setFull(true)}.layoutParams=LinearLayout.LayoutParams(0,dp(56),1f)
  star=button("☆ Избранное",actions){current?.let{val ids=favorites;if(!ids.add(it.id))ids.remove(it.id);prefs.edit().putStringSet("favorites",ids).apply();render()}};star.layoutParams=LinearLayout.LayoutParams(0,dp(56),1f)
  status=text("Выберите канал. Повторное OK — полный экран.",13f,0xffffd49a.toInt());details.addView(status)
 }
 private fun render(){list.removeAllViews();val shown=channels.filter{(category=="Все категории"||it.category==category)&&(!favoritesOnly||favorites.contains(it.id))};shown.forEach{c->
  val label=String.format("%03d",if(c.number>0)c.number else channels.indexOf(c)+1)+"   "+c.name+(if(favorites.contains(c.id))"  ★" else "")+"\n"+(c.now.ifEmpty{c.category})
  button(label,list){if(current?.id==c.id)setFull(true) else play(c)}.apply{maxLines=3}
 };if(shown.isEmpty()){list.addView(text(if(channels.isEmpty())"Подключите ваши телеканалы" else "В списке пока пусто",23f).apply{setPadding(dp(14),dp(25),dp(14),dp(14))});if(channels.isEmpty())button("Подключить плейлист",list){admin()}}
  current?.let{star.text=if(favorites.contains(it.id))"★ В избранном" else "☆ Избранное"}
 }
 private fun load(){val base=prefs.getString("server","")!!;if(base.isEmpty()){status.text="Откройте настройки и укажите адрес сервера VIO";render();return};if(loading)return;loading=true;val id=++generation;status.text="Подключение…"
  worker.execute{try{val conn=URL(base.trimEnd('/')+"/api/channels").openConnection() as HttpURLConnection;conn.connectTimeout=10000;conn.readTimeout=15000;val data=try{if(conn.responseCode!=200)error("HTTP ${conn.responseCode}");conn.inputStream.bufferedReader().use{it.readText()}}finally{conn.disconnect()}
   val arr=JSONObject(data).getJSONArray("channels");val result=(0 until arr.length()).map{val c=arr.getJSONObject(it);Channel(c.getString("id"),c.getString("name"),c.getString("category"),c.getString("url"),c.optJSONObject("now")?.optString("title")?:"",c.optJSONObject("next")?.optString("title")?:"",c.optInt("number",it+1))}
   runOnUiThread{if(!destroyed&&id==generation){channels=result;loading=false;status.text="Сервер подключён · ${channels.size} каналов";render();if(current==null&&prefs.getBoolean("resume",true))channels.find{it.id==prefs.getString("last","")}?.let{play(it)}}}
  }catch(e:Exception){runOnUiThread{if(!destroyed&&id==generation){loading=false;status.text="Нет связи с сервером VIO. Проверьте адрес и сеть.";render()}}}}
 }
 private fun initPlayer(){if(player!=null)return;player=ExoPlayer.Builder(this).build().also{p->video.player=p;p.addListener(object:Player.Listener{override fun onPlayerError(error:PlaybackException){status.text="Поток недоступен. Настройки → Резервный плеер"}})};applyTracks()}
 private fun applyTracks(){player?.let{p->p.trackSelectionParameters=p.trackSelectionParameters.buildUpon().setPreferredAudioLanguage(prefs.getString("audio","ru")).setMaxVideoSize(if(prefs.getBoolean("hd",false))1280 else Int.MAX_VALUE,if(prefs.getBoolean("hd",false))720 else Int.MAX_VALUE).setTrackTypeDisabled(C.TRACK_TYPE_TEXT,!prefs.getBoolean("subtitles",false)).build()};video.resizeMode=if(prefs.getBoolean("fill",false))androidx.media3.ui.AspectRatioFrameLayout.RESIZE_MODE_ZOOM else androidx.media3.ui.AspectRatioFrameLayout.RESIZE_MODE_FIT}
 private fun play(c:Channel){current=c;prefs.edit().putString("last",c.id).apply();title.text=c.name;programme.text=c.now.ifEmpty{"Телепрограмма не найдена"}+(if(c.next.isNotEmpty())"\nДалее: "+c.next else "");status.text="OK на выбранном канале — весь экран";initPlayer();player?.setMediaItem(MediaItem.fromUri(c.url));player?.prepare();player?.playWhenReady=true;star.text=if(favorites.contains(c.id))"★ В избранном" else "☆ Избранное"}
 private fun setFull(value:Boolean){if(current==null)return;full=value;header.visibility=if(value)View.GONE else View.VISIBLE;nav.visibility=if(value)View.GONE else View.VISIBLE;menu.visibility=if(value)View.GONE else View.VISIBLE;details.visibility=if(value)View.GONE else View.VISIBLE;watch.setPadding(if(value)0 else dp(24),if(value)0 else dp(12),0,0);if(value)video.requestFocus() else list.getChildAt(0)?.requestFocus()}
 @Deprecated("TV back navigation") override fun onBackPressed(){if(full)setFull(false) else AlertDialog.Builder(this).setTitle("Закрыть VIO?").setPositiveButton("Закрыть"){_,_->finish()}.setNegativeButton("Остаться",null).show()}
 override fun onKeyDown(code:Int,event:KeyEvent):Boolean {if(code==KeyEvent.KEYCODE_CHANNEL_UP||code==KeyEvent.KEYCODE_CHANNEL_DOWN){if(channels.isNotEmpty()){val i=channels.indexOfFirst{it.id==current?.id};play(channels[(i+(if(code==KeyEvent.KEYCODE_CHANNEL_UP)1 else -1)+channels.size)%channels.size])};return true};return super.onKeyDown(code,event)}
 private fun external(){current?.let{try{startActivity(Intent(Intent.ACTION_VIEW).setDataAndType(Uri.parse(it.url),"video/*"))}catch(_:Exception){Toast.makeText(this,"Установите VLC или другой плеер",Toast.LENGTH_LONG).show()}}}
 private fun admin(){val base=prefs.getString("server","")!!;if(base.isEmpty()){Toast.makeText(this,"Сначала укажите сервер VIO",Toast.LENGTH_LONG).show();return};startActivity(Intent(this,AdminActivity::class.java).putExtra("server",base))}
 private fun settings(){val box=column().apply{setPadding(dp(20),dp(10),dp(20),dp(10))};val server=EditText(this).apply{hint="Адрес VIO: http://192.168.8.222:8088";setText(prefs.getString("server",""));inputType=android.text.InputType.TYPE_CLASS_TEXT or android.text.InputType.TYPE_TEXT_VARIATION_URI};box.addView(server)
  fun check(label:String,key:String,default:Boolean=false){val c=CheckBox(this);c.text=label;c.textSize=18f;c.isChecked=prefs.getBoolean(key,default);c.setOnCheckedChangeListener{_,v->prefs.edit().putBoolean(key,v).apply()};box.addView(c)}
  check("Крупный простой режим","large");check("Включать последний канал при запуске","resume",true);check("Автозапуск после загрузки (если разрешено ТВ)","boot");check("Видео до 720p (для многовариантного потока)","hd");check("Заполнять экран","fill");check("Субтитры","subtitles")
  button("Звук: русский / исходный",box){val next=if(prefs.getString("audio","ru")=="ru")"" else "ru";prefs.edit().putString("audio",next).apply();Toast.makeText(this,if(next.isEmpty())"Исходный звук" else "Русский звук",Toast.LENGTH_SHORT).show()}
  button("Резервный плеер",box){external()};button("Администратор · плейлисты и EPG",box){admin()}
  button("Выбрать VIO домашним экраном",box){try{packageManager.setComponentEnabledSetting(ComponentName(this,"app.vio.tv.HomeActivity"),PackageManager.COMPONENT_ENABLED_STATE_ENABLED,PackageManager.DONT_KILL_APP);startActivity(Intent(android.provider.Settings.ACTION_HOME_SETTINGS))}catch(_:Exception){Toast.makeText(this,"Этот телевизор не предоставляет выбор домашнего экрана",Toast.LENGTH_LONG).show()}}
  button("Отключить VIO Launcher",box){packageManager.setComponentEnabledSetting(ComponentName(this,"app.vio.tv.HomeActivity"),PackageManager.COMPONENT_ENABLED_STATE_DISABLED,PackageManager.DONT_KILL_APP)}
  val scroll=ScrollView(this);scroll.addView(box);val dialog=AlertDialog.Builder(this).setTitle("Настройки VIO").setView(scroll).setPositiveButton("Сохранить",null).setNegativeButton("Закрыть",null).create()
  dialog.setOnShowListener{dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener{val u=Uri.parse(server.text.toString().trim());if(u.scheme !in listOf("http","https")||u.host.isNullOrEmpty()||u.userInfo!=null){server.error="Укажите HTTP(S)-адрес сервера VIO"}else{prefs.edit().putString("server",server.text.toString().trim().trimEnd('/')).apply();applyTracks();render();load();dialog.dismiss()}}};dialog.show()
 }
 override fun onStop(){super.onStop();player?.release();player=null;video.player=null}
 override fun onStart(){super.onStart();current?.let{play(it)}}
 override fun onDestroy(){destroyed=true;generation++;worker.shutdownNow();player?.release();super.onDestroy()}
}
