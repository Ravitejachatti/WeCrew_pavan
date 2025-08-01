package com.WeCrew

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Build
import android.os.Bundle
import android.os.CountDownTimer
import android.view.View
import android.view.WindowManager
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class RequestModalActivity : AppCompatActivity() {

    private lateinit var customerNameTextView: TextView
    private lateinit var locationTextView: TextView
    private lateinit var issueTextView: TextView
    private lateinit var timerTextView: TextView
    private lateinit var acceptButton: Button
    private lateinit var rejectButton: Button

    private var requestId: String? = null
    private var countDownTimer: CountDownTimer? = null

    private val dismissReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            finish() // Dismiss modal if broadcast received
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setupWindowFlags()
        setContentView(R.layout.activity_request_modal)

        initViews()
        extractDataFromIntent()
        setupClickListeners()
        startCountdown()
    }

    private fun setupWindowFlags() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true)
            setTurnScreenOn(true)
        } else {
            window.addFlags(
                WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
                WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD or
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
            )
        }

        window.addFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN)
        window.decorView.systemUiVisibility = (
            View.SYSTEM_UI_FLAG_FULLSCREEN or
            View.SYSTEM_UI_FLAG_HIDE_NAVIGATION or
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
        )
    }

    private fun initViews() {
        customerNameTextView = findViewById(R.id.modal_customer_name)
        locationTextView = findViewById(R.id.modal_location)
        issueTextView = findViewById(R.id.modal_issue_description)
        timerTextView = findViewById(R.id.modal_timer_text)
        acceptButton = findViewById(R.id.modal_accept_button)
        rejectButton = findViewById(R.id.modal_reject_button)
    }

    private fun extractDataFromIntent() {
        requestId = intent.getStringExtra("requestId")
        val customerName = intent.getStringExtra("customerName") ?: "Unknown Customer"
        val location = intent.getStringExtra("location") ?: "Location not available"
        val issueDescription = intent.getStringExtra("issueDescription") ?: "No description provided"

        customerNameTextView.text = customerName
        locationTextView.text = "📍 $location"
        issueTextView.text = "Issue: $issueDescription"
    }

    private fun setupClickListeners() {
        acceptButton.setOnClickListener { handleResponse("ACCEPT") }
        rejectButton.setOnClickListener { handleResponse("REJECT") }
    }

    private fun startCountdown() {
        countDownTimer = object : CountDownTimer(30_000, 1000) {
            override fun onTick(millisUntilFinished: Long) {
                val seconds = millisUntilFinished / 1000
                timerTextView.text = "Auto-reject in: ${seconds}s"
            }

            override fun onFinish() {
                handleResponse("MISS")
            }
        }.start()
    }

    private fun handleResponse(action: String) {
        countDownTimer?.cancel()
        MyFirebaseMessagingService.stopSound()

        Toast.makeText(this, when (action) {
            "ACCEPT" -> "Request Accepted"
            "REJECT" -> "Request Rejected"
            "MISS" -> "Request Missed"
            else -> "Action: $action"
        }, Toast.LENGTH_SHORT).show()

        sendResponseToServer(action, requestId)
        finish()
    }

    private fun sendResponseToServer(action: String, requestId: String?) {
        println("Sending response: $action for request: $requestId")
        // TODO: Send API call to backend
    }

    override fun onResume() {
        super.onResume()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(dismissReceiver, IntentFilter("DISMISS_MODAL"), RECEIVER_NOT_EXPORTED)
        } else {
            @Suppress("DEPRECATION")
            registerReceiver(dismissReceiver, IntentFilter("DISMISS_MODAL"))
        }
    }

    override fun onPause() {
        super.onPause()
        unregisterReceiver(dismissReceiver)
    }

    override fun onDestroy() {
        super.onDestroy()
        countDownTimer?.cancel()
        MyFirebaseMessagingService.stopSound()
    }

    override fun onBackPressed() {
        // Prevent back dismiss
    }
}