// LocationService.kt - Foreground Service
package com.WeCrew

import android.app.Service
import android.content.Intent
import android.os.IBinder
import android.util.Log
import android.app.Notification
import androidx.core.app.NotificationCompat
class LocationService : Service() {
    
    companion object {
        private const val NOTIFICATION_ID = 1
        private const val CHANNEL_ID = "LocationServiceChannel"
        private const val TAG = "LocationService"
    }

    override fun onCreate() {
        super.onCreate()
        Log.d(TAG, "Location service created")
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val taskTitle = intent?.getStringExtra("taskTitle") ?: "Location Tracking"
        val taskDesc = intent?.getStringExtra("taskDesc") ?: "Tracking your location while on duty"
        val userId = intent?.getStringExtra("userId") 

        val notification = createNotification(taskTitle, taskDesc)
        startForeground(NOTIFICATION_ID, notification)

        Log.d(TAG, "Location service started in foreground")
        return START_STICKY // Restart if killed by system
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        super.onDestroy()
        Log.d(TAG, "Location service destroyed")
    }

    private fun createNotification(title: String, description: String): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(description)
            .setSmallIcon(android.R.drawable.ic_menu_mylocation)
            .setOngoing(true)
            .setAutoCancel(false)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .build()
    }
}