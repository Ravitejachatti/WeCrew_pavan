
// BackgroundLocationModule.kt
package com.WeCrew.backgroundlocation
import com.WeCrew.LocationService

import android.Manifest
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Build
import android.os.Bundle
import android.os.IBinder
import android.util.Log
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationCompat
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import kotlinx.coroutines.*
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException
import okhttp3.Callback
import com.google.firebase.FirebaseApp
import com.google.firebase.database.FirebaseDatabase

class BackgroundLocationModule(private val reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext), LocationListener {

    private var locationManager: LocationManager? = null
    private var isTracking = false
    private var currentUserId: String = ""
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    companion object {
        private const val TAG = "BackgroundLocation"
        private const val CHANNEL_ID = "LocationServiceChannel"
        private const val NOTIFICATION_ID = 1
        private const val MIN_TIME_BETWEEN_UPDATES = 30000L // 30 seconds
        private const val MIN_DISTANCE_CHANGE = 10f // 10 meters
    }

    override fun getName(): String = "BackgroundLocationModule"

    @ReactMethod
    fun startLocationService(options: ReadableMap, promise: Promise) {
        try {
            if (!hasLocationPermissions()) {
                promise.reject("PERMISSION_DENIED", "Location permissions not granted")
                return
            }
            val userId = options.getString("userId") ?: ""
            if (userId.isEmpty()) {
                promise.reject("INVALID_USER_ID", "User ID is required")
                return
            }

            currentUserId = userId

            createNotificationChannel()
            initializeLocationManager()
            startLocationUpdates()
            startPeriodicLocationUpdates() 
            startForegroundService(options)
            
            isTracking = true
            promise.resolve("Location service started successfully")
            
        } catch (e: Exception) {
            Log.e(TAG, "Error starting location service", e)
            promise.reject("START_ERROR", "Failed to start location service: ${e.message}")
        }
    }

    @ReactMethod
    fun stopLocationService(promise: Promise) {
        try {
            stopLocationUpdates()
            stopForegroundService()
            isTracking = false
            promise.resolve("Location service stopped successfully")
            
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping location service", e)
            promise.reject("STOP_ERROR", "Failed to stop location service: ${e.message}")
        }
    }

    @ReactMethod
    fun isLocationServiceRunning(promise: Promise) {
        promise.resolve(isTracking)
    }

    private fun hasLocationPermissions(): Boolean {
        val fineLocation = ActivityCompat.checkSelfPermission(
            reactContext, Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED

        val coarseLocation = ActivityCompat.checkSelfPermission(
            reactContext, Manifest.permission.ACCESS_COARSE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED

        val backgroundLocation = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ActivityCompat.checkSelfPermission(
                reactContext, Manifest.permission.ACCESS_BACKGROUND_LOCATION
            ) == PackageManager.PERMISSION_GRANTED
        } else {
            true
        }

        return fineLocation && coarseLocation && backgroundLocation
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val serviceChannel = NotificationChannel(
                CHANNEL_ID,
                "Location Service Channel",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Channel for location tracking service"
                setShowBadge(false)
            }

            val manager = reactContext.getSystemService(NotificationManager::class.java)
            manager?.createNotificationChannel(serviceChannel)
        }
    }

    private fun initializeLocationManager() {
        locationManager = reactContext.getSystemService(Context.LOCATION_SERVICE) as LocationManager
    }

