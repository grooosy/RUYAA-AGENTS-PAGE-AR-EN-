"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Send, Bot, User, Minimize2, Maximize2, Wifi, WifiOff, Brain, Loader2, Trash2, Copy } from "lucide-react"
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
  const [showScrollButton, setShowScrollButton] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  // Device detection with enhanced mobile support
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

  // Scroll detection for scroll-to-bottom button
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
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

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

  // Copy message to clipboard
  const copyMessage = useCallback((content: string) => {
    navigator.clipboard
      .writeText(content)
      .then(() => {
        toast.success("تم نسخ الرسالة")
      })
      .catch(() => {
        toast.error("فشل في نسخ الرسالة")
      })
  }, [])

  // Clear conversation
  const clearConversation = useCallback(() => {
    setMessages([])
    setError(null)
    toast.success("تم مسح المحادثة")
  }, [])

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

  // Responsive sizing
  const getWidgetStyles = () => {
    if (deviceInfo.isMobile) {
      return "inset-2 max-h-[calc(100vh-16px)]"
    } else if (isMinimized) {
      return "bottom-4 right-4 w-80 h-16"
    } else {
      return "bottom-4 right-4 w-[420px] h-[700px] max-h-[calc(100vh-32px)]"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`fixed z-50 bg-black/95 backdrop-blur-xl border border-gray-800/50 rounded-2xl shadow-2xl overflow-hidden ${getWidgetStyles()}`}
      style={{
        direction: isRTL ? "rtl" : "ltr",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800/50 bg-black/80">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center border border-gray-700/50">
              <Brain className="w-5 h-5 text-gray-300" />
            </div>
            <div
              className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-black ${
                connectionStatus === "online"
                  ? "bg-green-500"
                  : connectionStatus === "offline"
                    ? "bg-red-500"
                    : "bg-yellow-500"
              }`}
            />
          </div>
          <div className={isMinimized ? "hidden" : "block"}>
            <h3 className="text-white font-semibold text-sm">مساعد رؤيا الذكي</h3>
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
              <span className="text-xs text-gray-400">
                {connectionStatus === "online"
                  ? "متصل"
                  : connectionStatus === "offline"
                    ? "غير متصل"
                    : "جاري الاتصال..."}
              </span>
              {isTyping && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-gray-300">
                  يكتب...
                </motion.span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 space-x-reverse">
          {!deviceInfo.isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-gray-400 hover:text-white hover:bg-gray-800/50 w-8 h-8 p-0"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
          )}
          {!isMinimized && messages.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearConversation}
              className="text-gray-400 hover:text-white hover:bg-gray-800/50 w-8 h-8 p-0"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="text-gray-400 hover:text-white hover:bg-gray-800/50 w-8 h-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/30 relative"
            style={{ height: deviceInfo.isMobile ? "calc(100vh - 180px)" : "calc(100% - 140px)" }}
          >
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-900/30 border border-red-800/50 rounded-xl p-3 text-red-300 text-sm backdrop-blur-sm"
              >
                {error}
              </motion.div>
            )}

            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex items-start space-x-3 space-x-reverse max-w-[85%] group ${
                      message.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border ${
                        message.role === "user"
                          ? "bg-gray-700 border-gray-600"
                          : "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700"
                      }`}
                    >
                      {message.role === "user" ? (
                        <User className="w-4 h-4 text-gray-300" />
                      ) : (
                        <Bot className="w-4 h-4 text-gray-300" />
                      )}
                    </div>
                    <div className="relative">
                      <div
                        className={`rounded-2xl px-4 py-3 relative ${
                          message.role === "user"
                            ? "bg-gray-800 text-white border border-gray-700/50"
                            : "bg-gray-900/80 text-gray-100 border border-gray-800/50 backdrop-blur-sm"
                        }`}
                      >
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>

                        {/* Message actions */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-2 right-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyMessage(message.content)}
                            className="w-6 h-6 p-0 bg-black/80 hover:bg-gray-800 text-gray-400 hover:text-white border border-gray-700/50"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Message metadata */}
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
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
                              className="text-red-400 hover:text-red-300 p-0 h-auto text-xs"
                            >
                              إعادة المحاولة
                            </Button>
                          )}
                          {message.metadata?.confidence && (
                            <span className="text-xs text-gray-600">
                              {Math.round(message.metadata.confidence * 100)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-gray-300" />
                  </div>
                  <div className="bg-gray-900/80 border border-gray-800/50 rounded-2xl px-4 py-3 backdrop-blur-sm">
                    <div className="flex space-x-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-gray-400 rounded-full"
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{
                            duration: 1.5,
                            repeat: Number.POSITIVE_INFINITY,
                            delay: i * 0.2,
                            ease: "easeInOut",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />

            {/* Scroll to bottom button */}
            <AnimatePresence>
              {showScrollButton && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={scrollToBottom}
                  className="fixed bottom-24 right-8 w-10 h-10 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-full flex items-center justify-center text-gray-300 hover:text-white transition-colors shadow-lg"
                >
                  ↓
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-800/50 bg-black/80 backdrop-blur-sm">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={connectionStatus === "offline" ? "غير متصل بالإنترنت..." : "اكتب رسالتك هنا..."}
                  disabled={isLoading || connectionStatus === "offline"}
                  className="bg-gray-900/80 border-gray-700/50 text-white placeholder-gray-500 focus:border-gray-600 focus:ring-gray-600 pr-12 backdrop-blur-sm"
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
                className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 border border-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>

            {/* Quick suggestions */}
            {messages.length <= 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 flex flex-wrap gap-2"
              >
                {["ما هي خدماتكم؟", "كم التكلفة؟", "كيف يعمل الوكيل الذكي؟", "أريد عرض سعر"].map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => setInputValue(suggestion)}
                    className="text-xs bg-gray-900/50 border-gray-700/50 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-600 backdrop-blur-sm"
                  >
                    {suggestion}
                  </Button>
                ))}
              </motion.div>
            )}

            <div className="mt-2 text-xs text-gray-500 text-center">
              اضغط Enter للإرسال • Esc للإغلاق
              {deviceInfo.isMobile && " • اسحب لأعلى للتمرير"}
            </div>
          </div>
        </>
      )}
    </motion.div>
  )
}
