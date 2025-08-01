package com.WeCrew

import android.content.*
import androidx.localbroadcastmanager.content.LocalBroadcastManager
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class RequestModalModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private val context = reactContext

    override fun getName(): String = "RequestModalModule"

    private val receiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            val map = Arguments.createMap()
            intent?.extras?.keySet()?.forEach { key ->
                map.putString(key, intent.getStringExtra(key))
            }
            context?.let {
                this@RequestModalModule.context
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit("SHOW_REQUEST_MODAL", map)
            }
        }
    }

    override fun initialize() {
        super.initialize()
        LocalBroadcastManager.getInstance(context).registerReceiver(receiver, IntentFilter("RN_SHOW_REQUEST_MODAL"))
    }

    override fun onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy()
        LocalBroadcastManager.getInstance(context).unregisterReceiver(receiver)
    }
}