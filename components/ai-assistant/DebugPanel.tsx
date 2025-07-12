"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, Monitor, Wifi, Database, Bot } from "lucide-react"

interface SystemInfo {
  userAgent: string
  platform: string
  language: string
  screenResolution: string
  viewport: string
  timestamp: string
}

interface ConnectionStatus {
  api: boolean
  database: boolean
  groq: boolean
  supabase: boolean
}

export default function DebugPanel() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    api: false,
    database: false,
    groq: false,
    supabase: false,
  })
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  const collectSystemInfo = (): SystemInfo | null => {
    if (typeof window === "undefined") return null

    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: `${window.screen?.width || 0}x${window.screen?.height || 0}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      timestamp: new Date().toISOString(),
    }
  }

  const checkConnections = async () => {
    const status: ConnectionStatus = {
      api: false,
      database: false,
      groq: false,
      supabase: false,
    }

    try {
      // Check API endpoint
      const apiResponse = await fetch("/api/health", { method: "GET" })
      status.api = apiResponse.ok
    } catch (error) {
      status.api = false
    }

    try {
      // Check Supabase connection
      const supabaseResponse = await fetch("/api/test-connection", { method: "GET" })
      status.supabase = supabaseResponse.ok
      status.database = supabaseResponse.ok
    } catch (error) {
      status.supabase = false
      status.database = false
    }

    try {
      // Check Groq AI
      const groqResponse = await fetch("/api/test-groq", { method: "GET" })
      status.groq = groqResponse.ok
    } catch (error) {
      status.groq = false
    }

    setConnectionStatus(status)
  }

  const refresh = async () => {
    setIsRefreshing(true)
    setSystemInfo(collectSystemInfo())
    await checkConnections()
    setIsRefreshing(false)
  }

  useEffect(() => {
    setIsMounted(true)
    setSystemInfo(collectSystemInfo())
    checkConnections()
  }, [])

  // Only show in development
  if (process.env.NODE_ENV === "production" || !isMounted) {
    return null
  }

  return (
    <Card className="w-full max-w-4xl mx-auto mt-8 bg-black/20 backdrop-blur-sm border-white/10">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          Debug Panel
        </CardTitle>
        <Button
          onClick={refresh}
          disabled={isRefreshing}
          variant="outline"
          size="sm"
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* System Information */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">System Information</h3>
          {systemInfo && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="text-gray-300">
                  <span className="font-medium">Platform:</span> {systemInfo.platform}
                </div>
                <div className="text-gray-300">
                  <span className="font-medium">Language:</span> {systemInfo.language}
                </div>
                <div className="text-gray-300">
                  <span className="font-medium">Screen:</span> {systemInfo.screenResolution}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-gray-300">
                  <span className="font-medium">Viewport:</span> {systemInfo.viewport}
                </div>
                <div className="text-gray-300">
                  <span className="font-medium">Updated:</span> {new Date(systemInfo.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Connection Status */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Connection Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-300">API</span>
              <Badge variant={connectionStatus.api ? "default" : "destructive"}>
                {connectionStatus.api ? "Connected" : "Offline"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-300">Database</span>
              <Badge variant={connectionStatus.database ? "default" : "destructive"}>
                {connectionStatus.database ? "Connected" : "Offline"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-300">Groq AI</span>
              <Badge variant={connectionStatus.groq ? "default" : "destructive"}>
                {connectionStatus.groq ? "Connected" : "Offline"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-300">Supabase</span>
              <Badge variant={connectionStatus.supabase ? "default" : "destructive"}>
                {connectionStatus.supabase ? "Connected" : "Offline"}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
