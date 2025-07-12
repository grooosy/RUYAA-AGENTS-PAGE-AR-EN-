"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Activity,
  Database,
  Wifi,
  Server,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Eye,
  EyeOff,
} from "lucide-react"

interface SystemMetrics {
  responseTime: number
  uptime: string
  memoryUsage: number
  activeConnections: number
  requestsPerMinute: number
  errorRate: number
  lastUpdate: Date
}

interface LogEntry {
  id: string
  timestamp: Date
  level: "info" | "warning" | "error"
  message: string
  details?: string
}

export function DebugPanel() {
  const [isMounted, setIsMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [metrics, setMetrics] = useState<SystemMetrics>({
    responseTime: 0,
    uptime: "0h 0m",
    memoryUsage: 0,
    activeConnections: 0,
    requestsPerMinute: 0,
    errorRate: 0,
    lastUpdate: new Date(),
  })
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    setIsMounted(true)

    // Only access browser APIs after mounting
    if (typeof window !== "undefined") {
      generateMockData()

      if (autoRefresh) {
        const interval = setInterval(generateMockData, 5000)
        return () => clearInterval(interval)
      }
    }
  }, [autoRefresh, isMounted])

  const generateMockData = () => {
    if (typeof window === "undefined") return

    // Generate mock metrics
    setMetrics({
      responseTime: Math.floor(Math.random() * 500) + 100,
      uptime: `${Math.floor(Math.random() * 24)}h ${Math.floor(Math.random() * 60)}m`,
      memoryUsage: Math.floor(Math.random() * 40) + 30,
      activeConnections: Math.floor(Math.random() * 50) + 10,
      requestsPerMinute: Math.floor(Math.random() * 100) + 20,
      errorRate: Math.random() * 2,
      lastUpdate: new Date(),
    })

    // Generate mock logs
    const logMessages = [
      "تم تسجيل دخول مستخدم جديد",
      "تم إرسال رسالة إلى الوكيل الذكي",
      "تم تحديث قاعدة البيانات بنجاح",
      "تحذير: استجابة بطيئة من الخادم",
      "خطأ: فشل في الاتصال بقاعدة البيانات",
      "تم إنشاء جلسة دردشة جديدة",
      "تم حفظ محادثة المستخدم",
    ]

    const levels: ("info" | "warning" | "error")[] = ["info", "info", "info", "warning", "error", "info", "info"]

    if (Math.random() > 0.7) {
      const randomIndex = Math.floor(Math.random() * logMessages.length)
      const newLog: LogEntry = {
        id: Date.now().toString(),
        timestamp: new Date(),
        level: levels[randomIndex],
        message: logMessages[randomIndex],
        details: Math.random() > 0.5 ? "تفاصيل إضافية حول هذا الحدث" : undefined,
      }

      setLogs((prev) => [newLog, ...prev.slice(0, 49)]) // Keep only last 50 logs
    }
  }

  const exportLogs = () => {
    if (typeof window === "undefined") return

    const logData = {
      timestamp: new Date().toISOString(),
      metrics,
      logs: logs.slice(0, 100), // Export last 100 logs
    }

    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `debug-logs-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const clearLogs = () => {
    setLogs([])
  }

  if (!isMounted) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Toggle Visibility */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => setIsVisible(!isVisible)} className="flex items-center gap-2">
          {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {isVisible ? "إخفاء التفاصيل" : "عرض التفاصيل"}
        </Button>

        {isVisible && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? "bg-green-50 text-green-700" : ""}
            >
              <RefreshCw className={`h-4 w-4 ${autoRefresh ? "animate-spin" : ""}`} />
              تحديث تلقائي
            </Button>
            <Button variant="outline" size="sm" onClick={exportLogs}>
              <Download className="h-4 w-4" />
              تصدير
            </Button>
          </div>
        )}
      </div>

      {isVisible && (
        <>
          {/* System Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium">زمن الاستجابة</p>
                    <p className="text-lg font-bold">{metrics.responseTime}ms</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">وقت التشغيل</p>
                    <p className="text-lg font-bold">{metrics.uptime}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">استخدام الذاكرة</p>
                    <p className="text-lg font-bold">{metrics.memoryUsage}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Wifi className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium">الاتصالات النشطة</p>
                    <p className="text-lg font-bold">{metrics.activeConnections}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                إحصائيات مفصلة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">الطلبات في الدقيقة</span>
                    <Badge variant="outline">{metrics.requestsPerMinute}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">معدل الأخطاء</span>
                    <Badge variant={metrics.errorRate > 1 ? "destructive" : "secondary"}>
                      {metrics.errorRate.toFixed(2)}%
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">آخر تحديث</span>
                    <span className="text-xs text-gray-500">{metrics.lastUpdate.toLocaleTimeString("ar-SA")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">حالة النظام</span>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">مستقر</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">إجمالي السجلات</span>
                    <Badge variant="outline">{logs.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">الأخطاء الأخيرة</span>
                    <Badge variant="destructive">{logs.filter((log) => log.level === "error").length}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Logs */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  سجلات النظام
                </CardTitle>
                <Button variant="outline" size="sm" onClick={clearLogs}>
                  مسح السجلات
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                {logs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Database className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>لا توجد سجلات متاحة</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {logs.map((log) => (
                      <div
                        key={log.id}
                        className={`p-3 rounded-lg border ${
                          log.level === "error"
                            ? "border-red-200 bg-red-50"
                            : log.level === "warning"
                              ? "border-yellow-200 bg-yellow-50"
                              : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {log.level === "error" ? (
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                            ) : log.level === "warning" ? (
                              <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                            <span className="text-sm font-medium">{log.message}</span>
                          </div>
                          <span className="text-xs text-gray-500">{log.timestamp.toLocaleTimeString("ar-SA")}</span>
                        </div>
                        {log.details && <p className="text-xs text-gray-600 mt-1 mr-6">{log.details}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
