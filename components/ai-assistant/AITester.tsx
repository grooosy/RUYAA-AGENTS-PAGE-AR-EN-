"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { groqService } from "@/lib/ai/groq-service"
import { TestTube, Clock, CheckCircle, XCircle, AlertTriangle, MessageSquare, Brain, Target } from "lucide-react"

interface TestResult {
  id: string
  message: string
  response: string
  responseTime: number
  timestamp: Date
  status: "success" | "error" | "warning"
  score?: number
  analysis?: {
    language: string
    intent: string
    relevance: number
    accuracy: number
  }
}

interface TestSuite {
  name: string
  description: string
  tests: {
    message: string
    expectedKeywords: string[]
    category: string
  }[]
}

const testSuites: TestSuite[] = [
  {
    name: "اختبار الوكلاء الذكيين",
    description: "اختبار فهم الذكاء الاصطناعي لمفهوم الوكلاء الذكيين",
    tests: [
      {
        message: "ما هو الوكيل الذكي؟",
        expectedKeywords: ["وكيل", "ذكي", "برنامج", "مهام", "تنفيذ"],
        category: "تعريف أساسي",
      },
      {
        message: "كيف يختلف الوكيل الذكي عن الشات بوت العادي؟",
        expectedKeywords: ["اختلاف", "تنفيذ", "إجراءات", "حقيقية", "ذكي"],
        category: "مقارنة",
      },
      {
        message: "ما الذي يمكن للوكيل الذكي فعله في شركتي؟",
        expectedKeywords: ["حجز", "مواعيد", "طلبات", "تحليل", "أتمتة"],
        category: "تطبيقات عملية",
      },
    ],
  },
  {
    name: "اختبار الخدمات",
    description: "اختبار معرفة الذكاء الاصطناعي بخدمات رؤيا كابيتال",
    tests: [
      {
        message: "ما هي خدمات رؤيا كابيتال؟",
        expectedKeywords: ["تطوير", "وكلاء", "ذكاء اصطناعي", "حلول", "شركات"],
        category: "خدمات عامة",
      },
      {
        message: "كيف يمكنني التواصل معكم؟",
        expectedKeywords: ["admin@ruyaacapital.com", "واتساب", "تواصل"],
        category: "معلومات التواصل",
      },
      {
        message: "هل تقدمون استشارات مالية؟",
        expectedKeywords: ["لا", "ذكاء اصطناعي", "وكلاء", "تطوير"],
        category: "توضيح الخدمات",
      },
    ],
  },
  {
    name: "اختبار اللغة والفهم",
    description: "اختبار قدرة الذكاء الاصطناعي على فهم اللغة العربية",
    tests: [
      {
        message: "أريد وكيل ذكي لشركتي الصغيرة",
        expectedKeywords: ["شركة", "صغيرة", "تطوير", "مخصص", "احتياجات"],
        category: "طلب خدمة",
      },
      {
        message: "What is an AI agent?",
        expectedKeywords: ["عربي", "وكيل", "ذكي", "برنامج"],
        category: "لغة إنجليزية",
      },
      {
        message: "كم تكلفة تطوير وكيل ذكي؟",
        expectedKeywords: ["تكلفة", "تواصل", "مخصص", "احتياجات"],
        category: "استفسار سعر",
      },
    ],
  },
]

