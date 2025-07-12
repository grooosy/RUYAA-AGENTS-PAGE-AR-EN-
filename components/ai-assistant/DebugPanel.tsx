"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { groqService } from "@/lib/ai/groq-service"
import { Activity, Database, MessageSquare, Settings, TestTube } from "lucide-react"

interface HealthStatus {
  status: "online" | "offline" | "degraded"
  responseTime: number
  lastChecked: Date
}

interface DebugLog {
  timestamp: Date
  type: "info" | "error" | "warning"
  message: string
  details?: any
}

export default function DebugPanel() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null)
  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([])
  const [testMessage, setTestMessage] = useState("")
  const [testResponse, setTestResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const addLog = (type: DebugLog["type"], message: string, details?: any) => {
    const newLog: DebugLog = {
      timestamp: new Date(),
      type,
      message,
      details,
    }
    setDebugLogs((prev) => [newLog, ...prev.slice(0, 49)]) // Keep last 50 logs
  }

  const checkHealth = async () => {
    try {
      addLog("info", "بدء فحص حالة الخدمة...")
      const health = await groqService.checkHealth()
      setHealthStatus(health)
      addLog("info", `حالة الخدمة: ${health.status}`, health)
    } catch (error) {
      addLog("error", "فشل في فحص حالة الخدمة", error)
    }
  }

  const testAI = async () => {
    if (!testMessage.trim()) return

    setIsLoading(true)
    try {
      addLog("info", `اختبار الرسالة: ${testMessage}`)
      const response = await groqService.generateResponse(testMessage)
      setTestResponse(response)
      addLog("info", "تم الحصول على رد من الذكاء الاصطناعي", { response })
    } catch (error) {
      addLog("error", "فشل في الحصول على رد من الذكاء الاصطناعي", error)
      setTestResponse("حدث خطأ في الاختبار")
    } finally {
      setIsLoading(false)
    }
  }

  const clearLogs = () => {
    setDebugLogs([])
    addLog("info", "تم مسح سجلات التشخيص")
  }

  useEffect(() => {
    checkHealth()
    const interval = setInterval(checkHealth, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "degraded":
        return "bg-yellow-500"
      case "offline":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "online":
        return "متصل"
      case "degraded":
        return "بطيء"
      case "offline":
        return "غير متصل"
      default:
        return "غير معروف"
    }
  }

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-8 w-8" />
          لوحة تشخيص الذكاء الاصطناعي
        </h1>
        <Button onClick={checkHealth} variant="outline">
          <Activity className="h-4 w-4 mr-2" />
          فحص الحالة
        </Button>
      </div>

      {/* Health Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            حالة الخدمة
          </CardTitle>
        </CardHeader>
        <CardContent>
          {healthStatus ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(healthStatus.status)}`} />
                <span className="font-medium">الحالة:</span>
                <Badge variant={healthStatus.status === "online" ? "default" : "destructive"}>
                  {getStatusText(healthStatus.status)}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">زمن الاستجابة:</span>
                <span>{healthStatus.responseTime}ms</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">آخر فحص:</span>
                <span>{healthStatus.lastChecked.toLocaleTimeString("ar-SA")}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <span className="text-muted-foreground">جاري فحص الحالة...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            اختبار الذكاء الاصطناعي
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">رسالة الاختبار:</label>
            <Textarea
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="اكتب رسالة لاختبار الذكاء الاصطناعي..."
              className="min-h-[100px]"
            />
          </div>
          <Button onClick={testAI} disabled={isLoading || !testMessage.trim()}>
            {isLoading ? "جاري الاختبار..." : "اختبار"}
          </Button>
          {testResponse && (
            <div>
              <label className="text-sm font-medium mb-2 block">الرد:</label>
              <div className="p-4 bg-muted rounded-lg">
                <p className="whitespace-pre-wrap">{testResponse}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Debug Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              سجلات التشخيص
            </div>
            <Button onClick={clearLogs} variant="outline" size="sm">
              مسح السجلات
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {debugLogs.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">لا توجد سجلات</p>
            ) : (
              debugLogs.map((log, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Badge
                    variant={log.type === "error" ? "destructive" : log.type === "warning" ? "secondary" : "default"}
                    className="mt-0.5"
                  >
                    {log.type}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{log.message}</p>
                    <p className="text-xs text-muted-foreground">{log.timestamp.toLocaleString("ar-SA")}</p>
                    {log.details && (
                      <details className="mt-2">
                        <summary className="text-xs cursor-pointer text-muted-foreground">عرض التفاصيل</summary>
                        <pre className="text-xs mt-1 p-2 bg-background rounded border overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
