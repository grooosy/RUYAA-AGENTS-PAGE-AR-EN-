"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react"

interface TestResult {
  name: string
  status: "pending" | "success" | "error" | "warning"
  message: string
  details?: string
}

export default function ChatTester() {
  const [tests, setTests] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runTests = async () => {
    setIsRunning(true)
    const testResults: TestResult[] = []

    // Test 1: JavaScript execution
    try {
      const testVar = "test"
      testResults.push({
        name: "JavaScript Execution",
        status: "success",
        message: "JavaScript is working correctly",
        details: `Test variable: ${testVar}`,
      })
    } catch (error) {
      testResults.push({
        name: "JavaScript Execution",
        status: "error",
        message: "JavaScript execution failed",
        details: String(error),
      })
    }

    // Test 2: Local Storage
    try {
      localStorage.setItem("test", "value")
      const value = localStorage.getItem("test")
      localStorage.removeItem("test")

      testResults.push({
        name: "Local Storage",
        status: value === "value" ? "success" : "error",
        message: value === "value" ? "Local storage is available" : "Local storage test failed",
        details: `Retrieved value: ${value}`,
      })
    } catch (error) {
      testResults.push({
        name: "Local Storage",
        status: "error",
        message: "Local storage is not available",
        details: String(error),
      })
    }

    // Test 3: Network connectivity
    try {
      const response = await fetch("/api/health", { method: "HEAD" })
      testResults.push({
        name: "Network Connectivity",
        status: response.ok ? "success" : "warning",
        message: response.ok ? "Network is accessible" : "Network issues detected",
        details: `Status: ${response.status}`,
      })
    } catch (error) {
      testResults.push({
        name: "Network Connectivity",
        status: "error",
        message: "Network is not accessible",
        details: String(error),
      })
    }

    // Test 4: Touch support
    const touchSupported = "ontouchstart" in window || navigator.maxTouchPoints > 0
    testResults.push({
      name: "Touch Support",
      status: touchSupported ? "success" : "warning",
      message: touchSupported ? "Touch events are supported" : "Touch events not supported",
      details: `Max touch points: ${navigator.maxTouchPoints}`,
    })

    // Test 5: Viewport size
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    }
    testResults.push({
      name: "Viewport Size",
      status: viewport.width > 320 ? "success" : "warning",
      message: `Viewport: ${viewport.width}x${viewport.height}`,
      details: `Device pixel ratio: ${window.devicePixelRatio}`,
    })

    // Test 6: CSS animations
    const animationsSupported = CSS.supports("animation", "test 1s")
    testResults.push({
      name: "CSS Animations",
      status: animationsSupported ? "success" : "warning",
      message: animationsSupported ? "CSS animations supported" : "CSS animations not supported",
      details: `Animation support: ${animationsSupported}`,
    })

    // Test 7: Event listeners
    try {
      const testHandler = () => {}
      window.addEventListener("test", testHandler)
      window.removeEventListener("test", testHandler)

      testResults.push({
        name: "Event Listeners",
        status: "success",
        message: "Event listeners are working",
        details: "Add/remove event listener test passed",
      })
    } catch (error) {
      testResults.push({
        name: "Event Listeners",
        status: "error",
        message: "Event listeners failed",
        details: String(error),
      })
    }

    // Test 8: JSON parsing
    try {
      const testObj = { test: "value" }
      const jsonString = JSON.stringify(testObj)
      const parsedObj = JSON.parse(jsonString)

      testResults.push({
        name: "JSON Parsing",
        status: parsedObj.test === "value" ? "success" : "error",
        message: "JSON parsing is working",
        details: `Parsed: ${JSON.stringify(parsedObj)}`,
      })
    } catch (error) {
      testResults.push({
        name: "JSON Parsing",
        status: "error",
        message: "JSON parsing failed",
        details: String(error),
      })
    }

    // Test 9: Date functions
    try {
      const now = new Date()
      const timestamp = now.getTime()
      const formatted = now.toLocaleString()

      testResults.push({
        name: "Date Functions",
        status: timestamp > 0 ? "success" : "error",
        message: "Date functions are working",
        details: `Current time: ${formatted}`,
      })
    } catch (error) {
      testResults.push({
        name: "Date Functions",
        status: "error",
        message: "Date functions failed",
        details: String(error),
      })
    }

    // Test 10: Performance API
    try {
      const perfSupported = "performance" in window && "now" in performance
      const perfTime = perfSupported ? performance.now() : 0

      testResults.push({
        name: "Performance API",
        status: perfSupported ? "success" : "warning",
        message: perfSupported ? "Performance API available" : "Performance API not available",
        details: `Performance time: ${perfTime.toFixed(2)}ms`,
      })
    } catch (error) {
      testResults.push({
        name: "Performance API",
        status: "error",
        message: "Performance API failed",
        details: String(error),
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
      success: "bg-green-100 text-green-800",
      error: "bg-red-100 text-red-800",
      warning: "bg-yellow-100 text-yellow-800",
      pending: "bg-gray-100 text-gray-800",
    }

    return <Badge className={variants[status]}>{status.toUpperCase()}</Badge>
  }

  const successCount = tests.filter((t) => t.status === "success").length
  const errorCount = tests.filter((t) => t.status === "error").length
  const warningCount = tests.filter((t) => t.status === "warning").length

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Chat Widget Compatibility Tests</span>
          <Button onClick={runTests} disabled={isRunning}>
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

        {tests.length > 0 && (
          <div className="flex gap-4 text-sm">
            <span className="text-green-600">✓ {successCount} Passed</span>
            <span className="text-yellow-600">⚠ {warningCount} Warnings</span>
            <span className="text-red-600">✗ {errorCount} Failed</span>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {tests.map((test, index) => (
            <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
              {getStatusIcon(test.status)}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium">{test.name}</h4>
                  {getStatusBadge(test.status)}
                </div>
                <p className="text-sm text-gray-600 mb-1">{test.message}</p>
                {test.details && (
                  <p className="text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded">{test.details}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {tests.length === 0 && isRunning && (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-gray-400" />
            <p className="text-gray-500 mt-2">Running compatibility tests...</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
