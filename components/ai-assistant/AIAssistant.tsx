"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { X, Send, Bot, User, Minimize2, Maximize2, Wifi, WifiOff, Brain, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth/auth-context"
import { useLanguage } from "@/contexts/LanguageContext"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { groqAI } from "@/lib/ai/groq-service"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  status?: "sending" | "sent" | "error"
  metadata?: {
    responseTime?: number
    confidence?: number
    sources?: string[]
    intent?: string
  }
}

interface AIAssistantProps {
  isOpen: boolean
  onToggle: () => void
}

export default function AIAssistant({ isOpen, onToggle }: AIAssistantProps) {
  const { user, profile } = useAuth()
  const { t, isRTL } = useLanguage()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"online" | "offline" | "connecting">("online")
  const [error, setError] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  // Device detection
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
  })

  useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
      const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent)

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop: !isMobile && !isTablet,
      })
    }

    detectDevice()
    window.addEventListener("resize", detectDevice)
    return () => window.removeEventListener("resize", detectDevice)
  }, [])

  // Connection status monitoring
  useEffect(() => {
    const handleOnline = () => setConnectionStatus("online")
    const handleOffline = () => setConnectionStatus("offline")

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    setConnectionStatus(navigator.onLine ? "online" : "offline")

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Initialize chat with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        content: `مرحباً! 👋 أنا مساعدك الذكي من رؤيا كابيتال.

🤖 **أستطيع مساعدتك في:**
• معرفة خدمات الوكلاء الذكيين
• حساب التكاليف والعائد على الاستثمار
• شرح كيفية التطبيق والتكامل
• الإجابة على أسئلتك التقنية

💡 **جرب أن تسأل:**
• "ما هي خدماتكم؟"
• "كم تكلفة الوكيل الذكي؟"
• "كيف يعمل وكيل الدعم؟"

كيف يمكنني مساعدتك اليوم؟`,
        role: "assistant",
        timestamp: new Date(),
        status: "sent",
        metadata: {
          confidence: 1.0,
          sources: ["welcome"],
        },
      }

      setMessages([welcomeMessage])
    }
  }, [isOpen])

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Focus input when opened on desktop
  useEffect(() => {
    if (isOpen && !isMinimized && !deviceInfo.isMobile && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 300)
    }
  }, [isOpen, isMinimized, deviceInfo.isMobile])

  // Send message with Groq AI
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return

    const messageContent = inputValue.trim()
    setInputValue("")
    setError(null)

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageContent,
      role: "user",
      timestamp: new Date(),
      status: "sending",
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)
    setIsTyping(true)

    try {
      // Update message status to sent
      setMessages((prev) => prev.map((msg) => (msg.id === userMessage.id ? { ...msg, status: "sent" } : msg)))

      // Analyze user intent
      const intentAnalysis = await groqAI.analyzeUserIntent(messageContent)

      // Prepare conversation history for AI
      const conversationHistory = messages.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }))

      // Add current user message
      conversationHistory.push({
        role: "user",
        content: messageContent,
      })

      // Generate AI response using Groq
      const aiResponse = await groqAI.generateResponse(conversationHistory)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse.content,
        role: "assistant",
        timestamp: new Date(),
        status: "sent",
        metadata: {
          responseTime: aiResponse.responseTime,
          confidence: aiResponse.confidence,
          sources: aiResponse.sources,
          intent: intentAnalysis.intent,
        },
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Log interaction to Supabase
      if (user && connectionStatus === "online") {
        try {
          await supabase.from("agent_interactions").insert({
            user_id: user.id,
            agent_type: "groq_ai_assistant",
            interaction_type: "chat",
            session_id: `chat_${Date.now()}`,
            metadata: {
              user_message: messageContent,
              ai_response: aiResponse.content,
              intent: intentAnalysis.intent,
              confidence: aiResponse.confidence,
              response_time: aiResponse.responseTime,
              timestamp: new Date().toISOString(),
            },
          })
        } catch (logError) {
          console.warn("Failed to log interaction:", logError)
        }
      }
    } catch (error) {
      console.error("Error sending message:", error)
      setError("فشل في إرسال الرسالة")

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "عذراً، حدث خطأ في معالجة رسالتك. يرجى المحاولة مرة أخرى أو التواصل معنا مباشرة على +963940632191",
        role: "assistant",
        timestamp: new Date(),
        status: "error",
      }

      setMessages((prev) => [...prev, errorMessage])
      toast.error("فشل في إرسال الرسالة. يرجى المحاولة مرة أخرى.")
    } finally {
      setIsLoading(false)
      setIsTyping(false)
    }
  }, [inputValue, isLoading, messages, user, connectionStatus, supabase])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && !event.shiftKey && inputValue.trim()) {
        event.preventDefault()
        handleSendMessage()
      }
      if (event.key === "Escape" && isOpen) {
        onToggle()
      }
    }

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, inputValue, handleSendMessage, onToggle])

  // Retry failed message
  const retryMessage = useCallback(
    (messageId: string) => {
      const message = messages.find((m) => m.id === messageId)
      if (message && message.role === "user") {
        setInputValue(message.content)
        setMessages((prev) => prev.filter((m) => m.id !== messageId))
      }
    },
    [messages],
  )

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ duration: 0.2 }}
      className={`fixed z-50 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl ${
        deviceInfo.isMobile ? "inset-4" : isMinimized ? "bottom-4 right-4 w-80 h-16" : "bottom-4 right-4 w-96 h-[600px]"
      }`}
      style={{ direction: isRTL ? "rtl" : "ltr" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/50 rounded-t-2xl">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div
              className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${
                connectionStatus === "online"
                  ? "bg-green-500"
                  : connectionStatus === "offline"
                    ? "bg-red-500"
                    : "bg-yellow-500"
              }`}
            />
          </div>
          <div className={isMinimized ? "hidden" : "block"}>
            <h3 className="text-white font-semibold">مساعد رؤيا الذكي</h3>
            <div className="flex items-center space-x-2 space-x-reverse">
              <div
                className={`w-2 h-2 rounded-full ${
                  connectionStatus === "online"
                    ? "bg-green-500"
                    : connectionStatus === "offline"
                      ? "bg-red-500"
                      : "bg-yellow-500"
                }`}
              />
              <span className="text-xs text-slate-400">
                {connectionStatus === "online"
                  ? "متصل"
                  : connectionStatus === "offline"
                    ? "غير متصل"
                    : "جاري الاتصال..."}
              </span>
              {isTyping && <span className="text-xs text-cyan-400">يكتب...</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 space-x-reverse">
          {!deviceInfo.isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-slate-400 hover:text-white hover:bg-slate-700"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="text-slate-400 hover:text-white hover:bg-slate-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(100%-140px)] bg-slate-900/30">
            {error && (
              <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 text-red-200 text-sm">{error}</div>
            )}

            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex items-start space-x-2 space-x-reverse max-w-[85%] ${
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === "user" ? "bg-cyan-600" : "bg-gradient-to-br from-blue-600 to-purple-600"
                    }`}
                  >
                    {message.role === "user" ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-cyan-600 text-white"
                        : "bg-slate-800 text-slate-100 border border-slate-700"
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                    <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                      <span>
                        {message.timestamp.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        {message.status === "sending" && <Loader2 className="w-3 h-3 animate-spin text-yellow-500" />}
                        {message.status === "sent" && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                        {message.status === "error" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => retryMessage(message.id)}
                            className="text-red-400 hover:text-red-300 p-0 h-auto"
                          >
                            إعادة المحاولة
                          </Button>
                        )}
                        {message.metadata?.confidence && (
                          <span className="text-xs text-slate-500">
                            {Math.round(message.metadata.confidence * 100)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3">
                    <div className="flex space-x-1">
                      <div
                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <div
                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <div
                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-700 bg-slate-800/30 rounded-b-2xl">
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={connectionStatus === "offline" ? "غير متصل بالإنترنت..." : "اكتب رسالتك هنا..."}
                  disabled={isLoading || connectionStatus === "offline"}
                  className="bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500 pr-12"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  {connectionStatus === "offline" ? (
                    <WifiOff className="w-4 h-4 text-red-500" />
                  ) : (
                    <Wifi className="w-4 h-4 text-green-500" />
                  )}
                </div>
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading || connectionStatus === "offline"}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>

            {/* Quick suggestions */}
            {messages.length <= 1 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {["ما هي خدماتكم؟", "كم التكلفة؟", "كيف يعمل الوكيل الذكي؟", "أريد عرض سعر"].map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => setInputValue(suggestion)}
                    className="text-xs bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            )}

            <div className="mt-2 text-xs text-slate-500 text-center">اضغط Enter للإرسال • Esc للإغلاق</div>
          </div>
        </>
      )}
    </motion.div>
  )
}
