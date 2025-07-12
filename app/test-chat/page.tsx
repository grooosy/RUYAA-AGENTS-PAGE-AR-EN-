"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChatTester } from "@/components/ai-assistant/ChatTester"
import { AIAssistant } from "@/components/ai-assistant/AIAssistant"
import { DebugPanel } from "@/components/ai-assistant/DebugPanel"
import {
  MessageSquare,
  Bot,
  Zap,
  Shield,
  Globe,
  Smartphone,
  Monitor,
  Wifi,
  WifiOff,
  CheckCircle,
  AlertCircle,
} from "lucide-react"

export default function TestChatPage() {
  const [isMounted, setIsMounted] = useState(false)
  const [browserInfo, setBrowserInfo] = useState<{
    userAgent: string
    language: string
    platform: string
    cookieEnabled: boolean
    onlineStatus: boolean
    screenResolution: string
    viewportSize: string
    colorDepth: number
    pixelRatio: number
  } | null>(null)

  useEffect(() => {
    setIsMounted(true)

    // Only access browser APIs after mounting
    if (typeof window !== "undefined") {
      const updateBrowserInfo = () => {
        setBrowserInfo({
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform,
          cookieEnabled: navigator.cookieEnabled,
          onlineStatus: navigator.onLine,
          screenResolution: `${screen.width}x${screen.height}`,
          viewportSize: `${window.innerWidth}x${window.innerHeight}`,
          colorDepth: screen.colorDepth,
          pixelRatio: window.devicePixelRatio || 1,
        })
      }

      updateBrowserInfo()

      // Listen for online/offline events
      const handleOnline = () => updateBrowserInfo()
      const handleOffline = () => updateBrowserInfo()
      const handleResize = () => updateBrowserInfo()

      window.addEventListener("online", handleOnline)
      window.addEventListener("offline", handleOffline)
      window.addEventListener("resize", handleResize)

      return () => {
        window.removeEventListener("online", handleOnline)
        window.removeEventListener("offline", handleOffline)
        window.removeEventListener("resize", handleResize)
      }
    }
  }, [])

  // Show loading state during server-side rendering
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل منصة اختبار الدردشة...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center py-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">منصة اختبار الدردشة</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            اختبر وتفاعل مع الوكلاء الأذكياء المختلفين في بيئة آمنة ومتقدمة
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-semibold text-green-800">حالة النظام</p>
                  <p className="text-sm text-green-600">متصل وجاهز</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Bot className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-semibold text-blue-800">الوكلاء المتاحون</p>
                  <p className="text-sm text-blue-600">3 وكلاء نشطين</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Zap className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="font-semibold text-purple-800">الاستجابة</p>
                  <p className="text-sm text-purple-600">&lt; 2 ثانية</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="font-semibold text-orange-800">الأمان</p>
                  <p className="text-sm text-orange-600">مشفر بالكامل</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Browser Information */}
        {browserInfo && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                معلومات المتصفح والجهاز
              </CardTitle>
              <CardDescription>معلومات تقنية حول بيئة التشغيل الحالية</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {browserInfo.onlineStatus ? (
                      <Wifi className="h-4 w-4 text-green-600" />
                    ) : (
                      <WifiOff className="h-4 w-4 text-red-600" />
                    )}
                    <span className="font-medium">حالة الاتصال:</span>
                    <Badge variant={browserInfo.onlineStatus ? "default" : "destructive"}>
                      {browserInfo.onlineStatus ? "متصل" : "غير متصل"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">اللغة:</span>
                    <Badge variant="outline">{browserInfo.language}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-purple-600" />
                    <span className="font-medium">المنصة:</span>
                    <Badge variant="outline">{browserInfo.platform}</Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-green-600" />
                    <span className="font-medium">دقة الشاشة:</span>
                    <Badge variant="outline">{browserInfo.screenResolution}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">حجم النافذة:</span>
                    <Badge variant="outline">{browserInfo.viewportSize}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">نسبة البكسل:</span>
                    <Badge variant="outline">{browserInfo.pixelRatio}x</Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">عمق الألوان:</span>
                    <Badge variant="outline">{browserInfo.colorDepth} بت</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">الكوكيز:</span>
                    <Badge variant={browserInfo.cookieEnabled ? "default" : "destructive"}>
                      {browserInfo.cookieEnabled ? "مفعلة" : "معطلة"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Chat Testing Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chat Tester */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                اختبار الدردشة المتقدم
              </CardTitle>
              <CardDescription>اختبر الوكيل الذكي مع خيارات متقدمة للتحكم والمراقبة</CardDescription>
            </CardHeader>
            <CardContent>
              <ChatTester />
            </CardContent>
          </Card>

          {/* AI Assistant */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                المساعد الذكي
              </CardTitle>
              <CardDescription>تفاعل مباشر مع المساعد الذكي لرؤيا كابيتال</CardDescription>
            </CardHeader>
            <CardContent>
              <AIAssistant />
            </CardContent>
          </Card>
        </div>

        {/* Debug Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              لوحة التشخيص والمراقبة
            </CardTitle>
            <CardDescription>معلومات تقنية مفصلة حول أداء النظام والاتصالات</CardDescription>
          </CardHeader>
          <CardContent>
            <DebugPanel />
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-8 border-t border-gray-200">
          <p className="text-gray-600">© 2024 رؤيا كابيتال - منصة اختبار الوكلاء الأذكياء</p>
          <p className="text-sm text-gray-500 mt-2">جميع الحقوق محفوظة | تم التطوير بأحدث تقنيات الذكاء الاصطناعي</p>
        </div>
      </div>
    </div>
  )
}
