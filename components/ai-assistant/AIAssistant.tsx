"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Loader2, Copy, RotateCcw, Database, Wifi, WifiOff, AlertCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { groqService } from "@/lib/ai/groq-service"
import { knowledgeManager } from "@/lib/ai/knowledge-manager"
import KnowledgeManager from "./KnowledgeManager"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  language?: "arabic" | "english"
  confidence?: number
  sources?: string[]
  responseTime?: number
  detectedLanguage?: "ar" | "en"
  contextUnderstanding?: number
}

interface ConnectionStatus {
  status: "online" | "offline" | "degraded"
  responseTime: number
  lastChecked: Date
}

interface AIAssistantProps {
  isOpen: boolean
  onClose: () => void
}

export default function AIAssistant({ isOpen, onClose }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    status: "online",
    responseTime: 0,
    lastChecked: new Date(),
  })
  const [isKnowledgeManagerOpen, setIsKnowledgeManagerOpen] = useState(false)
  const [knowledgeBaseStatus, setKnowledgeBaseStatus] = useState<"loading" | "available" | "unavailable">("loading")
  const [knowledgeItems, setKnowledgeItems] = useState<any[]>([])
  const [conversationLanguage, setConversationLanguage] = useState<"ar" | "en">("ar")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Language detection function
  const detectLanguage = (text: string): "ar" | "en" => {
    const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/
    const englishPattern = /[a-zA-Z]/

    const arabicMatches = (text.match(arabicPattern) || []).length
    const englishMatches = (text.match(englishPattern) || []).length

    if (arabicMatches > englishMatches) return "ar"

    const arabicWords = ["في", "من", "إلى", "على", "هذا", "هذه", "كيف", "ماذا", "أين", "متى", "لماذا"]
    const englishWords = [
      "the",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "how",
      "what",
      "where",
      "when",
      "why",
    ]

    const lowerText = text.toLowerCase()
    const arabicWordCount = arabicWords.filter((word) => lowerText.includes(word)).length
    const englishWordCount = englishWords.filter((word) => lowerText.includes(word)).length

    return arabicWordCount > englishWordCount ? "ar" : "en"
  }

  // Check knowledge base availability
  useEffect(() => {
    checkKnowledgeBaseStatus()
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Check API health periodically
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await groqService.checkHealth()
        setConnectionStatus({
          ...health,
          lastChecked: new Date(),
        })
      } catch (error) {
        setConnectionStatus({
          status: "offline",
          responseTime: 0,
          lastChecked: new Date(),
        })
      }
    }

    if (isOpen) {
      checkHealth()
      const interval = setInterval(checkHealth, 30000) // Check every 30 seconds
      return () => clearInterval(interval)
    }
  }, [isOpen])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Load welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        content:
          conversationLanguage === "ar"
            ? `مرحباً! أنا مساعدك الذكي من رؤيا كابيتال.

أستطيع مساعدتك في:
• معرفة خدمات الوكلاء الذكيين
• شرح حلولنا التقنية المتقدمة
• توجيهك للحصول على استشارة مخصصة
• الإجابة على أسئلتك بدقة

كيف يمكنني مساعدتك اليوم؟`
            : `Hello! I'm your intelligent assistant from Ruyaa Capital.

I can help you with:
• Learning about intelligent agent services
• Explaining our advanced technical solutions
• Guiding you to get personalized consultation
• Answering your questions accurately

How can I help you today?`,
        role: "assistant",
        timestamp: new Date(),
        language: conversationLanguage === "ar" ? "arabic" : "english",
        confidence: 1.0,
        detectedLanguage: conversationLanguage,
        contextUnderstanding: 1.0,
      }

      setMessages([welcomeMessage])
    }
  }, [isOpen, conversationLanguage])

  const checkKnowledgeBaseStatus = async () => {
    try {
      setKnowledgeBaseStatus("loading")
      const isAvailable = await knowledgeManager.isAvailable()

      if (isAvailable) {
        const items = await knowledgeManager.getKnowledgeItems({ verified: true, limit: 50 })
        setKnowledgeItems(items)
        setKnowledgeBaseStatus("available")
      } else {
        setKnowledgeBaseStatus("unavailable")
        setKnowledgeItems([])
      }
    } catch (error) {
      console.warn("Knowledge base check failed:", error)
      setKnowledgeBaseStatus("unavailable")
      setKnowledgeItems([])
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const messageContent = inputValue.trim()
    const detectedLang = detectLanguage(messageContent)

    // Update conversation language if it changes
    if (detectedLang !== conversationLanguage) {
      setConversationLanguage(detectedLang)
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageContent,
      role: "user",
      timestamp: new Date(),
      detectedLanguage: detectedLang,
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      // Prepare conversation history
      const conversationHistory = [...messages, userMessage].map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
        timestamp: msg.timestamp,
        language: msg.language,
      }))

      console.log(`Making real-time API call for ${detectedLang} message...`)

      // Make real-time API call
      const response = await groqService.generateResponse(conversationHistory, knowledgeItems, {
        timestamp: new Date().toISOString(),
        conversationContext: {
          previousTopics: [],
          userPreferences: {},
          sessionDuration: Date.now(),
          messageCount: messages.length + 1,
        },
      })

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.content,
        role: "assistant",
        timestamp: new Date(),
        language: response.language,
        confidence: response.confidence,
        sources: response.sources,
        responseTime: response.responseTime,
        detectedLanguage: response.detectedLanguage,
        contextUnderstanding: response.contextUnderstanding,
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Show warning if confidence is low
      if (response.confidence < 0.5) {
        toast.warning(
          response.detectedLanguage === "ar"
            ? "قد تحتاج هذه المعلومة إلى تأكيد إضافي"
            : "This information may need additional confirmation",
        )
      }

      // Suggest human followup if needed
      if (response.needsHumanFollowup) {
        setTimeout(() => {
          toast.info(
            response.detectedLanguage === "ar"
              ? "للحصول على مساعدة شخصية، يرجى التواصل مع فريقنا"
              : "For personalized assistance, please contact our team",
          )
        }, 2000)
      }
    } catch (error) {
      console.error("Error sending message:", error)

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          detectedLang === "ar"
            ? "عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى."
            : "Sorry, there was a connection error. Please try again.",
        role: "assistant",
        timestamp: new Date(),
        detectedLanguage: detectedLang,
        confidence: 0.1,
      }

      setMessages((prev) => [...prev, errorMessage])
      toast.error(detectedLang === "ar" ? "فشل في إرسال الرسالة" : "Failed to send message")
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
    toast.success(conversationLanguage === "ar" ? "تم نسخ الرسالة" : "Message copied")
  }

  const clearConversation = () => {
    const confirmMessage =
      conversationLanguage === "ar"
        ? "هل أنت متأكد من مسح المحادثة؟"
        : "Are you sure you want to clear the conversation?"

    if (confirm(confirmMessage)) {
      setMessages([])
      groqService.clearContext()
      toast.success(conversationLanguage === "ar" ? "تم مسح المحادثة" : "Conversation cleared")
    }
  }

  const getConnectionStatusColor = () => {
    switch (connectionStatus.status) {
      case "online":
        return "text-green-500"
      case "degraded":
        return "text-yellow-500"
      case "offline":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  const getConnectionStatusIcon = () => {
    switch (connectionStatus.status) {
      case "online":
        return <Wifi className="w-4 h-4" />
      case "degraded":
        return <AlertCircle className="w-4 h-4" />
      case "offline":
        return <WifiOff className="w-4 h-4" />
      default:
        return <Wifi className="w-4 h-4" />
    }
  }

  if (!isOpen) return null

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        onClick={onClose}
      >
        <Card className="w-full max-w-2xl h-[600px] flex flex-col bg-white" onClick={(e) => e.stopPropagation()}>
          <CardHeader className="flex-shrink-0 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src="/images/ruyaa-ai-logo.png" alt="Ruyaa AI" />
                  <AvatarFallback className="bg-blue-100 text-blue-600">AI</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">
                    {conversationLanguage === "ar" ? "مساعد رؤيا الذكي" : "Ruyaa AI Assistant"}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className={getConnectionStatusColor()}>{getConnectionStatusIcon()}</span>
                    <span>
                      {conversationLanguage === "ar"
                        ? connectionStatus.status === "online"
                          ? "متصل ومتاح"
                          : connectionStatus.status === "degraded"
                            ? "اتصال بطيء"
                            : "غير متصل"
                        : connectionStatus.status === "online"
                          ? "Online & Available"
                          : connectionStatus.status === "degraded"
                            ? "Slow Connection"
                            : "Offline"}
                    </span>
                    {connectionStatus.responseTime > 0 && (
                      <span className="text-xs">({connectionStatus.responseTime}ms)</span>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {conversationLanguage === "ar" ? "ع" : "EN"}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsKnowledgeManagerOpen(true)}
                  className="p-2"
                  title={conversationLanguage === "ar" ? "إدارة قاعدة المعرفة" : "Manage Knowledge Base"}
                >
                  <Database className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearConversation}
                  className="p-2"
                  title={conversationLanguage === "ar" ? "مسح المحادثة" : "Clear conversation"}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {knowledgeBaseStatus === "unavailable" && (
              <Alert className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {conversationLanguage === "ar"
                    ? "قاعدة المعرفة غير متوفرة. يرجى تشغيل السكريبت لإنشاء الجداول."
                    : "Knowledge base unavailable. Please run the script to create tables."}
                </AlertDescription>
              </Alert>
            )}

            {knowledgeBaseStatus === "available" && (
              <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                <Database className="w-4 h-4" />
                <span>
                  {conversationLanguage === "ar"
                    ? `قاعدة المعرفة متاحة (${knowledgeItems.length} عنصر)`
                    : `Knowledge base available (${knowledgeItems.length} items)`}
                </span>
              </div>
            )}
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence>
                {messages.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center text-gray-500 py-8"
                  >
                    <div className="mb-4">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl">🤖</span>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        {conversationLanguage === "ar"
                          ? "مرحباً بك في مساعد رؤيا الذكي"
                          : "Welcome to Ruyaa AI Assistant"}
                      </h3>
                      <p className="text-sm">
                        {conversationLanguage === "ar"
                          ? "يمكنني مساعدتك في الاستفسار عن خدماتنا وحلول الذكاء الاصطناعي"
                          : "I can help you inquire about our services and AI solutions"}
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[80%] ${message.role === "user" ? "order-2" : "order-1"}`}>
                        <div
                          className={`p-3 rounded-lg ${
                            message.role === "user" ? "bg-blue-500 text-white ml-2" : "bg-gray-100 text-gray-800 mr-2"
                          }`}
                        >
                          <div className="whitespace-pre-wrap">{message.content}</div>

                          {message.role === "assistant" && (
                            <div className="mt-2 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {message.confidence !== undefined && (
                                  <Badge
                                    variant={message.confidence > 0.7 ? "default" : "secondary"}
                                    className="text-xs"
                                  >
                                    {Math.round(message.confidence * 100)}%
                                  </Badge>
                                )}
                                {message.sources && message.sources.length > 0 && (
                                  <Badge variant="outline" className="text-xs">
                                    {conversationLanguage === "ar" ? "مصادر" : "Sources"}: {message.sources.length}
                                  </Badge>
                                )}
                                {message.responseTime && (
                                  <span className="text-xs text-gray-500">{message.responseTime}ms</span>
                                )}
                                {message.detectedLanguage && (
                                  <Badge variant="outline" className="text-xs">
                                    {message.detectedLanguage === "ar" ? "ع" : "EN"}
                                  </Badge>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyMessage(message.content)}
                                className="p-1 h-auto"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </div>

                        <div
                          className={`text-xs text-gray-500 mt-1 ${
                            message.role === "user" ? "text-right" : "text-left"
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString(conversationLanguage === "ar" ? "ar-SA" : "en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 text-gray-800 p-3 rounded-lg mr-2 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{conversationLanguage === "ar" ? "جاري الكتابة..." : "Typing..."}</span>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    connectionStatus.status === "offline"
                      ? conversationLanguage === "ar"
                        ? "لا يوجد اتصال..."
                        : "No connection..."
                      : conversationLanguage === "ar"
                        ? "اكتب رسالتك هنا..."
                        : "Type your message here..."
                  }
                  disabled={isLoading || connectionStatus.status === "offline"}
                  className="flex-1"
                  dir={conversationLanguage === "ar" ? "rtl" : "ltr"}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputValue.trim() || connectionStatus.status === "offline"}
                  size="sm"
                  className="px-4"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>

              {connectionStatus.status === "offline" && (
                <div className="mt-2 text-sm text-red-500 text-center">
                  {conversationLanguage === "ar" ? "لا يوجد اتصال بالإنترنت" : "No internet connection"}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <KnowledgeManager
        isOpen={isKnowledgeManagerOpen}
        onClose={() => {
          setIsKnowledgeManagerOpen(false)
          checkKnowledgeBaseStatus() // Refresh status after closing
        }}
      />
    </>
  )
}
