"use client"

import { useState, useEffect } from "react"
import { Monitor, Smartphone, Tablet } from "lucide-react"

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
      setErrors((prev) => [...prev.slice(-9), `${event.error?.message || event.message} at ${event.filename}:${event.lineno}`])
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