export default function AITester() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [currentTest, setCurrentTest] = useState<string>("")
  const [customMessage, setCustomMessage] = useState("")
  const [progress, setProgress] = useState(0)
  const [overallStats, setOverallStats] = useState({
    totalTests: 0,
    successfulTests: 0,
    averageResponseTime: 0,
    averageScore: 0,
  })

  const analyzeResponse = (message: string, response: string, expectedKeywords: string[]): TestResult["analysis"] => {
    // Check if response contains expected keywords
    const foundKeywords = expectedKeywords.filter((keyword) => response.toLowerCase().includes(keyword.toLowerCase()))

    const relevance = (foundKeywords.length / expectedKeywords.length) * 100

    // Simple accuracy check based on response length and keyword presence
    const accuracy =
      response.length > 50 && foundKeywords.length > 0
        ? Math.min(100, (foundKeywords.length / expectedKeywords.length) * 100 + (response.length > 100 ? 20 : 10))
        : 30

    // Detect language
    const isArabic = /[\u0600-\u06FF]/.test(response)
    const language = isArabic ? "عربي" : "إنجليزي"

    // Simple intent detection
    let intent = "عام"
    if (response.includes("وكيل") || response.includes("agent")) {
      intent = "شرح الوكلاء الذكيين"
    } else if (response.includes("خدمة") || response.includes("service")) {
      intent = "شرح الخدمات"
    } else if (response.includes("تواصل") || response.includes("contact")) {
      intent = "معلومات التواصل"
    }

    return {
      language,
      intent,
      relevance,
      accuracy,
    }
  }

  const runSingleTest = async (message: string, expectedKeywords: string[] = [], category = "مخصص") => {
    const startTime = Date.now()

    try {
      const response = await groqService.generateResponse(message)
      const responseTime = Date.now() - startTime

      const analysis = analyzeResponse(message, response, expectedKeywords)
      const score = (analysis.relevance + analysis.accuracy) / 2

      const result: TestResult = {
        id: Date.now().toString(),
        message,
        response,
        responseTime,
        timestamp: new Date(),
        status: score > 70 ? "success" : score > 40 ? "warning" : "error",
        score,
        analysis,
      }

      setTestResults((prev) => [result, ...prev])
      return result
    } catch (error) {
      const result: TestResult = {
        id: Date.now().toString(),
        message,
        response: `خطأ: ${error}`,
        responseTime: Date.now() - startTime,
        timestamp: new Date(),
        status: "error",
        score: 0,
      }

      setTestResults((prev) => [result, ...prev])
      return result
    }
  }

  const runTestSuite = async (suite: TestSuite) => {
    setIsRunning(true)
    setProgress(0)

    const results: TestResult[] = []

    for (let i = 0; i < suite.tests.length; i++) {
      const test = suite.tests[i]
      setCurrentTest(`${suite.name}: ${test.category}`)

      const result = await runSingleTest(test.message, test.expectedKeywords, test.category)
      results.push(result)

      setProgress(((i + 1) / suite.tests.length) * 100)

      // Add delay between tests to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    setIsRunning(false)
    setCurrentTest("")
    setProgress(0)

    return results
  }

  const runAllTests = async () => {
    setIsRunning(true)
    setTestResults([])

    for (const suite of testSuites) {
      await runTestSuite(suite)
    }

    setIsRunning(false)
  }

  const runCustomTest = async () => {
    if (!customMessage.trim()) return

    setIsRunning(true)
    await runSingleTest(customMessage.trim())
    setIsRunning(false)
    setCustomMessage("")
  }

  const clearResults = () => {
    setTestResults([])
  }

  // Calculate overall statistics
  useEffect(() => {
    if (testResults.length > 0) {
      const successful = testResults.filter((r) => r.status === "success").length
      const avgResponseTime = testResults.reduce((sum, r) => sum + r.responseTime, 0) / testResults.length
      const avgScore = testResults.reduce((sum, r) => sum + (r.score || 0), 0) / testResults.length

      setOverallStats({
        totalTests: testResults.length,
        successfulTests: successful,
        averageResponseTime: Math.round(avgResponseTime),
        averageScore: Math.round(avgScore),
      })
    }
  }, [testResults])

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusColor = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      case "error":
        return "bg-red-100 text-red-800"
    }
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <TestTube className="h-8 w-8" />
          اختبار الذكاء الاصطناعي
        </h1>
        <div className="flex gap-2">
          <Button onClick={runAllTests} disabled={isRunning} variant="default">
            {isRunning ? "جاري التشغيل..." : "تشغيل جميع الاختبارات"}
          </Button>
          <Button onClick={clearResults} variant="outline">
            مسح النتائج
          </Button>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الاختبارات</p>
                <p className="text-2xl font-bold">{overallStats.totalTests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">اختبارات ناجحة</p>
                <p className="text-2xl font-bold">{overallStats.successfulTests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">متوسط زمن الاستجابة</p>
                <p className="text-2xl font-bold">{overallStats.averageResponseTime}ms</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">متوسط النقاط</p>
                <p className="text-2xl font-bold">{overallStats.averageScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      {isRunning && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">جاري التشغيل: {currentTest}</span>
                <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="suites" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="suites">مجموعات الاختبار</TabsTrigger>
          <TabsTrigger value="custom">اختبار مخصص</TabsTrigger>
          <TabsTrigger value="results">النتائج</TabsTrigger>
        </TabsList>

        <TabsContent value="suites" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testSuites.map((suite, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{suite.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{suite.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">الاختبارات ({suite.tests.length}):</p>
                    <ul className="text-xs space-y-1">
                      {suite.tests.map((test, testIndex) => (
                        <li key={testIndex} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          {test.category}
                        </li>
                      ))}
                    </ul>
                    <Button onClick={() => runTestSuite(suite)} disabled={isRunning} className="w-full mt-4" size="sm">
                      تشغيل هذه المجموعة
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                اختبار مخصص
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">رسالة الاختبار:</label>
                <Textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="اكتب رسالة لاختبار الذكاء الاصطناعي..."
                  className="min-h-[100px]"
                />
              </div>
              <Button onClick={runCustomTest} disabled={isRunning || !customMessage.trim()} className="w-full">
                {isRunning ? "جاري الاختبار..." : "تشغيل الاختبار"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <div className="space-y-4">
            {testResults.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <TestTube className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">لا توجد نتائج اختبار بعد</p>
                  <p className="text-sm text-muted-foreground mt-2">قم بتشغيل بعض الاختبارات لرؤية النتائج هنا</p>
                </CardContent>
              </Card>
            ) : (
              testResults.map((result) => (
                <Card key={result.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result.status)}
                        <Badge className={getStatusColor(result.status)}>
                          {result.status === "success" ? "نجح" : result.status === "warning" ? "تحذير" : "فشل"}
                        </Badge>
                        {result.score && <Badge variant="outline">النقاط: {Math.round(result.score)}%</Badge>}
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {result.responseTime}ms
                        </div>
                        <div>{result.timestamp.toLocaleString("ar-SA")}</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">الرسالة:</p>
                      <p className="text-sm bg-muted p-3 rounded-lg">{result.message}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">الرد:</p>
                      <p className="text-sm bg-muted p-3 rounded-lg whitespace-pre-wrap">{result.response}</p>
                    </div>

                    {result.analysis && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                        <div>
                          <p className="text-xs text-muted-foreground">اللغة</p>
                          <p className="text-sm font-medium">{result.analysis.language}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">النية</p>
                          <p className="text-sm font-medium">{result.analysis.intent}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">الصلة</p>
                          <p className="text-sm font-medium">{Math.round(result.analysis.relevance)}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">الدقة</p>
                          <p className="text-sm font-medium">{Math.round(result.analysis.accuracy)}%</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
