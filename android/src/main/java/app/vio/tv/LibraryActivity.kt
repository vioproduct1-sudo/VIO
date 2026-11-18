package app.vio.tv

import android.app.Activity
import android.app.AlertDialog
import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.common.PlaybackException
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView
import org.json.JSONObject
import java.util.concurrent.Executors

@androidx.annotation.OptIn(androidx.media3.common.util.UnstableApi::class)
class LibraryActivity:Activity(){
 private val worker=Executors.newSingleThreadExecutor()
 private var client:PortalClient?=null
 private var player:ExoPlayer?=null
 private lateinit var video:PlayerView
 private lateinit var list:ListView
 private lateinit var heading:TextView
 private lateinit var actions:LinearLayout
 private lateinit var status:TextView
 private val stack=mutableListOf<Pair<String,JSONObject>>()
 private var currentRequest=JSONObject()
 private var currentTitle="Медиатека VIO"
 private var currentItems=listOf<JSONObject>()
 private var lastStream=""
 private var full=false
 @Volatile private var closed=false
 private var generation=0
 private fun ui(action:()->Unit){runOnUiThread{if(!closed&&!isFinishing)action()}}
 override fun onCreate(state:Bundle?){super.onCreate(state);volumeControlStream=android.media.AudioManager.STREAM_MUSIC
  window.decorView.systemUiVisibility=View.SYSTEM_UI_FLAG_FULLSCREEN or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION or View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
  val root=LinearLayout(this).apply{orientation=LinearLayout.VERTICAL;setPadding(24,16,24,16);setBackgroundColor(0xff0a1019.toInt())};setContentView(root)
  heading=TextView(this).apply{text="Медиатека VIO";textSize=28f;setTextColor(0xff79ebce.toInt())};root.addView(heading)
  actions=LinearLayout(this);root.addView(actions)
  fun button(label:String,action:()->Unit){actions.addView(Button(this).apply{text=label;textSize=20f;setOnClickListener{action()}},LinearLayout.LayoutParams(0,64,1f))}
  button("Телеканалы"){finish()};button("Назад"){back()};button("Подключение"){startActivity(Intent(this,ConnectionActivity::class.java))};button("Весь экран"){if(lastStream.isNotEmpty())setFull(true)}
  video=PlayerView(this).apply{useController=true;setBackgroundColor(Color.BLACK)};root.addView(video,LinearLayout.LayoutParams(-1,0,1f))
  status=TextView(this).apply{textSize=19f;setTextColor(Color.WHITE)};root.addView(status)
  list=ListView(this).apply{isFocusable=true;isFocusableInTouchMode=true;setSelector(android.graphics.drawable.ColorDrawable(0xff246557.toInt()))};root.addView(list,LinearLayout.LayoutParams(-1,0,1f))
  list.setOnItemClickListener{_,_,position,_->currentItems.getOrNull(position)?.let{choose(it)}}
  openConnection()
 }
 private var configured=""
 private fun openConnection(){val value=getSharedPreferences("vio",0).getString("mediaPortal","")?:"";if(value==configured&&client!=null)return;configured=value;client?.cancel();val access=ProviderAccess.parsePortal(value);if(access==null){status.text="Откройте «Подключение» и вставьте персональную ссылку медиатеки из кабинета iEdem.";return};client=PortalClient(access);stack.clear();load(JSONObject(),"Медиатека VIO")}
 override fun onResume(){super.onResume();if(::status.isInitialized)openConnection()}
 private fun load(params:JSONObject,title:String){val rpc=client?:return;val id=++generation;rpc.cancel();status.text="Загружаем раздел…";list.isEnabled=false
  worker.execute{try{val request=JSONObject(params.toString()).put("limit",30);val response=rpc.request(request);check(response.optString("type") in listOf("videoportal","category","multistream"));val arr=response.getJSONArray("items");check(arr.length()<=1001)
   val rows=(0 until arr.length()).mapNotNull{arr.optJSONObject(it)}.filter{it.optString("type") in listOf("category","stream","next","back")}
   ui{if(id!=generation)return@ui;currentRequest=request;currentTitle=title;heading.text=title;currentItems=rows;list.adapter=object:ArrayAdapter<String>(this,android.R.layout.simple_list_item_1,rows.map{item->when(item.optString("type")){"next"->"Следующая страница →";"back"->"← Назад";"category"->"▸ "+item.optString("title","Раздел");else->item.optString("title","Видео")}}){override fun getView(position:Int,convert:View?,parent:android.view.ViewGroup):View{return (super.getView(position,convert,parent) as TextView).apply{textSize=23f;setTextColor(Color.WHITE);minHeight=64;setPadding(16,12,16,12)}}};list.isEnabled=true;status.text=if(rows.isEmpty())"В этом разделе пока нет видео" else "Выберите фильм, сериал или раздел";list.requestFocus()}
  }catch(_:Exception){ui{if(id==generation){list.isEnabled=true;status.text="Не удалось открыть медиатеку. Проверьте подписку и обновите ссылку в кабинете, если домен изменился."}}}}
 }
 private fun choose(item:JSONObject){when(item.optString("type")){
  "back"->back()
  "next"->{val next=JSONObject(currentRequest.toString());val supplied=item.optJSONObject("request")?:return;val names=supplied.keys();while(names.hasNext()){val k=names.next();if(k!="key"&&k!="app")next.put(k,supplied.get(k))};if(!next.has("offset"))next.put("offset",currentRequest.optInt("offset")+currentItems.count{it.optString("type")!="next"});stack.add(currentTitle to currentRequest);load(next,currentTitle)}
  "category"->{val params=item.optJSONObject("request");if(params==null){status.text="Этот раздел требует другого формата каталога";return};stack.add(currentTitle to currentRequest);load(params,item.optString("title","Раздел"))}
  "stream"->resolve(item)
 }}
 private fun resolve(item:JSONObject){val rpc=client?:return;val id=++generation;rpc.cancel();status.text="Открываем видео…";list.isEnabled=false
  worker.execute{try{val request=item.optJSONObject("request");val response=if(request!=null)rpc.request(request) else item;val variants=response.optJSONObject("variants");val choices=mutableListOf<Pair<String,String>>();if(variants!=null){val names=variants.keys();while(names.hasNext()){val name=names.next();val url=variants.optString(name);if(ProviderAccess.mediaUrl(url))choices.add(name to url)}};val direct=response.optString("url");if(choices.isEmpty()&&ProviderAccess.mediaUrl(direct))choices.add("Исходное качество" to direct);check(choices.isNotEmpty())
   ui{if(id!=generation)return@ui;list.isEnabled=true;if(choices.size==1)play(choices[0].second,item.optString("title","Видео"))else AlertDialog.Builder(this).setTitle("Качество видео").setItems(choices.map{it.first}.toTypedArray()){_,i->play(choices[i].second,item.optString("title","Видео"))}.show()}
  }catch(_:Exception){ui{if(id==generation){list.isEnabled=true;status.text="Провайдер не вернул доступное видео. Проверьте подписку и повторите выбор."}}}}
 }
 private fun play(url:String,title:String){lastStream=url;heading.text=title;player?.release();player=ExoPlayer.Builder(this).build().also{p->video.player=p;p.addListener(object:Player.Listener{override fun onPlayerError(error:PlaybackException){status.text="Не удалось воспроизвести видео (${error.errorCodeName}). Повторно выберите фильм для обновления ссылки."}});p.setMediaItem(MediaItem.fromUri(url));p.prepare();p.playWhenReady=true};status.text="Видео открыто в плеере VIO"}
 private fun setFull(value:Boolean){full=value;actions.visibility=if(value)View.GONE else View.VISIBLE;list.visibility=if(value)View.GONE else View.VISIBLE;status.visibility=if(value)View.GONE else View.VISIBLE;heading.visibility=if(value)View.GONE else View.VISIBLE;if(value)video.requestFocus() else list.requestFocus()}
 private fun back(){if(full){setFull(false);return};if(stack.isEmpty()){finish();return};val (title,params)=stack.removeAt(stack.lastIndex);load(params,title)}
 @Deprecated("TV back navigation") override fun onBackPressed(){back()}
 override fun onStop(){super.onStop();player?.release();player=null;video.player=null}
 override fun onDestroy(){closed=true;generation++;client?.cancel();worker.shutdownNow();player?.release();super.onDestroy()}
}
