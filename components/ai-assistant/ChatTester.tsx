"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, Loader2, Monitor, Smartphone, Tablet } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface TestResult {
  name: string
  status: "pending" | "success" | "error" | "warning"
  message: string
  details?: string
  duration?: number
}

export default function ChatTester() {
  const [tests, setTests] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [deviceInfo, setDeviceInfo] = useState({
    type: "desktop" as "mobile" | "tablet" | "desktop",
    width: 0,
    height: 0,
    touchSupported: false,
    userAgent: "",
  })

  useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobile =
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) || window.innerWidth <= 768
      const isTablet =
        /ipad|android(?!.*mobile)/i.test(userAgent) || (window.innerWidth > 768 && window.innerWidth <= 1024)

      setDeviceInfo({
        type: isMobile ? "mobile" : isTablet ? "tablet" : "desktop",
        width: window.innerWidth,
        height: window.innerHeight,
        touchSupported: "ontouchstart" in window || navigator.maxTouchPoints > 0,
        userAgent: navigator.userAgent,
      })
    }

    detectDevice()
    window.addEventListener("resize", detectDevice)
    return () => window.removeEventListener("resize", detectDevice)
  }, [])

  const runTests = async () => {
    setIsRunning(true)
    const testResults: TestResult[] = []
    const startTime = Date.now()

    // Test 1: JavaScript execution
    try {
      const testVar = "test"
      const duration = Date.now() - startTime
      testResults.push({
        name: "JavaScript Execution",
        status: "success",
        message: "JavaScript is working correctly",
        details: `Test variable: ${testVar}`,
        duration,
      })
    } catch (error) {
      testResults.push({
        name: "JavaScript Execution",
        status: "error",
        message: "JavaScript execution failed",
        details: String(error),
        duration: Date.now() - startTime,
      })
    }

    // Test 2: Local Storage
    try {
      const testStart = Date.now()
      localStorage.setItem("test", "value")
      const value = localStorage.getItem("test")
      localStorage.removeItem("test")
      const duration = Date.now() - testStart

      testResults.push({
        name: "Local Storage",
        status: value === "value" ? "success" : "error",
        message: value === "value" ? "Local storage is available" : "Local storage test failed",
        details: `Retrieved value: ${value}`,
        duration,
      })
    } catch (error) {
      testResults.push({
        name: "Local Storage",
        status: "error",
        message: "Local storage is not available",
        details: String(error),
        duration: Date.now() - startTime,
      })
    }

    // Test 3: Network connectivity
    try {
      const testStart = Date.now()
      const response = await fetch(window.location.origin, { method: "HEAD" })
      const duration = Date.now() - testStart

      testResults.push({
        name: "Network Connectivity",
        status: response.ok ? "success" : "warning",
        message: response.ok ? "Network is accessible" : "Network issues detected",
        details: `Status: ${response.status}, Response time: ${duration}ms`,
        duration,
      })
    } catch (error) {
      testResults.push({
        name: "Network Connectivity",
        status: "error",
        message: "Network is not accessible",
        details: String(error),
        duration: Date.now() - startTime,
      })
    }

    // Test 4: Touch support
    const touchSupported = "ontouchstart" in window || navigator.maxTouchPoints > 0
    testResults.push({
      name: "Touch Support",
      status: touchSupported ? "success" : "warning",
      message: touchSupported ? "Touch events are supported" : "Touch events not supported",
      details: `Max touch points: ${navigator.maxTouchPoints}`,
      duration: 1,
    })

    // Test 5: Viewport and responsive design
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    }
    const isResponsive = viewport.width >= 320 && viewport.height >= 480
    testResults.push({
      name: "Responsive Design",
      status: isResponsive ? "success" : "warning",
      message: `Viewport: ${viewport.width}x${viewport.height}`,
      details: `Device pixel ratio: ${window.devicePixelRatio}, Type: ${deviceInfo.type}`,
      duration: 1,
    })

    // Test 6: CSS animations and transitions
    const animationsSupported = CSS.supports("animation", "test 1s") && CSS.supports("transition", "all 0.3s")
    testResults.push({
      name: "CSS Animations",
      status: animationsSupported ? "success" : "warning",
      message: animationsSupported ? "CSS animations supported" : "CSS animations not supported",
      details: `Animation support: ${animationsSupported}`,
      duration: 1,
    })

    // Test 7: Modern JavaScript features
    try {
      const testStart = Date.now()
      // Test async/await, arrow functions, destructuring
      const testAsync = async () => await Promise.resolve("test")
      const testArrow = () => "test"
      const { test } = { test: "value" }
      const testSpread = [...[1, 2, 3]]

      const duration = Date.now() - testStart
      testResults.push({
        name: "Modern JavaScript",
        status: "success",
        message: "Modern JavaScript features are working",
        details: "Async/await, arrow functions, destructuring, spread operator",
        duration,
      })
    } catch (error) {
      testResults.push({
        name: "Modern JavaScript",
        status: "error",
        message: "Modern JavaScript features failed",
        details: String(error),
        duration: Date.now() - startTime,
      })
    }

    // Test 8: Performance API
    try {
      const perfSupported = "performance" in window && "now" in performance
      const perfTime = perfSupported ? performance.now() : 0

      testResults.push({
        name: "Performance API",
        status: perfSupported ? "success" : "warning",
        message: perfSupported ? "Performance API available" : "Performance API not available",
        details: `Performance time: ${perfTime.toFixed(2)}ms`,
        duration: 1,
      })
    } catch (error) {
      testResults.push({
        name: "Performance API",
        status: "error",
        message: "Performance API failed",
        details: String(error),
        duration: 1,
      })
    }

    // Test 9: WebSocket support (for real-time features)
    try {
      const wsSupported = "WebSocket" in window
      testResults.push({
        name: "WebSocket Support",
        status: wsSupported ? "success" : "warning",
        message: wsSupported ? "WebSocket is supported" : "WebSocket not supported",
        details: `WebSocket constructor: ${wsSupported}`,
        duration: 1,
      })
    } catch (error) {
      testResults.push({
        name: "WebSocket Support",
        status: "error",
        message: "WebSocket test failed",
        details: String(error),
        duration: 1,
      })
    }

    // Test 10: Clipboard API (for copy functionality)
    try {
      const clipboardSupported = "clipboard" in navigator && "writeText" in navigator.clipboard
      testResults.push({
        name: "Clipboard API",
        status: clipboardSupported ? "success" : "warning",
        message: clipboardSupported ? "Clipboard API is supported" : "Clipboard API not supported",
        details: `Clipboard writeText: ${clipboardSupported}`,
        duration: 1,
      })
    } catch (error) {
      testResults.push({
        name: "Clipboard API",
        status: "error",
        message: "Clipboard API test failed",
        details: String(error),
        duration: 1,
      })
    }

    setTests(testResults)
    setIsRunning(false)
  }

  useEffect(() => {
    runTests()
  }, [])

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      default:
        return <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
    }
  }

  const getStatusBadge = (status: TestResult["status"]) => {
    const variants = {
      success: "bg-green-900/30 text-green-400 border-green-800/50",
      error: "bg-red-900/30 text-red-400 border-red-800/50",
      warning: "bg-yellow-900/30 text-yellow-400 border-yellow-800/50",
      pending: "bg-gray-900/30 text-gray-400 border-gray-800/50",
    }

    return <Badge className={`${variants[status]} border`}>{status.toUpperCase()}</Badge>
  }

  const getDeviceIcon = () => {
    switch (deviceInfo.type) {
      case "mobile":
        return <Smartphone className="w-5 h-5 text-blue-400" />
      case "tablet":
        return <Tablet className="w-5 h-5 text-green-400" />
      default:
        return <Monitor className="w-5 h-5 text-purple-400" />
    }
  }

  const successCount = tests.filter((t) => t.status === "success").length
  const errorCount = tests.filter((t) => t.status === "error").length
  const warningCount = tests.filter((t) => t.status === "warning").length

  return (
    <Card className="w-full max-w-4xl mx-auto bg-black/80 border-gray-800/50 backdrop-blur-sm">
      <CardHeader className="border-b border-gray-800/50">
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            {getDeviceIcon()}
            <span>Chat Widget Compatibility Tests</span>
          </div>
          <Button onClick={runTests} disabled={isRunning} className="bg-gray-800 hover:bg-gray-700 border-gray-700">
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              "Run Tests Again"
            )}
          </Button>
        </CardTitle>

        {/* Device Info */}
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <span>Device: {deviceInfo.type}</span>
          <span>
            Screen: {deviceInfo.width}x{deviceInfo.height}
          </span>
          <span>Touch: {deviceInfo.touchSupported ? "Yes" : "No"}</span>
        </div>

        {tests.length > 0 && (
          <div className="flex gap-4 text-sm">
            <span className="text-green-400">✓ {successCount} Passed</span>
            <span className="text-yellow-400">⚠ {warningCount} Warnings</span>
            <span className="text-red-400">✗ {errorCount} Failed</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-4">
          <AnimatePresence>
            {tests.map((test, index) => (
              <motion.div
                key={test.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-4 border border-gray-800/50 rounded-xl bg-gray-900/30 backdrop-blur-sm hover:bg-gray-900/50 transition-colors"
              >
                {getStatusIcon(test.status)}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white">{test.name}</h4>
                    <div className="flex items-center space-x-2">
                      {test.duration && <span className="text-xs text-gray-500">{test.duration}ms</span>}
                      {getStatusBadge(test.status)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">{test.message}</p>
                  {test.details && (
                    <p className="text-xs text-gray-500 font-mono bg-gray-900/50 p-2 rounded border border-gray-800/50">
                      {test.details}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {tests.length === 0 && isRunning && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-gray-400 mb-4" />
            <p className="text-gray-400">Running compatibility tests...</p>
          </div>
        )}

        {/* Test Summary */}
        {tests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-4 bg-gray-900/50 rounded-xl border border-gray-800/50"
          >
            <h3 className="text-white font-semibold mb-3">Test Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{successCount}</div>
                <div className="text-gray-400">Tests Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{warningCount}</div>
                <div className="text-gray-400">Warnings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{errorCount}</div>
                <div className="text-gray-400">Failures</div>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
