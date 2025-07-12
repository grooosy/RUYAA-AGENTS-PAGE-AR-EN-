"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  Send,
  Bot,
  User,
  Minimize2,
  Maximize2,
  Wifi,
  WifiOff,
  Loader2,
  Trash2,
  Copy,
  AlertTriangle,
  CheckCircle,
  MessageCircle,
} from "lucide-react"
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
    requiresHumanFollowup?: boolean
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
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [sessionId, setSessionId] = useState<string>("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    screenWidth: 0,
    screenHeight: 0,
    touchSupported: false,
  })

  useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobile =
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) || window.innerWidth <= 768
      const isTablet =
        /ipad|android(?!.*mobile)/i.test(userAgent) || (window.innerWidth > 768 && window.innerWidth <= 1024)
      const touchSupported = "ontouchstart" in window || navigator.maxTouchPoints > 0

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop: !isMobile && !isTablet,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        touchSupported,
      })
    }

    detectDevice()
    window.addEventListener("resize", detectDevice)
    return () => window.removeEventListener("resize", detectDevice)
  }, [])

  useEffect(() => {
    const handleOnline = () => setConnectionStatus("online")
    const handleOffline = () => setConnectionStatus("offline")

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    setConnectionStatus(navigator.onLine ? "online" : "offline")

    const testAIConnection = async () => {
      setConnectionStatus("connecting")
      try {
        const isConnected = await groqAI.testConnection()
        setConnectionStatus(isConnected ? "online" : "offline")
      } catch (error) {
        console.error("AI connection test failed:", error)
        setConnectionStatus("offline")
      }
    }

    testAIConnection()

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  useEffect(() => {
    if (isOpen && !sessionId) {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      setSessionId(newSessionId)
    }
  }, [isOpen, sessionId])

  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
      setShowScrollButton(!isNearBottom && messages.length > 3)
    }

    container.addEventListener("scroll", handleScroll)
    return () => container.removeEventListener("scroll", handleScroll)
  }, [messages.length])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        content: `مرحباً! أنا مساعدك الذكي من رؤيا كابيتال.

أستطيع مساعدتك في:
• معرفة خدمات الوكلاء الذكيين
• شرح كيفية عمل حلولنا التقنية
• توجيهك للحصول على استشارة مخصصة
• الإجابة على أسئلتك العامة

كيف يمكنني مساعدتك اليوم؟`,
        role: "assistant",
        timestamp: new Date(),
        status: "sent",
        metadata: {
          confidence: 1.0,
          sources: ["welcome"],
          requiresHumanFollowup: false,
        },
      }

      setMessages([welcomeMessage])
    }
  }, [isOpen])

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    if (isOpen && !isMinimized && !deviceInfo.isMobile && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 300)
    }
  }, [isOpen, isMinimized, deviceInfo.isMobile])

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
      setMessages((prev) => prev.map((msg) => (msg.id === userMessage.id ? { ...msg, status: "sent" } : msg)))

      const conversationHistory = messages.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }))

      conversationHistory.push({
        role: "user",
        content: messageContent,
      })

      const aiResponse = await groqAI.generateResponse(conversationHistory, {
        userId: user?.id,
        sessionId,
        deviceInfo,
        timestamp: new Date().toISOString(),
        realTimeData: {
          currentTime: new Date().toLocaleString("ar-SA"),
          userLocation: "Syria",
          sessionDuration: Date.now() - Number.parseInt(sessionId.split("_")[1]),
          messageCount: messages.length + 1,
        },
      })

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
          requiresHumanFollowup: aiResponse.requiresHumanFollowup,
        },
      }

      setMessages((prev) => [...prev, assistantMessage])

      if (user && profile) {
        try {
          await supabase.from("agent_interactions").insert({
            user_id: user.id,
            session_id: sessionId,
            message_type: "chat",
            user_message: messageContent,
            ai_response: aiResponse.content,
            response_time: aiResponse.responseTime,
            confidence_score: aiResponse.confidence,
            metadata: {
              sources: aiResponse.sources,
              requiresHumanFollowup: aiResponse.requiresHumanFollowup,
              deviceInfo,
            },
          })
        } catch (dbError) {
          console.error("Error logging interaction:", dbError)
        }
      }

      if (aiResponse.requiresHumanFollowup) {
        toast.info("للحصول على معلومات أكثر دقة، يُنصح بالتواصل المباشر")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      setError("حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.")

      setMessages((prev) => prev.map((msg) => (msg.id === userMessage.id ? { ...msg, status: "error" } : msg)))

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `عذراً، حدث خطأ في الاتصال.

سيكون فريقنا سعيداً لمساعدتك.`,
        role: "assistant",
        timestamp: new Date(),
        status: "sent",
        metadata: {
          confidence: 1.0,
          sources: ["error_fallback"],
          requiresHumanFollowup: true,
        },
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setIsTyping(false)
    }
  }, [inputValue, isLoading, messages, user, profile, sessionId, deviceInfo, supabase])

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSendMessage()
      }
    },
    [handleSendMessage],
  )

  const handleClearConversation = useCallback(() => {
    if (confirm("هل أنت متأكد من حذف المحادثة؟")) {
      setMessages([])
      setError(null)
      setTimeout(() => {
        const welcomeMessage: Message = {
          id: Date.now().toString(),
          content: `مرحباً مجدداً! كيف يمكنني مساعدتك؟`,
          role: "assistant",
          timestamp: new Date(),
          status: "sent",
          metadata: {
            confidence: 1.0,
            sources: ["welcome"],
          },
        }
        setMessages([welcomeMessage])
      }, 100)
    }
  }, [])

  const handleCopyMessage = useCallback((content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      toast.success("تم نسخ الرسالة")
    })
  }, [])

  const handleRetryMessage = useCallback(
    (messageId: string) => {
      const message = messages.find((msg) => msg.id === messageId)
      if (message && message.role === "user") {
        setInputValue(message.content)
        const messageIndex = messages.findIndex((msg) => msg.id === messageId)
        setMessages((prev) => prev.slice(0, messageIndex))
      }
    },
    [messages],
  )

  const formatMessageContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`(.*?)`/g, '<code class="bg-gray-800 text-white px-2 py-1 rounded text-sm">$1</code>')
      .replace(/\n/g, "<br>")
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`fixed ${isRTL ? "left-4" : "right-4"} z-[9999] bg-black rounded-3xl shadow-2xl ${
        isMinimized
          ? "w-80 h-16 bottom-4"
          : deviceInfo.isMobile
            ? "w-[95vw] h-[90vh] bottom-2"
            : "w-96 h-[600px] bottom-4"
      } transition-all duration-300 overflow-hidden border border-gray-800`}
      style={{
        maxHeight: deviceInfo.isMobile ? "calc(100vh - 20px)" : "600px",
        top: deviceInfo.isMobile && !isMinimized ? "5px" : "auto",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1)",
      }}
    >
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800 bg-black min-h-[72px]">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-black" />
            </div>
            <div
              className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-black ${
                connectionStatus === "online"
                  ? "bg-white"
                  : connectionStatus === "connecting"
                    ? "bg-gray-400"
                    : "bg-gray-600"
              }`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-lg leading-tight">مساعد رؤيا الذكي</h3>
            <div className="flex items-center gap-2 text-sm text-gray-300 mt-1">
              {connectionStatus === "online" ? (
                <>
                  <Wifi className="w-4 h-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">متصل ومتاح</span>
                </>
              ) : connectionStatus === "connecting" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                  <span className="whitespace-nowrap">جاري الاتصال...</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">غير متصل</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-white hover:text-gray-300 hover:bg-gray-800 rounded-full w-10 h-10 p-0"
          >
            {isMinimized ? <Maximize2 className="w-5 h-5" /> : <Minimize2 className="w-5 h-5" />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onToggle}
            className="text-white hover:text-gray-300 hover:bg-gray-800 rounded-full w-10 h-10 p-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-black"
            style={{ height: deviceInfo.isMobile ? "calc(90vh - 212px)" : "calc(600px - 212px)" }}
          >
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-black" />
                      </div>
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 ${
                      message.role === "user" ? "bg-white text-black" : "bg-gray-900 text-white border border-gray-700"
                    }`}
                  >
                    <div
                      className="text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) }}
                    />

                    <div className="flex items-center justify-between mt-3 text-xs opacity-60">
                      <div className="flex items-center gap-2">
                        {message.status === "sending" && <Loader2 className="w-3 h-3 animate-spin" />}
                        {message.status === "error" && <AlertTriangle className="w-3 h-3" />}
                        {message.status === "sent" && message.role === "assistant" && (
                          <CheckCircle className="w-3 h-3" />
                        )}
                        <span>
                          {message.timestamp.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-700">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopyMessage(message.content)}
                        className="text-xs text-gray-400 hover:text-white p-1 h-auto rounded-full"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      {message.status === "error" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRetryMessage(message.id)}
                          className="text-xs text-gray-400 hover:text-white p-1 h-auto rounded-full"
                        >
                          إعادة المحاولة
                        </Button>
                      )}
                    </div>
                  </div>
                  {message.role === "user" && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 justify-start"
              >
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-black" />
                  </div>
                </div>
                <div className="bg-gray-900 rounded-2xl p-4 border border-gray-700">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {showScrollButton && (
            <Button
              size="sm"
              onClick={scrollToBottom}
              className="absolute bottom-20 right-4 rounded-full w-10 h-10 p-0 bg-white hover:bg-gray-200 text-black shadow-lg"
            >
              ↓
            </Button>
          )}

          {error && (
            <div className="px-4 py-3 bg-gray-900 border-t border-gray-800">
              <div className="flex items-center gap-2 text-white text-sm">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </div>
            </div>
          )}

          <div className="p-4 border-t border-gray-800 bg-black min-h-[140px]">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={connectionStatus === "online" ? "اكتب رسالتك..." : "غير متصل..."}
                  disabled={isLoading || connectionStatus !== "online"}
                  className="bg-gray-900 border border-gray-700 text-white placeholder-gray-400 pr-12 pl-4 py-3 rounded-full focus:ring-2 focus:ring-white focus:border-white h-12"
                  dir="rtl"
                />
                {messages.length > 1 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleClearConversation}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white p-1 h-auto rounded-full"
                    title="مسح المحادثة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading || connectionStatus !== "online"}
                className="bg-white hover:bg-gray-200 disabled:opacity-50 text-black rounded-full w-12 h-12 p-0 flex items-center justify-center flex-shrink-0"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  )
}
