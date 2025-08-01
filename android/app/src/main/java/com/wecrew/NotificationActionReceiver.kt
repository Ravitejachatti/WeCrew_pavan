package com.WeCrew

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.widget.Toast

class NotificationActionReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.getStringExtra("action")
        val requestId = intent.getStringExtra("requestId")

        MyFirebaseMessagingService.mediaPlayer?.stop()
        MyFirebaseMessagingService.mediaPlayer?.release()
        MyFirebaseMessagingService.mediaPlayer = null

        Toast.makeText(context, "Action: $action for Request: $requestId", Toast.LENGTH_SHORT).show()

        // You can start a foreground service or an activity here
 

        // Optionally send data to server or update UI via shared preferences or DB
    }
}