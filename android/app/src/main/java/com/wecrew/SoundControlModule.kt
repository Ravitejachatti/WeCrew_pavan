package com.WeCrew

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class SoundControlModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "SoundControl"

    @ReactMethod
    fun stopSound() {
        MyFirebaseMessagingService.stopSound()
    }
}