package com.WeCrew.backgroundlocation

import android.Manifest
import android.app.Activity
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.*

class LocationPermissionHelper(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val LOCATION_PERMISSION_REQUEST_CODE = 1001
        private val REQUIRED_PERMISSIONS = arrayOf(
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION
        )
        private val BACKGROUND_PERMISSION = arrayOf(
            Manifest.permission.ACCESS_BACKGROUND_LOCATION
        )
    }

    override fun getName(): String = "LocationPermissionHelper"

    @ReactMethod
    fun checkPermissions(promise: Promise) {
        val permissions = mutableMapOf<String, Boolean>()
        
        REQUIRED_PERMISSIONS.forEach { permission ->
            permissions[permission] = ContextCompat.checkSelfPermission(
                reactContext, permission
            ) == PackageManager.PERMISSION_GRANTED
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            BACKGROUND_PERMISSION.forEach { permission ->
                permissions[permission] = ContextCompat.checkSelfPermission(
                    reactContext, permission
                ) == PackageManager.PERMISSION_GRANTED
            }
        }

        val result = Arguments.createMap()
        permissions.forEach { (permission, granted) ->
            result.putBoolean(permission, granted)
        }
        
        promise.resolve(result)
    }

    @ReactMethod
    fun requestPermissions(promise: Promise) {
        val activity = currentActivity
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "No activity available")
            return
        }

        val permissionsToRequest = mutableListOf<String>()
        
        REQUIRED_PERMISSIONS.forEach { permission ->
            if (ContextCompat.checkSelfPermission(reactContext, permission) != PackageManager.PERMISSION_GRANTED) {
                permissionsToRequest.add(permission)
            }
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            BACKGROUND_PERMISSION.forEach { permission ->
                if (ContextCompat.checkSelfPermission(reactContext, permission) != PackageManager.PERMISSION_GRANTED) {
                    permissionsToRequest.add(permission)
                }
            }
        }

        if (permissionsToRequest.isEmpty()) {
            promise.resolve("All permissions already granted")
        } else {
            ActivityCompat.requestPermissions(
                activity,
                permissionsToRequest.toTypedArray(),
                LOCATION_PERMISSION_REQUEST_CODE
            )
            promise.resolve("Permission request initiated")
        }
    }

    @ReactMethod
    fun shouldShowRequestPermissionRationale(permission: String, promise: Promise) {
        val activity = currentActivity
        if (activity == null) {
            promise.resolve(false)
            return
        }

        val shouldShow = ActivityCompat.shouldShowRequestPermissionRationale(activity, permission)
        promise.resolve(shouldShow)
    }
}