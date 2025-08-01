package com.WeCrew

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.localbroadcastmanager.content.LocalBroadcastManager
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import expo.modules.ReactActivityDelegateWrapper

class MainActivity : ReactActivity() {

    private val REQUEST_OVERLAY_PERMISSION = 1001
    private val REQUEST_BATTERY_OPTIMIZATION = 1002
    
    private var pendingRequestData: Map<String, String>? = null
    
    private val requestModalReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            intent?.let {
                val requestData = mutableMapOf<String, String>()
                it.extras?.keySet()?.forEach { key ->
                    if (key != "showRequestModal" && key != "fromNotification") {
                        requestData[key] = it.getStringExtra(key) ?: ""
                    }
                }
                
                if (requestData.isNotEmpty()) {
                    showRequestModal(requestData)
                }
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        // Set the theme to AppTheme BEFORE onCreate to support
        // coloring the background, status bar, and navigation bar.
        // This is required for expo-splash-screen.
        setTheme(R.style.AppTheme)
        super.onCreate(savedInstanceState)
        
        // Check for overlay permission on first launch
        checkAndRequestOverlayPermission()
        
        // Check for battery optimization
        checkBatteryOptimization()
        
        // Handle intent from notification or service
        handleIncomingIntent(intent)
    }

    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleIncomingIntent(intent)
    }

   private fun handleIncomingIntent(intent: Intent?) {
    intent?.takeIf { it.getBooleanExtra("showRequestModal", false) }?.let {
        val requestData = Bundle()
        it.extras?.keySet()?.forEach { key ->
            if (key != "showRequestModal") requestData.putString(key, it.getStringExtra(key))
        }
        val broadcast = Intent("RN_SHOW_REQUEST_MODAL")
        broadcast.putExtras(requestData)
        LocalBroadcastManager.getInstance(this).sendBroadcast(broadcast)
    }
}

    private fun showRequestModal(requestData: Map<String, String>) {
        // Send event to React Native to show modal
        val reactIntent = Intent("RN_SHOW_REQUEST_MODAL")
        requestData.forEach { (key, value) ->
            reactIntent.putExtra(key, value)
        }
        
        // Send to React Native via LocalBroadcastManager
        LocalBroadcastManager.getInstance(this).sendBroadcast(reactIntent)
        
        // Also start Android modal as fallback

    }

    private fun navigateToAcceptedRequest(requestId: String?) {
        // Send event to React Native to navigate
        val reactIntent = Intent("RN_NAVIGATE_TO_ACCEPTED")
        reactIntent.putExtra("requestId", requestId)
        LocalBroadcastManager.getInstance(this).sendBroadcast(reactIntent)
        
        Toast.makeText(this, "Request accepted: $requestId", Toast.LENGTH_SHORT).show()
    }

    private fun checkAndRequestOverlayPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (!Settings.canDrawOverlays(this)) {
                showOverlayPermissionDialog()
            }
        }
    }

    private fun showOverlayPermissionDialog() {
        AlertDialog.Builder(this)
            .setTitle("Overlay Permission Required")
            .setMessage("To show incoming requests when the app is in background or closed, we need permission to display over other apps. This is similar to how Rapido and Swiggy work.")
            .setPositiveButton("Grant Permission") { _, _ ->
                requestOverlayPermission()
            }
            .setNegativeButton("Skip") { dialog, _ ->
                dialog.dismiss()
            }
            .setCancelable(false)
            .show()
    }

    private fun requestOverlayPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val intent = Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:$packageName")
            )
            startActivityForResult(intent, REQUEST_OVERLAY_PERMISSION)
        }
    }

    private fun checkBatteryOptimization() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val intent = Intent()
            val packageName = packageName
            val pm = getSystemService(Context.POWER_SERVICE) as android.os.PowerManager
            
            if (!pm.isIgnoringBatteryOptimizations(packageName)) {
                showBatteryOptimizationDialog()
            }
        }
    }

    private fun showBatteryOptimizationDialog() {
        AlertDialog.Builder(this)
            .setTitle("Battery Optimization")
            .setMessage("To ensure you receive all incoming requests, please disable battery optimization for this app. This helps the app stay active in the background like Rapido and Swiggy.")
            .setPositiveButton("Disable Optimization") { _, _ ->
                requestBatteryOptimizationExemption()
            }
            .setNegativeButton("Skip") { dialog, _ ->
                dialog.dismiss()
            }
            .show()
    }

    private fun requestBatteryOptimizationExemption() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                data = Uri.parse("package:$packageName")
            }
            startActivityForResult(intent, REQUEST_BATTERY_OPTIMIZATION)
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        
        when (requestCode) {
            REQUEST_OVERLAY_PERMISSION -> {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    if (Settings.canDrawOverlays(this)) {
                        Toast.makeText(this, "Overlay permission granted!", Toast.LENGTH_SHORT).show()
                        
                        // If there was a pending request, show it now
                        pendingRequestData?.let { showRequestModal(it) }
                        pendingRequestData = null
                    } else {
                        Toast.makeText(this, "Overlay permission denied. Requests will open the app instead.", Toast.LENGTH_LONG).show()
                    }
                }
            }
            REQUEST_BATTERY_OPTIMIZATION -> {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    val pm = getSystemService(Context.POWER_SERVICE) as android.os.PowerManager
                    if (pm.isIgnoringBatteryOptimizations(packageName)) {
                        Toast.makeText(this, "Battery optimization disabled!", Toast.LENGTH_SHORT).show()
                    } else {
                        Toast.makeText(this, "Battery optimization still enabled. You may miss some requests.", Toast.LENGTH_LONG).show()
                    }
                }
            }
        }
    }

    override fun onResume() {
        super.onResume()
        
        // Register broadcast receiver for request modals
        LocalBroadcastManager.getInstance(this).registerReceiver(
            requestModalReceiver,
            IntentFilter("SHOW_REQUEST_MODAL")
        )
        
        // Also register for global broadcasts
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(requestModalReceiver, IntentFilter("SHOW_REQUEST_MODAL"), RECEIVER_NOT_EXPORTED)
        } else {
            @Suppress("DEPRECATION")
            registerReceiver(requestModalReceiver, IntentFilter("SHOW_REQUEST_MODAL"))
        }
    }

    override fun onPause() {
        super.onPause()
        
        try {
            LocalBroadcastManager.getInstance(this).unregisterReceiver(requestModalReceiver)
            unregisterReceiver(requestModalReceiver)
        } catch (e: Exception) {
            // Receiver might not be registered
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        
        try {
            LocalBroadcastManager.getInstance(this).unregisterReceiver(requestModalReceiver)
            unregisterReceiver(requestModalReceiver)
        } catch (e: Exception) {
            // Receiver might not be registered
        }
    }

    /**
     * Returns the name of the main component registered from JavaScript. This is used to schedule
     * rendering of the component.
     */
    override fun getMainComponentName(): String = "main"

    /**
     * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
     * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
     */
    override fun createReactActivityDelegate(): ReactActivityDelegate {
        return ReactActivityDelegateWrapper(
              this,
              BuildConfig.IS_NEW_ARCHITECTURE_ENABLED,
              object : DefaultReactActivityDelegate(
                  this,
                  mainComponentName,
                  fabricEnabled
              ){})
    }

    /**
      * Align the back button behavior with Android S
      * where moving root activities to background instead of finishing activities.
      * @see <a href="https://developer.android.com/reference/android/app/Activity#onBackPressed()">onBackPressed</a>
      */
    override fun invokeDefaultOnBackPressed() {
        if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {
            if (!moveTaskToBack(false)) {
                // For non-root activities, use the default implementation to finish them.
                super.invokeDefaultOnBackPressed()
            }
            return
        }

        // Use the default back button implementation on Android S
        // because it's doing more than [Activity.moveTaskToBack] in fact.
        super.invokeDefaultOnBackPressed()
    }
}