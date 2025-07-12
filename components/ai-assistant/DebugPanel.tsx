"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Monitor, Smartphone, Tablet, Wifi, WifiOff, Bug, Activity, Zap, AlertTriangle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface DeviceInfo {
  userAgent: string
  platform: string
  language: string
  cookieEnabled: boolean
  onLine: boolean
  screen: {
    width: number
    height: number
    colorDepth: number
  }
  viewport: {
    width: number
    height: number
  }
  deviceType: "mobile" | "tablet" | "desktop"
  touchSupported: boolean
  localStorage: boolean
  sessionStorage: boolean
  performance: {
    memory?: number
    timing?: number
  }
}

interface PerformanceMetric {
  name: string
  value: number
  unit: string
  status: "good" | "warning" | "poor"
}

export default function DebugPanel() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([])

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV === "development") {
      setIsVisible(true)
    }

    const detectDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
      const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent)

      let deviceType: "mobile" | "tablet" | "desktop" = "desktop"
      if (isMobile) deviceType = "mobile"
      else if (isTablet) deviceType = "tablet"

      const info: DeviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        screen: {
          width: screen.width,
          height: screen.height,
          colorDepth: screen.colorDepth,
        },
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        deviceType,
        touchSupported: "ontouchstart" in window || navigator.maxTouchPoints > 0,
        localStorage: (() => {
          try {
            localStorage.setItem("test", "test")
            localStorage.removeItem("test")
            return true
          } catch {
            return false
          }
        })(),
        sessionStorage: (() => {
          try {
            sessionStorage.setItem("test", "test")
            sessionStorage.removeItem("test")
            return true
          } catch {
            return false
          }
        })(),
        performance: {
          memory: (performance as any).memory?.usedJSHeapSize,
          timing: performance.now(),
        },
      }

      setDeviceInfo(info)
    }

    const updatePerformanceMetrics = () => {
      const metrics: PerformanceMetric[] = []

      // Memory usage
      if ((performance as any).memory) {
        const memoryMB = (performance as any).memory.usedJSHeapSize / 1024 / 1024
        metrics.push({
          name: "Memory Usage",
          value: Math.round(memoryMB),
          unit: "MB",
          status: memoryMB < 50 ? "good" : memoryMB < 100 ? "warning" : "poor",
        })
      }

      // Frame rate estimation
      let frameCount = 0
      let lastTime = performance.now()
      const measureFPS = () => {
        frameCount++
        const currentTime = performance.now()
        if (currentTime - lastTime >= 1000) {
          const fps = frameCount
          metrics.push({
            name: "Frame Rate",
            value: fps,
            unit: "FPS",
            status: fps >= 50 ? "good" : fps >= 30 ? "warning" : "poor",
          })
          frameCount = 0
          lastTime = currentTime
        }
        requestAnimationFrame(measureFPS)
      }
      requestAnimationFrame(measureFPS)

      // Network speed estimation
      const startTime = performance.now()
      fetch(window.location.origin, { method: "HEAD" })
        .then(() => {
          const networkLatency = performance.now() - startTime
          metrics.push({
            name: "Network Latency",
            value: Math.round(networkLatency),
            unit: "ms",
            status: networkLatency < 100 ? "good" : networkLatency < 300 ? "warning" : "poor",
          })
          setPerformanceMetrics([...metrics])
        })
        .catch(() => {
          metrics.push({
            name: "Network Latency",
            value: 0,
            unit: "ms",
            status: "poor",
          })
          setPerformanceMetrics([...metrics])
        })
    }

    detectDevice()
    updatePerformanceMetrics()

    window.addEventListener("resize", detectDevice)
    window.addEventListener("online", detectDevice)
    window.addEventListener("offline", detectDevice)

    // Error tracking
    const errorHandler = (event: ErrorEvent) => {
      setErrors((prev) => [
        ...prev.slice(-9),
        `${event.error?.message || event.message} at ${event.filename}:${event.lineno}`,
      ])
    }

    const rejectionHandler = (event: PromiseRejectionEvent) => {
      setErrors((prev) => [...prev.slice(-9), `Unhandled Promise: ${event.reason}`])
    }

    window.addEventListener("error", errorHandler)
    window.addEventListener("unhandledrejection", rejectionHandler)

    return () => {
      window.removeEventListener("resize", detectDevice)
      window.removeEventListener("online", detectDevice)
      window.removeEventListener("offline", detectDevice)
      window.removeEventListener("error", errorHandler)
      window.removeEventListener("unhandledrejection", rejectionHandler)
    }
  }, [])

  if (!isVisible || !deviceInfo) return null

  const getDeviceIcon = () => {
    switch (deviceInfo.deviceType) {
      case "mobile":
        return <Smartphone className="w-4 h-4 text-blue-400" />
      case "tablet":
        return <Tablet className="w-4 h-4 text-green-400" />
      default:
        return <Monitor className="w-4 h-4 text-purple-400" />
    }
  }

  const getMetricColor = (status: string) => {
    switch (status) {
      case "good":
        return "text-green-400"
      case "warning":
        return "text-yellow-400"
      case "poor":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 left-4 z-50 max-w-md"
    >
      <Card className="bg-black/95 border-gray-800/50 backdrop-blur-xl shadow-2xl">
        <CardHeader className="pb-2 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <CardTitle className="flex items-center justify-between text-sm text-white">
            <div className="flex items-center space-x-2">
              <Bug className="w-4 h-4 text-orange-400" />
              <span>Debug Panel</span>
              {getDeviceIcon()}
            </div>
            <div className="flex items-center space-x-2">
              {deviceInfo.onLine ? (
                <Wifi className="w-4 h-4 text-green-400" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-400" />
              )}
              <Badge variant="outline" className="text-xs border-gray-700 text-gray-300">
                {deviceInfo.deviceType}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent className="pt-0">
                <Tabs defaultValue="device" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-gray-900/50 border border-gray-800/50">
                    <TabsTrigger value="device" className="text-xs data-[state=active]:bg-gray-800">
                      Device
                    </TabsTrigger>
                    <TabsTrigger value="performance" className="text-xs data-[state=active]:bg-gray-800">
                      Performance
                    </TabsTrigger>
                    <TabsTrigger value="errors" className="text-xs data-[state=active]:bg-gray-800">
                      Errors
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="device" className="mt-3 space-y-2">
                    <div className="text-xs space-y-1 text-gray-300">
                      <div className="flex justify-between">
                        <span>Screen:</span>
                        <span>
                          {deviceInfo.screen.width}×{deviceInfo.screen.height}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Viewport:</span>
                        <span>
                          {deviceInfo.viewport.width}×{deviceInfo.viewport.height}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Touch:</span>
                        <span className={deviceInfo.touchSupported ? "text-green-400" : "text-red-400"}>
                          {deviceInfo.touchSupported ? "Yes" : "No"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Storage:</span>
                        <span>
                          <span className={deviceInfo.localStorage ? "text-green-400" : "text-red-400"}>LS</span>
                          {" / "}
                          <span className={deviceInfo.sessionStorage ? "text-green-400" : "text-red-400"}>SS</span>
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Language:</span>
                        <span>{deviceInfo.language}</span>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="performance" className="mt-3 space-y-2">
                    {performanceMetrics.length > 0 ? (
                      <div className="space-y-2">
                        {performanceMetrics.map((metric, index) => (
                          <div key={index} className="flex items-center justify-between text-xs">
                            <span className="text-gray-300">{metric.name}:</span>
                            <div className="flex items-center space-x-2">
                              <span className={getMetricColor(metric.status)}>
                                {metric.value} {metric.unit}
                              </span>
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  metric.status === "good"
                                    ? "bg-green-400"
                                    : metric.status === "warning"
                                      ? "bg-yellow-400"
                                      : "bg-red-400"
                                }`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 text-center py-4">
                        <Activity className="w-4 h-4 mx-auto mb-2 animate-pulse" />
                        Measuring performance...
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="errors" className="mt-3">
                    {errors.length > 0 ? (
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {errors.map((error, index) => (
                          <div
                            key={index}
                            className="text-xs text-red-400 bg-red-900/20 p-2 rounded border border-red-800/30"
                          >
                            <AlertTriangle className="w-3 h-3 inline mr-1" />
                            {error}
                          </div>
                        ))}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setErrors([])}
                          className="w-full text-xs border-gray-700 hover:bg-gray-800"
                        >
                          Clear Errors
                        </Button>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 text-center py-4">
                        <Zap className="w-4 h-4 mx-auto mb-2 text-green-400" />
                        No errors detected
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}
