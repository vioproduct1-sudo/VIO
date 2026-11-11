package app.vio.tv
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
class BootReceiver : BroadcastReceiver() {
 override fun onReceive(context: Context, intent: Intent) {
  if (intent.action == Intent.ACTION_BOOT_COMPLETED && context.getSharedPreferences("vio",0).getBoolean("boot",false)) {
   try { context.startActivity(Intent(context,MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)) } catch (_: Exception) { }
  }
 }
}
