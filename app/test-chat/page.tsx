"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Monitor, Smartphone, Tablet, Wifi, WifiOff, RefreshCw } from "lucide-react"
import ChatTester from "@/components/ai-assistant/ChatTester"
import AIAssistant from "@/components/ai-assistant/AIAssistant"
import DebugPanel from "@/components/ai-assistant/DebugPanel"

interface BrowserInfo {
  userAgent: string
  platform: string
  language: string
  cookieEnabled: boolean
  onlineStatus: boolean
}

interface ScreenInfo {
  width: number
  height: number
  colorDepth: number
  pixelDepth: number
}

interface ViewportInfo {
  width: number
  height: number
}

export default function TestChatPage() {
  const [isMounted, setIsMounted] = useState(false)
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo | null>(null)
  const [screenInfo, setScreenInfo] = useState<ScreenInfo | null>(null)
  const [viewportInfo, setViewportInfo] = useState<ViewportInfo | null>(null)
  const [isAIOpen, setIsAIOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const collectBrowserInfo = (): BrowserInfo | null => {
    if (typeof window === "undefined" || typeof navigator === "undefined") return null

    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onlineStatus: navigator.onLine,
    }
  }

  const collectScreenInfo = (): ScreenInfo | null => {
    if (typeof window === "undefined" || !window.screen) return null

    return {
      width: window.screen.width,
      height: window.screen.height,
      colorDepth: window.screen.colorDepth,
      pixelDepth: window.screen.pixelDepth,
    }
  }

  const collectViewportInfo = (): ViewportInfo | null => {
    if (typeof window === "undefined") return null

    return {
      width: window.innerWidth,
      height: window.innerHeight,
    }
  }

  const refreshData = () => {
    if (typeof window !== "undefined") {
      setBrowserInfo(collectBrowserInfo())
      setScreenInfo(collectScreenInfo())
      setViewportInfo(collectViewportInfo())
      setRefreshKey((prev) => prev + 1)
    }
  }

  useEffect(() => {
    setIsMounted(true)
    refreshData()

    const handleResize = () => {
      setViewportInfo(collectViewportInfo())
    }

    const handleOnlineStatusChange = () => {
      setBrowserInfo(collectBrowserInfo())
    }

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize)
      window.addEventListener("online", handleOnlineStatusChange)
      window.addEventListener("offline", handleOnlineStatusChange)

      return () => {
        window.removeEventListener("resize", handleResize)
        window.removeEventListener("online", handleOnlineStatusChange)
        window.removeEventListener("offline", handleOnlineStatusChange)
      }
    }
  }, [])

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">اختبار المساعد الذكي</h1>
          <p className="text-gray-600">اختبر وتحقق من أداء المساعد الذكي والنظام</p>
          <Button onClick={refreshData} variant="outline" className="mt-4 bg-transparent">
            <RefreshCw className="h-4 w-4 mr-2" />
            تحديث البيانات
          </Button>
        </div>

        {/* System Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Browser Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                معلومات المتصفح
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {browserInfo ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">المنصة:</span>
                    <Badge variant="outline">{browserInfo.platform}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">اللغة:</span>
                    <Badge variant="outline">{browserInfo.language}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">الكوكيز:</span>
                    <Badge variant={browserInfo.cookieEnabled ? "default" : "destructive"}>
                      {browserInfo.cookieEnabled ? "مفعل" : "معطل"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">الاتصال:</span>
                    <div className="flex items-center gap-1">
                      {browserInfo.onlineStatus ? (
                        <Wifi className="h-4 w-4 text-green-600" />
                      ) : (
                        <WifiOff className="h-4 w-4 text-red-600" />
                      )}
                      <Badge variant={browserInfo.onlineStatus ? "default" : "destructive"}>
                        {browserInfo.onlineStatus ? "متصل" : "غير متصل"}
                      </Badge>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500">غير متاح</p>
              )}
            </CardContent>
          </Card>

          {/* Screen Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                معلومات الشاشة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {screenInfo ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">الدقة:</span>
                    <Badge variant="outline">
                      {screenInfo.width}×{screenInfo.height}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">عمق الألوان:</span>
                    <Badge variant="outline">{screenInfo.colorDepth} بت</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">عمق البكسل:</span>
                    <Badge variant="outline">{screenInfo.pixelDepth} بت</Badge>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500">غير متاح</p>
              )}
            </CardContent>
          </Card>

          {/* Viewport Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tablet className="h-5 w-5" />
                نافذة العرض
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {viewportInfo ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">العرض:</span>
                    <Badge variant="outline">{viewportInfo.width}px</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">الارتفاع:</span>
                    <Badge variant="outline">{viewportInfo.height}px</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">النسبة:</span>
                    <Badge variant="outline">
                      {viewportInfo.width && viewportInfo.height
                        ? (viewportInfo.width / viewportInfo.height).toFixed(2)
                        : "غير محدد"}
                    </Badge>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500">غير متاح</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chat Testing Interface */}
        <Tabs defaultValue="chat-tester" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chat-tester">اختبار الدردشة</TabsTrigger>
            <TabsTrigger value="ai-assistant">المساعد الذكي</TabsTrigger>
            <TabsTrigger value="debug">تفاصيل النظام</TabsTrigger>
          </TabsList>

          <TabsContent value="chat-tester" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>اختبار المساعد الذكي</CardTitle>
              </CardHeader>
              <CardContent>
                <ChatTester key={refreshKey} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-assistant" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>المساعد الذكي التفاعلي</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button onClick={() => setIsAIOpen(true)} className="w-full">
                    فتح المساعد الذكي
                  </Button>
                  <AIAssistant isOpen={isAIOpen} onToggle={() => setIsAIOpen(!isAIOpen)} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="debug" className="space-y-4">
            <DebugPanel key={refreshKey} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