    private fun startLocationUpdates() {
        try {
            if (ActivityCompat.checkSelfPermission(
                    reactContext, Manifest.permission.ACCESS_FINE_LOCATION
                ) != PackageManager.PERMISSION_GRANTED
            ) {
                Log.e(TAG, "Location permission not granted")
                return
            }

            locationManager?.let { manager ->
                // Request updates from GPS provider
                if (manager.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
                    manager.requestLocationUpdates(
                        LocationManager.GPS_PROVIDER,
                        MIN_TIME_BETWEEN_UPDATES,
                        MIN_DISTANCE_CHANGE,
                        this
                    )
                    Log.d(TAG, "GPS location updates started")
                }

                // Request updates from Network provider as fallback
                if (manager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {
                    manager.requestLocationUpdates(
                        LocationManager.NETWORK_PROVIDER,
                        MIN_TIME_BETWEEN_UPDATES,
                        MIN_DISTANCE_CHANGE,
                        this
                    )
                    Log.d(TAG, "Network location updates started")
                }
            }
        } catch (e: SecurityException) {
            Log.e(TAG, "Security exception in startLocationUpdates", e)
        }
    }

    private fun stopLocationUpdates() {
        locationManager?.removeUpdates(this)
        Log.d(TAG, "Location updates stopped")
    }

    private fun startForegroundService(options: ReadableMap) {
        val taskTitle = options.getString("taskTitle") ?: "Location Tracking"
        val taskDesc = options.getString("taskDesc") ?: "Tracking your location while on duty"

        val serviceIntent = Intent(reactContext, LocationService::class.java).apply {
            putExtra("taskTitle", taskTitle)
            putExtra("taskDesc", taskDesc)
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            reactContext.startForegroundService(serviceIntent)
        } else {
            reactContext.startService(serviceIntent)
        }
    }

    private fun stopForegroundService() {
        val serviceIntent = Intent(reactContext, LocationService::class.java)
        reactContext.stopService(serviceIntent)
    }

    // LocationListener implementation
    override fun onLocationChanged(location: Location) {
        Log.d(TAG, "Location changed: ${location.latitude}, ${location.longitude}")
        
        // Send location update to React Native
        sendLocationUpdateToJS(location)
        
        // Send location to server
        sendLocationToServer(location)

        // send location to firebase
        sendLocationToFirebase(location)
    }

    override fun onStatusChanged(provider: String?, status: Int, extras: Bundle?) {
        Log.d(TAG, "Location provider status changed: $provider, status: $status")
    }

    override fun onProviderEnabled(provider: String) {
        Log.d(TAG, "Location provider enabled: $provider")
    }

    override fun onProviderDisabled(provider: String) {
        Log.d(TAG, "Location provider disabled: $provider")
    }

    private fun sendLocationUpdateToJS(location: Location) {
        val params = Arguments.createMap().apply {
            putDouble("latitude", location.latitude)
            putDouble("longitude", location.longitude)
            putDouble("accuracy", location.accuracy.toDouble())
            putDouble("speed", if (location.hasSpeed()) location.speed.toDouble() else 0.0)
            putDouble("bearing", if (location.hasBearing()) location.bearing.toDouble() else 0.0)
            putDouble("altitude", if (location.hasAltitude()) location.altitude else 0.0)
            putDouble("timestamp", location.time.toDouble())
            putString("provider", location.provider)
        }

        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("locationUpdate", params)
    }

    private fun sendLocationToServer(location: Location) {
        scope.launch {
            try {
                val json = JSONObject().apply {
                    put("userId", getCurrentUserId())
                    put("latitude", location.latitude)
                    put("longitude", location.longitude)
                    put("accuracy", location.accuracy)
                    put("speed", if (location.hasSpeed()) location.speed else 0)
                    put("bearing", if (location.hasBearing()) location.bearing else 0)
                    put("altitude", if (location.hasAltitude()) location.altitude else 0)
                    put("timestamp", System.currentTimeMillis())
                    put("provider", location.provider)
                }

                val client = OkHttpClient()
                val mediaType = "application/json; charset=utf-8".toMediaType()
                val requestBody = json.toString().toRequestBody(mediaType)

                val request = Request.Builder()
                    .url("http://10.156.44.78:3000/api/update")
                    .post(requestBody)
                    .addHeader("Content-Type", "application/json")
                    .addHeader("Authorization", "Bearer ${getAuthToken()}")
                    .build()

                client.newCall(request).enqueue(object : Callback {
                    override fun onFailure(call: Call, e: IOException) {
                        Log.e(TAG, "Failed to send location to server", e)
                        // Store location locally for retry
                        storeLocationLocally(json.toString())
                    }

                    override fun onResponse(call: Call, response: Response) {
                        if (response.isSuccessful) {
                            Log.d(TAG, "Location sent to server successfully")
                        } else {
                            Log.e(TAG, "Server error: ${response.code}")
                            storeLocationLocally(json.toString())
                        }
                        response.close()
                    }
                })

            } catch (e: Exception) {
                Log.e(TAG, "Error preparing location data", e)
            }
        }
    }

    private fun getCurrentUserId(): String {
        // Implement your user ID retrieval logic
        // This could come from SharedPreferences, Firebase Auth, etc.
        return "user_123" // Placeholder
    }

    private fun getAuthToken(): String {
        // Implement your auth token retrieval logic
        return "your_auth_token" // Placeholder
    }

    private fun storeLocationLocally(locationJson: String) {
        // Store failed location updates locally for retry
        val sharedPrefs = reactContext.getSharedPreferences("failed_locations", Context.MODE_PRIVATE)
        val existingLocations = sharedPrefs.getString("locations", "[]")
        // Add to existing locations array and store back
        // Implement based on your retry strategy
    }

    override fun onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy()
        scope.cancel()
        stopLocationUpdates()
    }


    private var locationTimerJob: Job? = null

    private fun startPeriodicLocationUpdates() {
        locationTimerJob?.cancel()
        locationTimerJob = scope.launch {
            while (isActive) {
                try {
                    val location = getLastKnownLocation()
                    if (location != null) {
                        sendLocationToServer(location)
                        Log.d(TAG, "Manually triggered location send")
                        sendLocationToFirebase(location)
                    } else {
                        Log.w(TAG, "No location available to send")
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Error in periodic location update", e)
                }
                delay(20000L) // 20 seconds
            }
        }
    }

    private fun getLastKnownLocation(): Location? {
        val providers = locationManager?.getProviders(true) ?: return null
        var bestLocation: Location? = null
        for (provider in providers) {
            val location = locationManager?.getLastKnownLocation(provider)
            if (location != null) {
                if (bestLocation == null || location.accuracy < bestLocation.accuracy) {
                    bestLocation = location
                }
            }
        }
        return bestLocation
    }

    private fun sendLocationToFirebase(location: Location) {
        try {
            if (FirebaseApp.getApps(reactContext).isEmpty()) {
                FirebaseApp.initializeApp(reactContext)
            }

            // val userId = getCurrentUserId() // You can update this to dynamically use AsyncStorage value
            if (currentUserId.isBlank()) return

            val ref = FirebaseDatabase.getInstance()
                .getReference("masters/$currentUserId")

            val locationData = mapOf(
            "location" to mapOf(
                "lat" to location.latitude,
                "lon" to location.longitude,
                "timestamp" to System.currentTimeMillis()
            ),
            "active" to true
        )


            ref.setValue(locationData)
                .addOnSuccessListener {
                    Log.d(TAG, "Location sent to Firebase for user: $currentUserId")
                }
                .addOnFailureListener { e ->
                    Log.e(TAG, "Failed to send location to Firebase", e)
                }

        } catch (e: Exception) {
            Log.e(TAG, "Firebase Error", e)
        }
    }
}

