package app.estudiax.android

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build

class ReminderReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val channelId = "estudiax_deadlines"
        if (Build.VERSION.SDK_INT >= 26) {
            manager.createNotificationChannel(
                NotificationChannel(channelId, "Recordatorios de tareas", NotificationManager.IMPORTANCE_DEFAULT)
            )
        }
        val title = intent.getStringExtra("title") ?: "Tienes una entrega próxima"
        val notification = if (Build.VERSION.SDK_INT >= 26) {
            Notification.Builder(context, channelId)
        } else {
            @Suppress("DEPRECATION")
            Notification.Builder(context)
        }.setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle("ESTUDIAX · Entrega mañana")
            .setContentText(title)
            .setAutoCancel(true)
            .build()
        try { manager.notify(title.hashCode(), notification) } catch (_: SecurityException) { }
    }
}
