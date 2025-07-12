"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Monitor, Smartphone, Tablet, Wifi, WifiOff, Bug } from "lucide-react"

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
}

export default function DebugPanel() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [isVisible, setIsVisible] = useState(false)

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
      }

      setDeviceInfo(info)
    }

    detectDevice()
    window.addEventListener("resize", detectDevice)
    window.addEventListener("online", detectDevice)
    window.addEventListener("offline", detectDevice)

    // Error tracking
    const errorHandler = (event: ErrorEvent) => {
      setErrors((prev) => [...prev, `${event.error?.message || event.message} at ${event.filename}:${event.lineno}`])
    }

    window.addEventListener("error", errorHandler)

    return () => {
      window.removeEventListener("resize", detectDevice)
      window.removeEventListener("online", detectDevice)
      window.removeEventListener("offline", detectDevice)
      window.removeEventListener("error", errorHandler)
    }
  }, [])

  if (!isVisible || !deviceInfo) return null

  const getDeviceIcon = () => {
    switch (deviceInfo.deviceType) {
      case "mobile":
        return <Smartphone className="w-4 h-4" />
      case "tablet":
        return <Tablet className="w-4 h-4" />
      default:
        return <Monitor className="w-4 h-4" />
    }
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 w-80 max-h-96 overflow-hidden">
      <Card className="bg-black/90 text-white border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bug className="w-4 h-4" />
            Debug Panel
            <Badge variant="outline" className="ml-auto">
              DEV
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-0">
          <Tabs defaultValue="device" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-800">
              <TabsTrigger value="device" className="text-xs">
                Device
              </TabsTrigger>
              <TabsTrigger value="network" className="text-xs">
                Network
              </TabsTrigger>
              <TabsTrigger value="errors" className="text-xs">
                Errors
                {errors.length > 0 && (
                  <Badge variant="destructive" className="ml-1 text-xs">
                    {errors.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="device" className="mt-2 space-y-2">
              <div className="flex items-center gap-2 text-xs">
                {getDeviceIcon()}
                <span className="capitalize">{deviceInfo.deviceType}</span>
                <Badge variant={deviceInfo.touchSupported ? "default" : "secondary"} className="text-xs">
                  {deviceInfo.touchSupported ? "Touch" : "No Touch"}
                </Badge>
              </div>

              <div className="text-xs space-y-1">
                <div>
                  Screen: {deviceInfo.screen.width}×{deviceInfo.screen.height}
                </div>
                <div>
                  Viewport: {deviceInfo.viewport.width}×{deviceInfo.viewport.height}
                </div>
                <div>Platform: {deviceInfo.platform}</div>
                <div>Language: {deviceInfo.language}</div>
              </div>

              <div className="flex gap-1">
                <Badge variant={deviceInfo.localStorage ? "default" : "destructive"} className="text-xs">
                  LocalStorage
                </Badge>
                <Badge variant={deviceInfo.sessionStorage ? "default" : "destructive"} className="text-xs">
                  SessionStorage
                </Badge>
                <Badge variant={deviceInfo.cookieEnabled ? "default" : "destructive"} className="text-xs">
                  Cookies
                </Badge>
              </div>
            </TabsContent>

            <TabsContent value="network" className="mt-2 space-y-2">
              <div className="flex items-center gap-2 text-xs">
                {deviceInfo.onLine ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
                <span>{deviceInfo.onLine ? "Online" : "Offline"}</span>
              </div>

              <div className="text-xs">
                <div>
                  Connection:{" "}
                  {navigator.connection ? (navigator.connection as any).effectiveType || "Unknown" : "Unknown"}
                </div>
                <div>User Agent: {deviceInfo.userAgent.substring(0, 50)}...</div>
              </div>
            </TabsContent>

            <TabsContent value="errors" className="mt-2">
              {errors.length === 0 ? (
                <div className="text-xs text-green-400">No errors detected</div>
              ) : (
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {errors.slice(-5).map((error, index) => (
                    <div key={index} className="text-xs text-red-400 bg-red-900/20 p-1 rounded">
                      {error}
                    </div>
                  ))}
                </div>
              )}

              {errors.length > 0 && (
                <Button onClick={() => setErrors([])} variant="outline" size="sm" className="mt-2 text-xs h-6">
                  Clear Errors
                </Button>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
