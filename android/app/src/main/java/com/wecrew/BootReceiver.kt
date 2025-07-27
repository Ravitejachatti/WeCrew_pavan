package com.WeCrew

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import com.WeCrew.LocationService // ✅ Import the service properly

class BootReceiver : BroadcastReceiver() {

    companion object {
        private const val TAG = "BootReceiver"
    }

    override fun onReceive(context: Context, intent: Intent) {
        when (intent.action) {
            Intent.ACTION_BOOT_COMPLETED,
            Intent.ACTION_MY_PACKAGE_REPLACED,
            Intent.ACTION_PACKAGE_REPLACED -> {
                Log.d(TAG, "Boot completed or package replaced")

                val sharedPrefs = context.getSharedPreferences("location_prefs", Context.MODE_PRIVATE)
                val wasOnDuty = sharedPrefs.getBoolean("on_duty_status", false)

                if (wasOnDuty) {
                    Log.d(TAG, "Restarting location service after boot")
                    val serviceIntent = Intent(context, LocationService::class.java).apply {
                        putExtra("taskTitle", "Location Tracking")
                        putExtra("taskDesc", "Resumed tracking after device restart")
                    }

                    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                        context.startForegroundService(serviceIntent)
                    } else {
                        context.startService(serviceIntent)
                    }
                }
            }
        }
    }
}