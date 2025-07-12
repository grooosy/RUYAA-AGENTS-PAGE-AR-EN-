"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Settings,
  Database,
  Wifi,
  WifiOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Monitor,
  Smartphone,
  Globe,
} from "lucide-react"

interface SystemInfo {
  userAgent: string
  platform: string
  language: string
  online: boolean
  screenResolution: string
  viewport: string
  devicePixelRatio: number
  touchSupport: boolean
  cookiesEnabled: boolean
  localStorage: boolean
  sessionStorage: boolean
}

interface ConnectionStatus {
  api: "connected" | "disconnected" | "error"
  database: "connected" | "disconnected" | "error"
  groq: "connected" | "disconnected" | "error"
  supabase: "connected" | "disconnected" | "error"
}

export default function DebugPanel() {
  const [isVisible, setIsVisible] = useState(false)
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    api: "disconnected",
    database: "disconnected",
    groq: "disconnected",
    supabase: "disconnected",
  })
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    // Only show debug panel in development
    setIsVisible(process.env.NODE_ENV === "development")

    if (typeof window !== "undefined") {
      setSystemInfo({
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        online: navigator.onLine,
        screenResolution: `${screen.width}×${screen.height}`,
        viewport: `${window.innerWidth}×${window.innerHeight}`,
        devicePixelRatio: window.devicePixelRatio,
        touchSupport: "ontouchstart" in window,
        cookiesEnabled: navigator.cookieEnabled,
        localStorage: typeof Storage !== "undefined",
        sessionStorage: typeof Storage !== "undefined",
      })
    }
  }, [])

  const checkConnections = async () => {
    setIsRefreshing(true)

    // Check API connection
    try {
      const response = await fetch("/api/health")
      setConnectionStatus((prev) => ({
        ...prev,
        api: response.ok ? "connected" : "error",
      }))
    } catch {
      setConnectionStatus((prev) => ({ ...prev, api: "error" }))
    }

    // Check Groq connection
    try {
      const response = await fetch("/api/ai/test")
      setConnectionStatus((prev) => ({
        ...prev,
        groq: response.ok ? "connected" : "error",
      }))
    } catch {
      setConnectionStatus((prev) => ({ ...prev, groq: "error" }))
    }

    // Check Supabase connection
    try {
      const response = await fetch("/api/db/test")
      setConnectionStatus((prev) => ({
        ...prev,
        supabase: response.ok ? "connected" : "error",
        database: response.ok ? "connected" : "error",
      }))
    } catch {
      setConnectionStatus((prev) => ({
        ...prev,
        supabase: "error",
        database: "error",
      }))
    }

    setIsRefreshing(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return <Badge className="bg-green-100 text-green-800">متصل</Badge>
      case "error":
        return <Badge className="bg-red-100 text-red-800">خطأ</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">غير متصل</Badge>
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-96 max-h-96 overflow-auto">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              لوحة التشخيص
            </span>
            <Button variant="ghost" size="sm" onClick={checkConnections} disabled={isRefreshing}>
              <RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Tabs defaultValue="connections" className="w-full">
            <TabsList className="grid w-full grid-cols-2 text-xs">
              <TabsTrigger value="connections">الاتصالات</TabsTrigger>
              <TabsTrigger value="system">النظام</TabsTrigger>
            </TabsList>

            <TabsContent value="connections" className="space-y-3 mt-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="h-3 w-3" />
                    <span className="text-xs">API</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(connectionStatus.api)}
                    {getStatusBadge(connectionStatus.api)}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="h-3 w-3" />
                    <span className="text-xs">قاعدة البيانات</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(connectionStatus.database)}
                    {getStatusBadge(connectionStatus.database)}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="h-3 w-3" />
                    <span className="text-xs">Groq AI</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(connectionStatus.groq)}
                    {getStatusBadge(connectionStatus.groq)}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="h-3 w-3" />
                    <span className="text-xs">Supabase</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(connectionStatus.supabase)}
                    {getStatusBadge(connectionStatus.supabase)}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {systemInfo?.online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                    <span className="text-xs">الإنترنت</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {systemInfo?.online ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <Badge className="bg-green-100 text-green-800">متصل</Badge>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-500" />
                        <Badge className="bg-red-100 text-red-800">غير متصل</Badge>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="system" className="space-y-3 mt-3">
              {systemInfo && (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span>المنصة:</span>
                    <span className="text-muted-foreground">{systemInfo.platform}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>اللغة:</span>
                    <span className="text-muted-foreground">{systemInfo.language}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>الشاشة:</span>
                    <span className="text-muted-foreground">{systemInfo.screenResolution}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>العرض:</span>
                    <span className="text-muted-foreground">{systemInfo.viewport}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>نسبة البكسل:</span>
                    <span className="text-muted-foreground">{systemInfo.devicePixelRatio}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>اللمس:</span>
                    <div className="flex items-center gap-1">
                      {systemInfo.touchSupport ? (
                        <>
                          <Smartphone className="h-3 w-3 text-green-500" />
                          <span className="text-green-600">مدعوم</span>
                        </>
                      ) : (
                        <>
                          <Monitor className="h-3 w-3 text-blue-500" />
                          <span className="text-blue-600">غير مدعوم</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>التخزين المحلي:</span>
                    <span className={systemInfo.localStorage ? "text-green-600" : "text-red-600"}>
                      {systemInfo.localStorage ? "مدعوم" : "غير مدعوم"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>الكوكيز:</span>
                    <span className={systemInfo.cookiesEnabled ? "text-green-600" : "text-red-600"}>
                      {systemInfo.cookiesEnabled ? "مفعل" : "معطل"}
                    </span>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
