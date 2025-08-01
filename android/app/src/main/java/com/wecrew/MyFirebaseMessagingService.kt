package com.WeCrew

import android.app.*
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.media.MediaPlayer
import android.os.*
import android.util.Log
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class MyFirebaseMessagingService : FirebaseMessagingService() {
    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        val data = remoteMessage.data
        if (data.isEmpty()) return

        Log.d("FCM", "Received request: $data")

        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("showRequestModal", true)
            data.forEach { putExtra(it.key, it.value) }
        }

        startActivity(intent)
        playSound()
        showNotification(data)
    }

    private fun showNotification(data: Map<String, String>) {
        createNotificationChannel()

        val notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("🔧 New Repair Request")
            .setContentText(data["issueDescription"] ?: "You have a new request.")
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setTimeoutAfter(30000)
            .setAutoCancel(true)
            .build()

        val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.notify(NOTIFICATION_ID, notification)

        Handler(Looper.getMainLooper()).postDelayed({ manager.cancel(NOTIFICATION_ID) }, 30000)
    }

    private fun playSound() {
        stopSound()

        mediaPlayer = MediaPlayer()
        val afd = resources.openRawResourceFd(R.raw.notification_sound)
        mediaPlayer?.setDataSource(afd.fileDescriptor, afd.startOffset, afd.length)
        afd.close()

        mediaPlayer?.isLooping = true
        mediaPlayer?.prepare()
        mediaPlayer?.start()

        Log.d("FCM", "Sound started (looping)")

        Handler(Looper.getMainLooper()).postDelayed({
            stopSound()
            Log.d("FCM", "Sound auto-stopped after 30s")
        }, 30000)
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(CHANNEL_ID, "Requests", NotificationManager.IMPORTANCE_HIGH).apply {
                description = "Repair request alerts"
                enableLights(true)
                lightColor = Color.RED
                lockscreenVisibility = Notification.VISIBILITY_PUBLIC
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    companion object {
        const val CHANNEL_ID = "repair_channel"
        const val NOTIFICATION_ID = 9001
        var mediaPlayer: MediaPlayer? = null

        fun stopSound() {
            try {
                mediaPlayer?.stop()
                Log.d("FCM", "Sound stopped manually")
            } catch (e: IllegalStateException) {
                Log.e("FCM", "Error while stopping sound: ${e.message}")
            } finally {
                mediaPlayer?.release()
                mediaPlayer = null
            }
        }
    }
}