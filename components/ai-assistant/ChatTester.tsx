"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input, Textarea } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Send,
  Bot,
  User,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Settings,
  TestTube,
  Activity,
  CheckCircle,
  XCircle,
} from "lucide-react"

interface TestMessage {
  id: string
  type: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  responseTime?: number
  status?: "success" | "error" | "pending"
}

interface TestResult {
  id: string
  testName: string
  status: "passed" | "failed" | "pending"
  responseTime: number
  details: string
}

export default function ChatTester() {
  const [isMounted, setIsMounted] = useState(false)
  const [messages, setMessages] = useState<TestMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false)
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false)
  const [autoTestRunning, setAutoTestRunning] = useState(false)

  // Browser feature detection
  const [browserFeatures, setBrowserFeatures] = useState({
    speechRecognition: false,
    speechSynthesis: false,
    webRTC: false,
    localStorage: false,
    sessionStorage: false,
    indexedDB: false,
  })

  useEffect(() => {
    setIsMounted(true)

    // Only check browser features after mounting
    if (typeof window !== "undefined") {
      setBrowserFeatures({
        speechRecognition: "webkitSpeechRecognition" in window || "SpeechRecognition" in window,
        speechSynthesis: "speechSynthesis" in window,
        webRTC: "RTCPeerConnection" in window,
        localStorage: "localStorage" in window,
        sessionStorage: "sessionStorage" in window,
        indexedDB: "indexedDB" in window,
      })

      // Add initial system message
      setMessages([
        {
          id: "1",
          type: "system",
          content: "مرحباً! أنا مساعد اختبار الدردشة. يمكنك اختباري بأي سؤال.",
          timestamp: new Date(),
          status: "success",
        },
      ])
    }
  }, [])

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: TestMessage = {
      id: Date.now().toString(),
      type: "user",
      content: content.trim(),
      timestamp: new Date(),
      status: "success",
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    const startTime = Date.now()

    try {
      // Simulate AI response with random delay
      const delay = Math.random() * 2000 + 500
      await new Promise((resolve) => setTimeout(resolve, delay))

      const responses = [
        "شكراً لك على سؤالك. هذا اختبار للمساعد الذكي.",
        "أفهم استفسارك. كيف يمكنني مساعدتك أكثر؟",
        "هذا سؤال ممتاز! دعني أفكر في الإجابة المناسبة.",
        "أقدر تفاعلك معي. هل تريد معرفة المزيد؟",
        "ممتاز! أنا هنا لمساعدتك في أي وقت.",
      ]

      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      const responseTime = Date.now() - startTime

      const assistantMessage: TestMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: randomResponse,
        timestamp: new Date(),
        responseTime,
        status: "success",
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Add test result
      const testResult: TestResult = {
        id: Date.now().toString(),
        testName: `اختبار الرسالة: "${content.slice(0, 30)}..."`,
        status: responseTime < 3000 ? "passed" : "failed",
        responseTime,
        details: `زمن الاستجابة: ${responseTime}ms`,
      }

      setTestResults((prev) => [testResult, ...prev.slice(0, 9)])
    } catch (error) {
      const errorMessage: TestMessage = {
        id: (Date.now() + 1).toString(),
        type: "system",
        content: "حدث خطأ في النظام. يرجى المحاولة مرة أخرى.",
        timestamp: new Date(),
        status: "error",
      }

      setMessages((prev) => [...prev, errorMessage])

      const testResult: TestResult = {
        id: Date.now().toString(),
        testName: `اختبار فاشل: "${content.slice(0, 30)}..."`,
        status: "failed",
        responseTime: Date.now() - startTime,
        details: "فشل في الحصول على استجابة",
      }

      setTestResults((prev) => [testResult, ...prev.slice(0, 9)])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = () => {
    sendMessage(inputValue)
    setInputValue("")
  }

  const runAutoTests = async () => {
    setAutoTestRunning(true)

    const testQueries = [
      "مرحبا",
      "ما هي خدماتكم؟",
      "كيف يمكنني التواصل معكم؟",
      "أريد معرفة المزيد عن الذكاء الاصطناعي",
      "شكراً لك",
    ]

    for (const query of testQueries) {
      await sendMessage(query)
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    setAutoTestRunning(false)
  }

  const clearChat = () => {
    setMessages([
      {
        id: "1",
        type: "system",
        content: "تم مسح المحادثة. يمكنك البدء من جديد.",
        timestamp: new Date(),
        status: "success",
      },
    ])
    setTestResults([])
  }

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Browser Features Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            ميزات المتصفح
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(browserFeatures).map(([feature, supported]) => (
              <div key={feature} className="flex items-center justify-between">
                <span className="text-sm">{feature}</span>
                <Badge variant={supported ? "default" : "secondary"}>{supported ? "مدعوم" : "غير مدعوم"}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat">الدردشة</TabsTrigger>
          <TabsTrigger value="tests">نتائج الاختبار</TabsTrigger>
          <TabsTrigger value="settings">الإعدادات</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-4">
          {/* Chat Interface */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  اختبار المحادثة
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={runAutoTests} disabled={autoTestRunning}>
                    <TestTube className="h-4 w-4 mr-1" />
                    {autoTestRunning ? "جاري الاختبار..." : "اختبار تلقائي"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearChat}>
                    مسح المحادثة
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Messages */}
                <ScrollArea className="h-80 border rounded-lg p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
                      >
                        {message.type !== "user" && (
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <Bot className="h-4 w-4 text-blue-600" />
                          </div>
                        )}

                        <div className={`max-w-[80%] ${message.type === "user" ? "order-2" : ""}`}>
                          <div
                            className={`p-3 rounded-lg ${
                              message.type === "user"
                                ? "bg-blue-600 text-white"
                                : message.type === "system"
                                  ? "bg-gray-100 text-gray-900"
                                  : "bg-green-100 text-green-900"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            {message.responseTime && (
                              <p className="text-xs mt-1 opacity-70">زمن الاستجابة: {message.responseTime}ms</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-gray-500">{message.timestamp.toLocaleTimeString("ar-SA")}</p>
                            {message.status && (
                              <div className="flex items-center gap-1">
                                {message.status === "success" && <CheckCircle className="h-3 w-3 text-green-600" />}
                                {message.status === "error" && <XCircle className="h-3 w-3 text-red-600" />}
                                {message.status === "pending" && <Activity className="h-3 w-3 text-yellow-600" />}
                              </div>
                            )}
                          </div>
                        </div>

                        {message.type === "user" && (
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 order-3">
                            <User className="h-4 w-4 text-green-600" />
                          </div>
                        )}
                      </div>
                    ))}

                    {isLoading && (
                      <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="bg-gray-100 p-3 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                              <div
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.1s" }}
                              />
                              <div
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">جاري التفكير...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="اكتب رسالتك هنا..."
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    disabled={isLoading || autoTestRunning}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                    disabled={!browserFeatures.speechRecognition}
                    className={isVoiceEnabled ? "bg-red-100 text-red-600" : ""}
                  >
                    {isVoiceEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
                    disabled={!browserFeatures.speechSynthesis}
                    className={isSpeechEnabled ? "bg-blue-100 text-blue-600" : ""}
                  >
                    {isSpeechEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  </Button>
                  <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isLoading || autoTestRunning}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests" className="space-y-4">
          {/* Test Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                نتائج الاختبارات
              </CardTitle>
            </CardHeader>
            <CardContent>
              {testResults.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <TestTube className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>لا توجد نتائج اختبار متاحة</p>
                  <p className="text-sm">ابدأ محادثة لرؤية النتائج</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {testResults.map((result) => (
                    <div
                      key={result.id}
                      className={`p-4 rounded-lg border ${
                        result.status === "passed"
                          ? "border-green-200 bg-green-50"
                          : result.status === "failed"
                            ? "border-red-200 bg-red-50"
                            : "border-yellow-200 bg-yellow-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {result.status === "passed" && <CheckCircle className="h-4 w-4 text-green-600" />}
                          {result.status === "failed" && <XCircle className="h-4 w-4 text-red-600" />}
                          {result.status === "pending" && <Activity className="h-4 w-4 text-yellow-600" />}
                          <span className="font-medium text-sm">{result.testName}</span>
                        </div>
                        <Badge
                          variant={
                            result.status === "passed"
                              ? "default"
                              : result.status === "failed"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {result.status === "passed" ? "نجح" : result.status === "failed" ? "فشل" : "قيد التنفيذ"}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{result.details}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الاختبار</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">رسائل الاختبار المخصصة</label>
                  <Textarea placeholder="أدخل رسائل الاختبار، كل رسالة في سطر منفصل..." className="mt-1" rows={4} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">تفعيل التسجيل الصوتي</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                    disabled={!browserFeatures.speechRecognition}
                  >
                    {isVoiceEnabled ? "مفعل" : "معطل"}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">تفعيل النطق</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
                    disabled={!browserFeatures.speechSynthesis}
                  >
                    {isSpeechEnabled ? "مفعل" : "معطل"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
