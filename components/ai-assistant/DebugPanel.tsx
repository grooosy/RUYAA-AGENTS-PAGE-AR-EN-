"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, CheckCircle, Clock, Database, Globe, Monitor, RefreshCw, Server, WifiOff } from "lucide-react"

interface SystemStatus {
  groqAPI: "connected" | "disconnected" | "error"
  supabase: "connected" | "disconnected" | "error"
  network: "online" | "offline"
  performance: {
    responseTime: number
    memoryUsage: number
    cpuUsage: number
  }
}

interface LogEntry {
  id: string
  timestamp: Date
  level: "info" | "warning" | "error"
  message: string
  details?: any
}

export default function DebugPanel() {
  const [isMounted, setIsMounted] = useState(false)
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    groqAPI: "disconnected",
    supabase: "disconnected",
    network: "offline",
    performance: {
      responseTime: 0,
      memoryUsage: 0,
      cpuUsage: 0,
    },
  })
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    checkSystemStatus()

    // Add initial log entry
    addLog("info", "Debug panel initialized")

    // Set up periodic status checks
    const interval = setInterval(checkSystemStatus, 30000) // Every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const checkSystemStatus = async () => {
    if (typeof window === "undefined") return

    setIsRefreshing(true)

    try {
      // Check network status
      const networkStatus = navigator.onLine ? "online" : "offline"

      // Simulate API checks
      const groqStatus = await checkGroqAPI()
      const supabaseStatus = await checkSupabase()

      // Get performance metrics (simulated)
      const performance = {
        responseTime: Math.floor(Math.random() * 500) + 100,
        memoryUsage: Math.floor(Math.random() * 50) + 20,
        cpuUsage: Math.floor(Math.random() * 30) + 10,
      }

      setSystemStatus({
        groqAPI: groqStatus,
        supabase: supabaseStatus,
        network: networkStatus,
        performance,
      })

      addLog("info", "System status updated", { groqStatus, supabaseStatus, networkStatus })
    } catch (error) {
      addLog("error", "Failed to check system status", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const checkGroqAPI = async (): Promise<"connected" | "disconnected" | "error"> => {
    try {
      // Simulate API check
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return Math.random() > 0.1 ? "connected" : "error"
    } catch {
      return "error"
    }
  }

  const checkSupabase = async (): Promise<"connected" | "disconnected" | "error"> => {
    try {
      // Simulate database check
      await new Promise((resolve) => setTimeout(resolve, 800))
      return Math.random() > 0.05 ? "connected" : "error"
    } catch {
      return "error"
    }
  }

  const addLog = (level: "info" | "warning" | "error", message: string, details?: any) => {
    const logEntry: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      level,
      message,
      details,
    }

    setLogs((prev) => [logEntry, ...prev.slice(0, 99)]) // Keep last 100 logs
  }

  const clearLogs = () => {
    setLogs([])
    addLog("info", "Logs cleared")
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
      case "online":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "disconnected":
      case "offline":
        return <WifiOff className="h-4 w-4 text-yellow-500" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
      case "online":
        return (
          <Badge variant="default" className="bg-green-500">
            Connected
          </Badge>
        )
      case "disconnected":
      case "offline":
        return <Badge variant="secondary">Disconnected</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  if (!isMounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Debug Panel</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Debug Panel
            </CardTitle>
            <CardDescription>System status and debugging information</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={checkSystemStatus} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0">
        <Tabs defaultValue="status" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="status">System Status</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="flex-1 mt-4">
            <div className="space-y-4">
              {/* Service Status */}
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Server className="h-5 w-5" />
                    <div>
                      <div className="font-medium">Groq API</div>
                      <div className="text-sm text-muted-foreground">AI Language Model</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(systemStatus.groqAPI)}
                    {getStatusBadge(systemStatus.groqAPI)}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Database className="h-5 w-5" />
                    <div>
                      <div className="font-medium">Supabase</div>
                      <div className="text-sm text-muted-foreground">Database & Auth</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(systemStatus.supabase)}
                    {getStatusBadge(systemStatus.supabase)}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5" />
                    <div>
                      <div className="font-medium">Network</div>
                      <div className="text-sm text-muted-foreground">Internet Connection</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(systemStatus.network)}
                    {getStatusBadge(systemStatus.network)}
                  </div>
                </div>
              </div>

              {/* Browser Info */}
              {typeof window !== "undefined" && (
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium mb-2">Browser Information</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>User Agent: {navigator.userAgent.slice(0, 30)}...</div>
                    <div>Language: {navigator.language}</div>
                    <div>Platform: {navigator.platform}</div>
                    <div>Cookies: {navigator.cookieEnabled ? "Enabled" : "Disabled"}</div>
                    {typeof screen !== "undefined" && (
                      <>
                        <div>
                          Screen: {screen.width}x{screen.height}
                        </div>
                        <div>
                          Viewport: {window.innerWidth}x{window.innerHeight}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="performance" className="flex-1 mt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{systemStatus.performance.responseTime}ms</div>
                  <div className="text-sm text-muted-foreground">Response Time</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{systemStatus.performance.memoryUsage}%</div>
                  <div className="text-sm text-muted-foreground">Memory Usage</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{systemStatus.performance.cpuUsage}%</div>
                  <div className="text-sm text-muted-foreground">CPU Usage</div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Performance Metrics</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>API Response Time:</span>
                    <Badge variant={systemStatus.performance.responseTime < 200 ? "default" : "secondary"}>
                      {systemStatus.performance.responseTime < 200 ? "Good" : "Slow"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Memory Usage:</span>
                    <Badge variant={systemStatus.performance.memoryUsage < 70 ? "default" : "destructive"}>
                      {systemStatus.performance.memoryUsage < 70 ? "Normal" : "High"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>CPU Usage:</span>
                    <Badge variant={systemStatus.performance.cpuUsage < 50 ? "default" : "destructive"}>
                      {systemStatus.performance.cpuUsage < 50 ? "Normal" : "High"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="logs" className="flex-1 mt-4 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium">System Logs</h4>
              <Button variant="outline" size="sm" onClick={clearLogs}>
                Clear Logs
              </Button>
            </div>

            <ScrollArea className="flex-1 border rounded-lg p-2">
              <div className="space-y-2">
                {logs.length === 0 ? (
                  <div className="text-center text-muted-foreground py-4">No logs available</div>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="text-sm">
                      <div className="flex items-start gap-2">
                        <Badge
                          variant={
                            log.level === "error" ? "destructive" : log.level === "warning" ? "secondary" : "default"
                          }
                          className="text-xs"
                        >
                          {log.level}
                        </Badge>
                        <div className="flex-1">
                          <div className="font-mono">{log.message}</div>
                          <div className="text-xs text-muted-foreground">{log.timestamp.toLocaleTimeString()}</div>
                          {log.details && (
                            <div className="text-xs text-muted-foreground mt-1 font-mono">
                              {JSON.stringify(log.details, null, 2)}
                            </div>
                          )}
                        </div>
                      </div>
                      <Separator className="mt-2" />
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
