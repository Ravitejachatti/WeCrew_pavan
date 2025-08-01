package com.WeCrew

import android.app.*
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat

class RequestHandlerService : Service() {

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // Start as foreground service
        startForeground(NOTIFICATION_ID, createServiceNotification())
        
        // Handle the request
        handleIncomingRequest(intent)
        
        return START_NOT_STICKY
    }

    private fun handleIncomingRequest(intent: Intent?) {
        intent?.let {
            val requestData = mutableMapOf<String, String>()
            
            // Extract all request data
            it.extras?.keySet()?.forEach { key ->
                requestData[key] = it.getStringExtra(key) ?: ""
            }
            
            // Store request data  requestData manager
            

            // Check if we can show overlay
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                if (android.provider.Settings.canDrawOverlays(this)) {
                    // Start overlay service
                    val overlayIntent = Intent(this, OverlayService::class.java)
                    requestData.forEach { (key, value) ->
                        overlayIntent.putExtra(key, value)
                    }
                    startService(overlayIntent)
                } else {
                    // Launch main activity
                    launchMainActivity(requestData)
                }
            } else {
                // For older versions, directly start overlay
                val overlayIntent = Intent(this, OverlayService::class.java)
                requestData.forEach { (key, value) ->
                    overlayIntent.putExtra(key, value)
                }
                startService(overlayIntent)
            }
        }
        
        // Stop self after handling
        stopSelf()
    }

    private fun launchMainActivity(requestData: Map<String, String>) {
        val mainIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            requestData.forEach { (key, value) ->
                putExtra(key, value)
            }
            putExtra("showRequestModal", true)
            putExtra("fromService", true)
        }
        startActivity(mainIntent)
    }

    private fun createServiceNotification(): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("WeCrew - Processing Request")
            .setContentText("Handling incoming repair request...")
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setAutoCancel(false)
            .build()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Request Handler Service",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Handles incoming repair requests"
            }
            
            val notificationManager = getSystemService(NotificationManager::class.java)
            notificationManager.createNotificationChannel(channel)
        }
    }

    companion object {
        private const val CHANNEL_ID = "request_handler_channel"
        private const val NOTIFICATION_ID = 103
    }
}