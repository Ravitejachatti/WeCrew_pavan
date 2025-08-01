// LocationService.kt
package com.WeCrew

import android.app.*
import android.content.*
import android.os.*
import android.util.Log
import androidx.core.app.NotificationCompat
import com.google.android.gms.location.*
import com.google.firebase.FirebaseApp
import com.google.firebase.database.FirebaseDatabase
import kotlinx.coroutines.*
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException

class LocationService : Service() {
    companion object {
        private const val NOTIFICATION_ID = 1
        private const val CHANNEL_ID = "LocationServiceChannel"
        private const val TAG = "LocationService"
    }

    private lateinit var fusedClient: FusedLocationProviderClient
    private lateinit var locationCallback: LocationCallback
    private var currentUserId: String = ""
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    override fun onCreate() {
        super.onCreate()
        fusedClient = LocationServices.getFusedLocationProviderClient(this)
        initializeFirebase()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val title = intent?.getStringExtra("taskTitle") ?: "Location Tracking"
        val desc = intent?.getStringExtra("taskDesc") ?: "Tracking your location"
        currentUserId = intent?.getStringExtra("userId") ?: getSharedPreferences("service_data", Context.MODE_PRIVATE).getString("user_id", "") ?: ""

        startForeground(NOTIFICATION_ID, createNotification(title, desc))
        startLocationUpdates()
        return START_STICKY
    }

    override fun onDestroy() {
        stopLocationUpdates()
        scope.cancel()
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun createNotification(title: String, desc: String): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(desc)
            .setSmallIcon(android.R.drawable.ic_menu_mylocation)
            .setOngoing(true)
            .build()
    }

    private fun initializeFirebase() {
        if (FirebaseApp.getApps(this).isEmpty()) {
            FirebaseApp.initializeApp(this)
        }
    }

    private fun startLocationUpdates() {
        val request = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 10000L)
            .setMinUpdateIntervalMillis(5000L)
            .setWaitForAccurateLocation(true)
            .build()

        locationCallback = object : LocationCallback() {
            override fun onLocationResult(result: LocationResult) {
                val location = result.lastLocation ?: return
                if (location.accuracy > 50) return
                Log.d(TAG, "Location: ${location.latitude}, ${location.longitude}")
                sendLocationToServer(location)
                sendLocationToFirebase(location)
            }
        }

        try {
            fusedClient.requestLocationUpdates(request, locationCallback, Looper.getMainLooper())
        } catch (e: SecurityException) {
            Log.e(TAG, "Missing location permissions", e)
        }
    }

    private fun stopLocationUpdates() {
        fusedClient.removeLocationUpdates(locationCallback)
    }

    private fun sendLocationToServer(location: android.location.Location) {
        scope.launch {
            val json = JSONObject().apply {
                put("userId", currentUserId)
                put("latitude", location.latitude)
                put("longitude", location.longitude)
                put("accuracy", location.accuracy)
                put("speed", location.speed)
                put("bearing", location.bearing)
                put("altitude", location.altitude)
                put("timestamp", System.currentTimeMillis())
                put("provider", location.provider)
            }

            val request = Request.Builder()
                .url("http://10.156.44.78:3000/api/update")
                .post(json.toString().toRequestBody("application/json".toMediaType()))
                .addHeader("Authorization", "Bearer ${getAuthToken()}")
                .build()

            OkHttpClient().newCall(request).enqueue(object : Callback {
                override fun onFailure(call: Call, e: IOException) {
                    Log.e(TAG, "Failed to send location", e)
                }

                override fun onResponse(call: Call, response: Response) {
                    response.close()
                    Log.d(TAG, "Location sent to server: ${response.code}")
                }
            })
        }
    }

    private fun sendLocationToFirebase(location: android.location.Location) {
        if (currentUserId.isBlank()) return

        val ref = FirebaseDatabase.getInstance().getReference("masters/$currentUserId")
        val data = mapOf(
            "location" to mapOf(
                "lat" to location.latitude,
                "lon" to location.longitude,
                "timestamp" to System.currentTimeMillis()
            ),
            "active" to true
        )

        ref.updateChildren(data).addOnSuccessListener {
            Log.d(TAG, "Firebase updated")
        }.addOnFailureListener {
            Log.e(TAG, "Firebase update failed", it)
        }
    }

    private fun getAuthToken(): String {
        return getSharedPreferences("service_data", Context.MODE_PRIVATE)
            .getString("auth_token", "") ?: ""
    }
}