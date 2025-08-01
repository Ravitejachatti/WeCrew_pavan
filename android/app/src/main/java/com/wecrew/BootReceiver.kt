package com.WeCrew

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log

class BootReceiver : BroadcastReceiver() {

    companion object {
        private const val TAG = "BootReceiver"
    }

    override fun onReceive(context: Context, intent: Intent) {
        when (intent.action) {
            Intent.ACTION_BOOT_COMPLETED,
            "android.intent.action.QUICKBOOT_POWERON" -> {
                Log.d(TAG, "Device booted, starting background services")
                
                // Start existing location service if user was on duty
                restartLocationServiceIfNeeded(context)
                
                // Start request handler service for FCM
                startRequestHandlerService(context)
            }
        }
    }

    private fun restartLocationServiceIfNeeded(context: Context) {
        val sharedPrefs = context.getSharedPreferences("service_data", Context.MODE_PRIVATE)
        val wasOnDuty = sharedPrefs.getBoolean("on_duty_status", false)
        val userId = sharedPrefs.getString("user_id", "")

        if (wasOnDuty && !userId.isNullOrEmpty()) {
            Log.d(TAG, "Restarting location service after boot for user: $userId")
            
            val serviceIntent = Intent(context, LocationService::class.java).apply {
                putExtra("taskTitle", "Location Tracking")
                putExtra("taskDesc", "Resumed tracking after device restart")
                putExtra("userId", userId)
            }

            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    context.startForegroundService(serviceIntent)
                } else {
                    context.startService(serviceIntent)
                }
                Log.d(TAG, "Location service restarted successfully")
            } catch (e: Exception) {
                Log.e(TAG, "Failed to restart location service", e)
            }
        } else {
            Log.d(TAG, "Not restarting location service - user was not on duty or no user ID")
        }
    }

    private fun startRequestHandlerService(context: Context) {
        try {
            // Start RequestHandlerService to listen for FCM messages
            val serviceIntent = Intent(context, RequestHandlerService::class.java)
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(serviceIntent)
            } else {
                context.startService(serviceIntent)
            }
            
            Log.d(TAG, "Request handler service started successfully")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start request handler service", e)
        }
    }
}

// NEW - AutoStartReceiver for app updates
class AutoStartReceiver : BroadcastReceiver() {
    
    companion object {
        private const val TAG = "AutoStartReceiver"
    }
    
    override fun onReceive(context: Context, intent: Intent) {
        when (intent.action) {
            Intent.ACTION_MY_PACKAGE_REPLACED,
            Intent.ACTION_PACKAGE_REPLACED -> {
                if (intent.dataString?.contains(context.packageName) == true) {
                    Log.d(TAG, "App updated, restarting services")
                    
                    // Restart services after app update
                    val serviceIntent = Intent(context, RequestHandlerService::class.java)
                    
                    try {
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                            context.startForegroundService(serviceIntent)
                        } else {
                            context.startService(serviceIntent)
                        }
                        Log.d(TAG, "Services restarted after app update")
                    } catch (e: Exception) {
                        Log.e(TAG, "Failed to restart services after app update", e)
                    }
                }
            }
        }
    }
}