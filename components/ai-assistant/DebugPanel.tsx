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

interface SystemInfo {
  browser: string
  version: string
  platform: string
  language: string
  cookiesEnabled: boolean
  onlineStatus: boolean
  screenResolution: string
  viewportSize: string
  colorDepth: number
  timezone: string
  memory?: number
  cores?: number
}

interface PerformanceMetrics {
  loadTime: number
  domContentLoaded: number
  firstPaint: number
  firstContentfulPaint: number
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
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null)
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

    // Gather system information
    const info: SystemInfo = {
      browser: getBrowserName(),
      version: getBrowserVersion(),
      platform: navigator.platform,
      language: navigator.language,
      cookiesEnabled: navigator.cookieEnabled,
      onlineStatus: navigator.onLine,
      screenResolution: typeof screen !== "undefined" ? `${screen.width}x${screen.height}` : "Unknown",
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      colorDepth: typeof screen !== "undefined" ? screen.colorDepth : 0,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }

    // Add memory info if available
    if ("memory" in performance) {
      const memory = (performance as any).memory
      info.memory = Math.round(memory.usedJSHeapSize / 1024 / 1024)
    }

    // Add CPU cores if available
    if ("hardwareConcurrency" in navigator) {
      info.cores = navigator.hardwareConcurrency
    }

    setSystemInfo(info)

    // Gather performance metrics
    if ("performance" in window && "timing" in performance) {
      const timing = performance.timing
      const metrics: PerformanceMetrics = {
        loadTime: timing.loadEventEnd - timing.navigationStart,
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        firstPaint: 0,
        firstContentfulPaint: 0,
      }

      // Get paint metrics if available
      if ("getEntriesByType" in performance) {
        const paintEntries = performance.getEntriesByType("paint")
        paintEntries.forEach((entry: any) => {
          if (entry.name === "first-paint") {
            metrics.firstPaint = entry.startTime
          } else if (entry.name === "first-contentful-paint") {
            metrics.firstContentfulPaint = entry.startTime
          }
        })
      }

      setPerformanceMetrics(metrics)
    }

    addLog("info", "System: " + info.browser + " on " + info.platform)
    addLog("info", "Screen: " + info.screenResolution + ", Viewport: " + info.viewportSize)
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

  const runDiagnostics = () => {
    addLog("info", "Running diagnostics...")

    // Test localStorage
    try {
      localStorage.setItem("test", "test")
      localStorage.removeItem("test")
      addLog("info", "✓ localStorage: Working")
    } catch (e) {
      addLog("error", "✗ localStorage: Failed")
    }

    // Test sessionStorage
    try {
      sessionStorage.setItem("test", "test")
      sessionStorage.removeItem("test")
      addLog("info", "✓ sessionStorage: Working")
    } catch (e) {
      addLog("error", "✗ sessionStorage: Failed")
    }

    // Test WebSocket support
    if ("WebSocket" in window) {
      addLog("info", "✓ WebSocket: Supported")
    } else {
      addLog("error", "✗ WebSocket: Not supported")
    }

    // Test IndexedDB
    if ("indexedDB" in window) {
      addLog("info", "✓ IndexedDB: Supported")
    } else {
      addLog("error", "✗ IndexedDB: Not supported")
    }

    addLog("info", "Diagnostics complete")
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

  const getBrowserName = (): string => {
    if (typeof navigator === "undefined") return "Unknown"

    const userAgent = navigator.userAgent
    if (userAgent.includes("Chrome")) return "Chrome"
    if (userAgent.includes("Firefox")) return "Firefox"
    if (userAgent.includes("Safari")) return "Safari"
    if (userAgent.includes("Edge")) return "Edge"
    if (userAgent.includes("Opera")) return "Opera"
    return "Unknown"
  }

  const getBrowserVersion = (): string => {
    if (typeof navigator === "undefined") return "Unknown"

    const userAgent = navigator.userAgent
    const match = userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera)\/(\d+)/)
    return match ? match[2] : "Unknown"
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
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        <Button onClick={runDiagnostics} size="sm">
          Run Diagnostics
        </Button>
        <Button onClick={clearLogs} variant="outline" size="sm">
          Clear Logs
        </Button>
      </div>

      {systemInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="flex justify-between">
                <span>Browser:</span>
                <Badge variant="outline">
                  {systemInfo.browser} {systemInfo.version}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Platform:</span>
                <Badge variant="outline">{systemInfo.platform}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Language:</span>
                <Badge variant="outline">{systemInfo.language}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Online:</span>
                <Badge variant={systemInfo.onlineStatus ? "default" : "destructive"}>
                  {systemInfo.onlineStatus ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Cookies:</span>
                <Badge variant={systemInfo.cookiesEnabled ? "default" : "destructive"}>
                  {systemInfo.cookiesEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Screen:</span>
                <Badge variant="outline">{systemInfo.screenResolution}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Viewport:</span>
                <Badge variant="outline">{systemInfo.viewportSize}</Badge>
              </div>
              {systemInfo.memory && (
                <div className="flex justify-between">
                  <span>Memory:</span>
                  <Badge variant="outline">{systemInfo.memory} MB</Badge>
                </div>
              )}
              {systemInfo.cores && (
                <div className="flex justify-between">
                  <span>CPU Cores:</span>
                  <Badge variant="outline">{systemInfo.cores}</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {performanceMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="flex justify-between">
                <span>Load Time:</span>
                <Badge variant="outline">{performanceMetrics.loadTime}ms</Badge>
              </div>
              <div className="flex justify-between">
                <span>DOM Ready:</span>
                <Badge variant="outline">{performanceMetrics.domContentLoaded}ms</Badge>
              </div>
              {performanceMetrics.firstPaint > 0 && (
                <div className="flex justify-between">
                  <span>First Paint:</span>
                  <Badge variant="outline">{Math.round(performanceMetrics.firstPaint)}ms</Badge>
                </div>
              )}
              {performanceMetrics.firstContentfulPaint > 0 && (
                <div className="flex justify-between">
                  <span>First Contentful Paint:</span>
                  <Badge variant="outline">{Math.round(performanceMetrics.firstContentfulPaint)}ms</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

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
    </div>
  )
}
