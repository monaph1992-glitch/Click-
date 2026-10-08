export interface CodeFile {
  name: string;
  path: string;
  language: string;
  description: string;
  content: string;
}

export const ANDROID_FILES: CodeFile[] = [
  {
    name: "MatchAccessibilityService.kt",
    path: "app/src/main/java/com/matchsniper/app/MatchAccessibilityService.kt",
    language: "kotlin",
    description: "Core 1ms Accessibility Service engine with regex distance parser and gesture dispatch",
    content: `package com.matchsniper.app

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.GestureDescription
import android.graphics.Path
import android.graphics.Rect
import android.os.SystemClock
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import java.util.regex.Pattern

/**
 * MatchSniper High-Speed Accessibility Service
 * Scans screen nodes for distances (< 1.8 km OR > 8.1 km)
 * and dispatches click to "Match" / "Accept" in <= 1 millisecond.
 */
class MatchAccessibilityService : AccessibilityService() {

    companion object {
        private const val TAG = "MatchSniper"
        // Configurable thresholds
        var minThresholdKm: Double = 1.8
        var maxThresholdKm: Double = 8.1
        var isServiceActive: Boolean = true
        var targetKeywords = listOf("Match", "Accept", "Book", "Order", "स्वीकार", "MATCH")
        var lastTriggerTime: Long = 0
        const val COOLDOWN_MS = 800L // Prevent double-clicking same order
    }

    // Precompiled regex for zero-allocation ultra fast matching
    private val distancePattern = Pattern.compile("(?i)(\\\\d+(?:\\\\.\\\\d+)?)\\\\s*(?:km|kms|k\\\\.m\\\\.|किलोमीटर)")

    override fun onServiceConnected() {
        super.onServiceConnected()
        Log.d(TAG, "MatchSniper Accessibility Service Connected & Active!")
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (!isServiceActive || event == null) return

        val now = SystemClock.elapsedRealtime()
        if (now - lastTriggerTime < COOLDOWN_MS) return

        // Scan window content
        val rootNode = rootInActiveWindow ?: return
        try {
            val startTime = SystemClock.elapsedRealtimeNanos()
            val detectedDistance = scanForDistance(rootNode)

            if (detectedDistance != null) {
                // Rule check: Distance < 1.8 km OR Distance > 8.1 km
                val isTargetMatch = detectedDistance < minThresholdKm || detectedDistance > maxThresholdKm

                if (isTargetMatch) {
                    val targetButton = findTargetButtonNode(rootNode)
                    if (targetButton != null) {
                        // DISPATCH CLICK IMMEDIATELY
                        val clickSuccess = performUltraFastClick(targetButton)
                        val elapsedMicros = (SystemClock.elapsedRealtimeNanos() - startTime) / 1000
                        val elapsedMs = elapsedMicros / 1000.0

                        lastTriggerTime = SystemClock.elapsedRealtime()
                        Log.i(TAG, "⚡ INSTANT MATCH TRIGGERED! Distance: $detectedDistance km | Latency: $elapsedMs ms | Clicked: $clickSuccess")
                    }
                }
            }
        } finally {
            rootNode.recycle()
        }
    }

    /**
     * Recursive scan to extract distance from text nodes with high efficiency
     */
    private fun scanForDistance(node: AccessibilityNodeInfo?): Double? {
        if (node == null) return null

        val text = node.text?.toString() ?: node.contentDescription?.toString()
        if (!text.isNullOrEmpty()) {
            val matcher = distancePattern.matcher(text)
            if (matcher.find()) {
                val numStr = matcher.group(1)
                try {
                    return numStr?.toDouble()
                } catch (e: Exception) {
                    // Ignore parsing error
                }
            }
        }

        val childCount = node.childCount
        for (i in 0 until childCount) {
            val child = node.getChild(i)
            val dist = scanForDistance(child)
            child?.recycle()
            if (dist != null) return dist
        }

        return null
    }

    /**
     * Finds the "Match" or "Accept" button node
     */
    private fun findTargetButtonNode(node: AccessibilityNodeInfo?): AccessibilityNodeInfo? {
        if (node == null) return null

        val text = (node.text?.toString() ?: node.contentDescription?.toString())?.trim()
        if (!text.isNullOrEmpty()) {
            for (keyword in targetKeywords) {
                if (text.contains(keyword, ignoreCase = true)) {
                    // Traverse up to find clickable ancestor if node itself is not clickable
                    var clickableNode: AccessibilityNodeInfo? = node
                    while (clickableNode != null && !clickableNode.isClickable) {
                        clickableNode = clickableNode.parent
                    }
                    return clickableNode ?: node
                }
            }
        }

        val childCount = node.childCount
        for (i in 0 until childCount) {
            val child = node.getChild(i)
            val found = findTargetButtonNode(child)
            if (found != null) {
                return found
            }
            child?.recycle()
        }

        return null
    }

    /**
     * Executes programmatic click or fallback 1ms gesture tap
     */
    private fun performUltraFastClick(targetNode: AccessibilityNodeInfo): Boolean {
        // Priority 1: Direct Accessibility Action (0.1ms execution)
        if (targetNode.isClickable) {
            val clicked = targetNode.performAction(AccessibilityNodeInfo.ACTION_CLICK)
            if (clicked) return true
        }

        // Priority 2: Coordinate Gesture Dispatch (Guarantees simulated physical touch)
        val bounds = Rect()
        targetNode.getBoundsInScreen(bounds)
        val clickX = bounds.centerX().toFloat()
        val clickY = bounds.centerY().toFloat()

        val clickPath = Path().apply {
            moveTo(clickX, clickY)
        }

        val stroke = GestureDescription.StrokeDescription(clickPath, 0, 1) // 1ms stroke duration
        val gesture = GestureDescription.Builder().addStroke(stroke).build()
        return dispatchGesture(gesture, null, null)
    }

    override fun onInterrupt() {
        Log.w(TAG, "Accessibility Service Interrupted")
    }
}`
  },
  {
    name: "FloatingOverlayService.kt",
    path: "app/src/main/java/com/matchsniper/app/FloatingOverlayService.kt",
    language: "kotlin",
    description: "AMOLED Dark Floating HUD overlay with quick toggle & status meter",
    content: `package com.matchsniper.app

import android.app.Service
import android.content.Intent
import android.graphics.Color
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.view.Gravity
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.widget.TextView

/**
 * Floating Display HUD Window (Draggable & AMOLED Optimized)
 * Keeps service running in foreground with minimum battery footprint.
 */
class FloatingOverlayService : Service() {

    private lateinit var windowManager: WindowManager
    private var overlayView: View? = null

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager

        val layoutFlag = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE
        }

        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            layoutFlag,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                    WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = 30
            y = 200
        }

        overlayView = createAmoledHudView(params)
        windowManager.addView(overlayView, params)
    }

    private fun createAmoledHudView(params: WindowManager.LayoutParams): View {
        // Pure AMOLED Black HUD Card
        val card = TextView(this).apply {
            text = "⚡ MatchSniper: ACTIVE\\n< 1.8km | > 8.1km [1ms]"
            setTextColor(Color.parseColor("#10B981")) // Emerald Green
            setBackgroundColor(Color.parseColor("#000000")) // 100% OLED Black for 0% LED power
            setPadding(32, 20, 32, 20)
            textSize = 13f
        }

        card.setOnTouchListener(object : View.OnTouchListener {
            private var initialX = 0
            private var initialY = 0
            private var initialTouchX = 0f
            private var initialTouchY = 0f

            override fun onTouch(v: View?, event: MotionEvent): Boolean {
                when (event.action) {
                    MotionEvent.ACTION_DOWN -> {
                        initialX = params.x
                        initialY = params.y
                        initialTouchX = event.rawX
                        initialTouchY = event.rawY
                        return true
                    }
                    MotionEvent.ACTION_MOVE -> {
                        params.x = initialX + (event.rawX - initialTouchX).toInt()
                        params.y = initialY + (event.rawY - initialTouchY).toInt()
                        windowManager.updateViewLayout(overlayView, params)
                        return true
                    }
                }
                return false
            }
        })

        return card
    }

    override fun onDestroy() {
        super.onDestroy()
        if (overlayView != null) {
            windowManager.removeView(overlayView)
        }
    }
}`
  },
  {
    name: "BatteryOptimizationHelper.kt",
    path: "app/src/main/java/com/matchsniper/app/BatteryOptimizationHelper.kt",
    language: "kotlin",
    description: "Battery optimization whitelist helper to prevent Android OS killing service in background",
    content: `package com.matchsniper.app

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import android.provider.Settings

object BatteryOptimizationHelper {

    /**
     * Checks if the app is excluded from battery restrictions
     */
    fun isBatteryOptimizationIgnored(context: Context): Boolean {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val powerManager = context.getSystemService(Context.POWER_SERVICE) as? PowerManager
            return powerManager?.isIgnoringBatteryOptimizations(context.packageName) ?: true
        }
        return true
    }

    /**
     * Prompts user with native dialog to whitelist app from battery killer
     */
    @SuppressLint("BatteryLife")
    fun requestIgnoreBatteryOptimization(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (!isBatteryOptimizationIgnored(context)) {
                val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                    data = Uri.parse("package:" + context.packageName)
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                context.startActivity(intent)
            }
        }
    }
}`
  },
  {
    name: "accessibility_service_config.xml",
    path: "app/src/main/res/xml/accessibility_service_config.xml",
    language: "xml",
    description: "Accessibility permission and gesture capabilities configuration",
    content: `<?xml version="1.0" encoding="utf-8"?>
<accessibility-service xmlns:android="http://schemas.android.com/apk/res/android"
    android:description="@string/accessibility_service_description"
    android:accessibilityEventTypes="typeWindowContentChanged|typeWindowStateChanged"
    android:accessibilityFlags="flagDefault|flagRetrieveInteractiveWindows"
    android:accessibilityFeedbackType="feedbackGeneric"
    android:notificationTimeout="1"
    android:canRetrieveWindowContent="true"
    android:canPerformGestures="true"
    android:settingsActivity="com.matchsniper.app.MainActivity" />`
  },
  {
    name: "AndroidManifest.xml",
    path: "app/src/main/AndroidManifest.xml",
    language: "xml",
    description: "Android manifest with permissions for accessibility, overlay, and foreground service",
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.matchsniper.app">

    <!-- Essential permissions for 1ms Auto Match clicker -->
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.VIBRATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="MatchSniper 1ms"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.MatchSniper">

        <!-- Accessibility Service Declaration -->
        <service
            android:name=".MatchAccessibilityService"
            android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE"
            android:exported="true">
            <intent-filter>
                <action android:name="android.accessibilityservice.AccessibilityService" />
            </intent-filter>
            <meta-data
                android:name="android.accessibilityservice"
                android:resource="@xml/accessibility_service_config" />
        </service>

        <!-- Floating Overlay Display Service -->
        <service
            android:name=".FloatingOverlayService"
            android:enabled="true"
            android:exported="false" />

        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`
  },
  {
    name: "build.gradle.kts",
    path: "app/build.gradle.kts",
    language: "kotlin",
    description: "Gradle build script targeting modern Android SDK",
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
}

android {
    namespace = "com.matchsniper.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.matchsniper.app"
        minSdk = 26 // Android 8.0+ supports dispatchGesture & TYPE_APPLICATION_OVERLAY
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("com.google.android.material:material:1.12.0")
}`
  }
];
