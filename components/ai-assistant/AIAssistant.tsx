"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Loader2, Copy, RotateCcw, Database, Wifi, WifiOff, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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

    checkHealth()
    const interval = setInterval(checkHealth, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const checkKnowledgeBaseStatus = async () => {
    try {
      setKnowledgeBaseStatus("loading")
      const items = await knowledgeManager.getKnowledgeItems({ limit: 1 })
      setKnowledgeBaseStatus("available")
    } catch (error) {
      console.warn("Knowledge base not available:", error)
      setKnowledgeBaseStatus("unavailable")
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      const response = await groqService.chat(userMessage.content)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.content,
        role: "assistant",
        timestamp: new Date(),
        language: response.language,
        confidence: response.confidence,
        sources: response.sources,
        responseTime: response.responseTime,
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Show warning if confidence is low
      if (response.confidence < 0.5) {
        toast.warning(
          response.language === "arabic"
            ? "قد تحتاج هذه المعلومة إلى تأكيد إضافي"
            : "This information may need additional confirmation",
        )
      }

      // Suggest human followup if needed
      if (response.needsHumanFollowup) {
        setTimeout(() => {
          toast.info(
            response.language === "arabic"
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
          "عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.\nSorry, there was a connection error. Please try again.",
        role: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
      toast.error("فشل في إرسال الرسالة / Failed to send message")
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
    toast.success("تم نسخ الرسالة / Message copied")
  }

  const clearConversation = () => {
    const confirmMessage = messages.some((m) => m.language === "english")
      ? "Are you sure you want to clear the conversation?"
      : "هل أنت متأكد من مسح المحادثة؟"

    if (confirm(confirmMessage)) {
      setMessages([])
      groqService.clearContext()
      toast.success("تم مسح المحادثة / Conversation cleared")
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
                  <CardTitle className="text-lg">مساعد رؤيا الذكي</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className={getConnectionStatusColor()}>{getConnectionStatusIcon()}</span>
                    <span>متصل ومتاح</span>
                    {connectionStatus.responseTime > 0 && (
                      <span className="text-xs">({connectionStatus.responseTime}ms)</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsKnowledgeManagerOpen(true)}
                  className="p-2"
                  title="إدارة قاعدة المعرفة"
                >
                  <Database className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={clearConversation} className="p-2" title="مسح المحادثة">
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
                  ✕
                </Button>
              </div>
            </div>

            {knowledgeBaseStatus === "unavailable" && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex items-center gap-2 text-sm text-yellow-700">
                  <AlertCircle className="w-4 h-4" />
                  <span>قاعدة المعرفة غير متوفرة. يرجى تشغيل السكريبت لإنشاء الجداول.</span>
                </div>
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
                      <h3 className="text-lg font-semibold mb-2">مرحباً بك في مساعد رؤيا الذكي</h3>
                      <p className="text-sm">
                        يمكنني مساعدتك في الاستفسار عن خدماتنا وحلول الذكاء الاصطناعي
                        <br />I can help you inquire about our services and AI solutions
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
                                    {message.sources.length} مصدر
                                  </Badge>
                                )}
                                {message.responseTime && (
                                  <span className="text-xs text-gray-500">{message.responseTime}ms</span>
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
                          {message.timestamp.toLocaleTimeString("ar-SA", {
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
                    <span>جاري الكتابة...</span>
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
                  placeholder="اكتب رسالتك هنا... / Type your message here..."
                  disabled={isLoading || connectionStatus.status === "offline"}
                  className="flex-1"
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
                  لا يوجد اتصال بالإنترنت / No internet connection
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
