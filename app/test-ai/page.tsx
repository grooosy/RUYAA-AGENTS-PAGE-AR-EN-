"use client"

import { TabsContent } from "@/components/ui/tabs"

import { TabsTrigger } from "@/components/ui/tabs"

import { TabsList } from "@/components/ui/tabs"

import { Tabs } from "@/components/ui/tabs"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import AITester from "@/components/ai-assistant/AITester"
import DebugPanel from "@/components/ai-assistant/DebugPanel"
import { TestTube, Settings, MessageSquare, BarChart3 } from "lucide-react"
import { AuthProvider } from "@/lib/auth/auth-context"
import { LanguageProvider } from "@/contexts/LanguageContext"
import { Toaster } from "sonner"

export default function TestAIPage() {
  const [activeTab, setActiveTab] = useState("tester")

  return (
    <AuthProvider>
      <LanguageProvider>
        <div className="min-h-screen bg-background">
          <div className="container mx-auto py-8">
            {/* Header */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-3">
                    <TestTube className="h-10 w-10 text-blue-600" />
                    مركز اختبار الذكاء الاصطناعي
                  </span>
                  <Badge variant="outline">Development</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-muted-foreground">
                  اختبر وراقب أداء مساعد رؤيا الذكي وتأكد من جودة الاستجابات
                </p>
              </CardContent>
            </Card>

            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">AI Testing Page</h1>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="tester" className="flex items-center gap-2">
                  <TestTube className="h-4 w-4" />
                  اختبار الوظائف
                </TabsTrigger>
                <TabsTrigger value="debug" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  لوحة التشخيص
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  اختبار المحادثة
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  التحليلات
                </TabsTrigger>
              </TabsList>

              <TabsContent value="tester" className="mt-6">
                <AITester />
              </TabsContent>

              <TabsContent value="debug" className="mt-6">
                <DebugPanel />
              </TabsContent>

              <TabsContent value="chat" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      اختبار المحادثة التفاعلي
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        استخدم هذا القسم لاختبار المحادثة مع الذكاء الاصطناعي بشكل تفاعلي
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">أسئلة مقترحة للاختبار</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="p-3 bg-muted rounded-lg">
                                <p className="text-sm font-medium">ما هو الوكيل الذكي؟</p>
                                <p className="text-xs text-muted-foreground">اختبار التعريف الأساسي</p>
                              </div>
                              <div className="p-3 bg-muted rounded-lg">
                                <p className="text-sm font-medium">كيف يمكن للوكيل الذكي مساعدة شركتي؟</p>
                                <p className="text-xs text-muted-foreground">اختبار التطبيقات العملية</p>
                              </div>
                              <div className="p-3 bg-muted rounded-lg">
                                <p className="text-sm font-medium">ما هي خدمات رؤيا كابيتال؟</p>
                                <p className="text-xs text-muted-foreground">اختبار معرفة الشركة</p>
                              </div>
                              <div className="p-3 bg-muted rounded-lg">
                                <p className="text-sm font-medium">كيف يمكنني التواصل معكم؟</p>
                                <p className="text-xs text-muted-foreground">اختبار معلومات التواصل</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">نصائح الاختبار</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex items-start gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                                <div>
                                  <p className="text-sm font-medium">اختبر باللغة العربية والإنجليزية</p>
                                  <p className="text-xs text-muted-foreground">تأكد من دعم اللغتين</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                                <div>
                                  <p className="text-sm font-medium">جرب أسئلة معقدة ومتعددة الأجزاء</p>
                                  <p className="text-xs text-muted-foreground">اختبر قدرة الفهم المتقدم</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2" />
                                <div>
                                  <p className="text-sm font-medium">اختبر الأسئلة خارج النطاق</p>
                                  <p className="text-xs text-muted-foreground">
                                    تأكد من التعامل مع الأسئلة غير المتعلقة
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                                <div>
                                  <p className="text-sm font-medium">راقب زمن الاستجابة</p>
                                  <p className="text-xs text-muted-foreground">يجب أن يكون أقل من 5 ثوان</p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>معايير الأداء</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">زمن الاستجابة المثالي</span>
                          <span className="text-sm font-medium">{"< 3 ثوان"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">دقة الإجابات</span>
                          <span className="text-sm font-medium">{"≥ 85%"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">معدل النجاح</span>
                          <span className="text-sm font-medium">{"≥ 90%"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">دعم اللغة العربية</span>
                          <span className="text-sm font-medium">100%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>نقاط التحسين</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                          <p className="text-sm font-medium text-blue-900">تحسين فهم السياق</p>
                          <p className="text-xs text-blue-700">تطوير قدرة الذكاء الاصطناعي على فهم السياق المعقد</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                          <p className="text-sm font-medium text-green-900">تحسين الردود المخصصة</p>
                          <p className="text-xs text-green-700">جعل الردود أكثر تخصصاً حسب نوع العمل</p>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                          <p className="text-sm font-medium text-orange-900">تحسين زمن الاستجابة</p>
                          <p className="text-xs text-orange-700">تقليل زمن الاستجابة للاستفسارات المعقدة</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Toast notifications */}
          <Toaster position="top-right" richColors closeButton />
        </div>
      </LanguageProvider>
    </AuthProvider>
  )
}
