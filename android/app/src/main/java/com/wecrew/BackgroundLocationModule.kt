package com.WeCrew.backgroundlocation

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.*
import android.os.Build
import android.util.Log
import androidx.core.app.ActivityCompat
import com.facebook.react.bridge.*
import com.WeCrew.LocationService

class BackgroundLocationModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val TAG = "BackgroundLocationModule"
        private const val CHANNEL_ID = "LocationServiceChannel"
    }

    private var isTracking = false
    private var currentUserId = ""

    override fun getName(): String = "BackgroundLocationModule"

    @ReactMethod
    fun startLocationService(options: ReadableMap, promise: Promise) {
        try {
            if (!hasLocationPermissions()) {
                promise.reject("PERMISSION_DENIED", "Location permissions not granted")
                return
            }

            currentUserId = options.getString("userId") ?: ""
            if (currentUserId.isBlank()) {
                promise.reject("INVALID_USER_ID", "User ID is required")
                return
            }

            val taskTitle = options.getString("taskTitle") ?: "Tracking Location"
            val taskDesc = options.getString("taskDesc") ?: "Location is being tracked in background"

            storeServiceData(currentUserId, getAuthToken())
            createNotificationChannel()
            startService(taskTitle, taskDesc)

            isTracking = true
            promise.resolve("Location service started")
        } catch (e: Exception) {
            Log.e(TAG, "Error starting service", e)
            promise.reject("START_FAILED", e.message)
        }
    }

    @ReactMethod
    fun stopLocationService(promise: Promise) {
        try {
            val intent = Intent(reactContext, LocationService::class.java)
            reactContext.stopService(intent)

            val prefs = reactContext.getSharedPreferences("service_data", Context.MODE_PRIVATE)
            prefs.edit().putBoolean("on_duty_status", false).apply()

            isTracking = false
            promise.resolve("Location service stopped")
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping service", e)
            promise.reject("STOP_FAILED", e.message)
        }
    }

    @ReactMethod
    fun isLocationServiceRunning(promise: Promise) {
        promise.resolve(isTracking)
    }

    private fun hasLocationPermissions(): Boolean {
        val fine = ActivityCompat.checkSelfPermission(
            reactContext, android.Manifest.permission.ACCESS_FINE_LOCATION
        ) == android.content.pm.PackageManager.PERMISSION_GRANTED

        val background = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ActivityCompat.checkSelfPermission(
                reactContext, android.Manifest.permission.ACCESS_BACKGROUND_LOCATION
            ) == android.content.pm.PackageManager.PERMISSION_GRANTED
        } else true

        return fine && background
    }

    private fun startService(title: String, desc: String) {
        val intent = Intent(reactContext, LocationService::class.java).apply {
            putExtra("taskTitle", title)
            putExtra("taskDesc", desc)
            putExtra("userId", currentUserId)
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            reactContext.startForegroundService(intent)
        } else {
            reactContext.startService(intent)
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Location Service Channel",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Used for background location tracking"
                setShowBadge(false)
            }

            val manager = reactContext.getSystemService(NotificationManager::class.java)
            manager?.createNotificationChannel(channel)
        }
    }

    private fun storeServiceData(userId: String, authToken: String) {
        val prefs = reactContext.getSharedPreferences("service_data", Context.MODE_PRIVATE)
        prefs.edit().apply {
            putString("user_id", userId)
            putString("auth_token", authToken)
            putBoolean("on_duty_status", true)
            apply()
        }
    }

    private fun getAuthToken(): String {
        val prefs = reactContext.getSharedPreferences("service_data", Context.MODE_PRIVATE)
        return prefs.getString("auth_token", "") ?: ""
    }
}