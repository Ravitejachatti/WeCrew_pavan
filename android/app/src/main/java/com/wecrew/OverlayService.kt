package com.WeCrew

import android.app.*
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.view.*
import android.widget.Button
import android.widget.TextView
import androidx.core.app.NotificationCompat
import android.os.CountDownTimer
import android.widget.Toast

class OverlayService : Service() {

    private var windowManager: WindowManager? = null
    private var overlayView: View? = null
    private var countDownTimer: CountDownTimer? = null

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        startForeground(FOREGROUND_ID, createForegroundNotification())
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        showOverlay(intent)
        return START_NOT_STICKY
    }

    private fun showOverlay(intent: Intent?) {
        if (overlayView != null) {
            removeOverlay()
        }

        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager

        // Inflate the overlay layout
        overlayView = LayoutInflater.from(this).inflate(R.layout.overlay_request_modal, null)

        val layoutParams = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.MATCH_PARENT,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
            } else {
                WindowManager.LayoutParams.TYPE_PHONE
            },
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                    WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                    WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD or
                    WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or
                    WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON,
            PixelFormat.TRANSLUCENT
        )

        layoutParams.gravity = Gravity.CENTER

        try {
            windowManager?.addView(overlayView, layoutParams)
            setupOverlayContent(intent)
        } catch (e: Exception) {
            e.printStackTrace()
            stopSelf()
        }
    }

    private fun setupOverlayContent(intent: Intent?) {
        overlayView?.let { view ->
            val customerName = intent?.getStringExtra("customerName") ?: "Unknown Customer"
            val location = intent?.getStringExtra("location") ?: "Location not available"
            val issueDescription = intent?.getStringExtra("issueDescription") ?: "No description"
            val requestId = intent?.getStringExtra("requestId") ?: ""
            val serviceType = intent?.getStringExtra("serviceType") ?: "Unknown Service"
            val amount = intent?.getStringExtra("amount") ?: "0.00"

            // Update UI elements
            view.findViewById<TextView>(R.id.overlay_customer_name)?.text = customerName
            view.findViewById<TextView>(R.id.overlay_location)?.text = "📍 $location"
            view.findViewById<TextView>(R.id.overlay_issue_description)?.text = "Issue: $issueDescription"
            view.findViewById<TextView>(R.id.overlay_service_type)?.text = serviceType
            view.findViewById<TextView>(R.id.overlay_amount)?.text = "₹ $amount"

            val timerTextView = view.findViewById<TextView>(R.id.overlay_timer_text)
            val acceptButton = view.findViewById<Button>(R.id.overlay_accept_button)
            val rejectButton = view.findViewById<Button>(R.id.overlay_reject_button)

            // Start countdown
            startCountdown(timerTextView)

            // Set click listeners
            acceptButton?.setOnClickListener {
                handleResponse("ACCEPT", requestId)
            }

            rejectButton?.setOnClickListener {
                handleResponse("REJECT", requestId)
            }

            // Make the overlay focusable for touch events
            val layoutParams = overlayView?.layoutParams as WindowManager.LayoutParams
            layoutParams.flags = layoutParams.flags and WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE.inv()
            windowManager?.updateViewLayout(overlayView, layoutParams)
        }
    }

    private fun startCountdown(timerTextView: TextView?) {
        countDownTimer = object : CountDownTimer(30_000, 1000) {
            override fun onTick(millisUntilFinished: Long) {
                val seconds = millisUntilFinished / 1000
                timerTextView?.text = "Auto-reject in: ${seconds}s"
            }

            override fun onFinish() {
                handleResponse("MISS", null)
            }
        }.start()
    }

    private fun handleResponse(action: String, requestId: String?) {
        countDownTimer?.cancel()
        MyFirebaseMessagingService.stopSound()

        Toast.makeText(this, when (action) {
            "ACCEPT" -> "Request Accepted"
            "REJECT" -> "Request Rejected"
            "MISS" -> "Request Missed"
            else -> "Action: $action"
        }, Toast.LENGTH_SHORT).show()

        when (action) {
            "ACCEPT" -> {
                // Launch main app with accepted request
                val mainIntent = Intent(this, MainActivity::class.java).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                    putExtra("showAcceptedRequest", true)
                    putExtra("requestId", requestId)
                }
                startActivity(mainIntent)
            }
            "REJECT", "MISS" -> {
                // Just close the overlay
            }
        }

        // Send response to server
        sendResponseToServer(action, requestId)
        
        // Close overlay
        removeOverlay()
        stopSelf()
    }

    private fun sendResponseToServer(action: String, requestId: String?) {
        println("Sending response: $action for request: $requestId")
        // TODO: Send API call to backend
    }

    private fun removeOverlay() {
        overlayView?.let {
            try {
                windowManager?.removeView(it)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
        overlayView = null
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Overlay Service",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    private fun createForegroundNotification(): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Processing Request")
            .setContentText("Handling incoming repair request")
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    override fun onDestroy() {
        super.onDestroy()
        countDownTimer?.cancel()
        MyFirebaseMessagingService.stopSound()
        removeOverlay()
    }

    companion object {
        private const val CHANNEL_ID = "overlay_service_channel"
        private const val FOREGROUND_ID = 102
    }
}