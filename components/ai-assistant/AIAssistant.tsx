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
    intent?: string
    requiresHumanFollowup?: boolean
    suggestedActions?: string[]
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

  // Device detection
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

  // Initialize session
  useEffect(() => {
    if (isOpen && !sessionId) {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      setSessionId(newSessionId)
    }
  }, [isOpen, sessionId])

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
• شرح كيفية عمل حلولنا
• توجيهك للحصول على استشارة مخصصة
• الإجابة على أسئلتك العامة

💡 **جرب أن تسأل:**
• "ما هي خدماتكم؟"
• "كيف يعمل الوكيل الذكي؟"
• "أريد استشارة مخصصة"

⚠️ **ملاحظة مهمة:** للحصول على معلومات دقيقة عن الأسعار والتفاصيل التقنية المحددة، يرجى التواصل معنا مباشرة على (+963940632191)

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

  // Send message with enhanced AI processing
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

      // Generate AI response using enhanced Groq service
      const aiResponse = await groqAI.generateResponse(conversationHistory, {
        userId: user?.id,
        sessionId,
        deviceInfo,
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
          suggestedActions: aiResponse.suggestedActions,
        },
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Log interaction to database if user is authenticated
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
              intent: "general_inquiry",
              requiresHumanFollowup: aiResponse.requiresHumanFollowup,
              deviceInfo,
            },
          })
        } catch (dbError) {
          console.error("Error logging interaction:", dbError)
          // Don't show error to user for logging failures
        }
      }

      // Show notification if human followup is recommended
      if (aiResponse.requiresHumanFollowup) {
        toast.info("يُنصح بالتواصل المباشر للحصول على معلومات أكثر دقة", {
          action: {
            label: "اتصل الآن",
            onClick: () => window.open("tel:+963940632191"),
          },
        })
      }
    } catch (error) {
      console.error("Error sending message:", error)
      setError("حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.")

      // Update user message status to error
      setMessages((prev) => prev.map((msg) => (msg.id === userMessage.id ? { ...msg, status: "error" } : msg)))

      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `عذراً، حدث خطأ في الاتصال. 

للحصول على المساعدة الفورية، اتصل بنا على (+963940632191)
💬 واتساب: (+963940632191)

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

  // Handle keyboard shortcuts
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSendMessage()
      }
    },
    [handleSendMessage],
  )

  // Clear conversation
  const handleClearConversation = useCallback(() => {
    if (confirm("هل أنت متأكد من حذف المحادثة؟")) {
      setMessages([])
      setError(null)
      // Re-add welcome message
      setTimeout(() => {
        const welcomeMessage: Message = {
          id: Date.now().toString(),
          content: `مرحباً مجدداً! 👋 كيف يمكنني مساعدتك؟`,
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

  // Copy message content
  const handleCopyMessage = useCallback((content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      toast.success("تم نسخ الرسالة")
    })
  }, [])

  // Retry failed message
  const handleRetryMessage = useCallback(
    (messageId: string) => {
      const message = messages.find((msg) => msg.id === messageId)
      if (message && message.role === "user") {
        setInputValue(message.content)
        // Remove the failed message and any subsequent messages
        const messageIndex = messages.findIndex((msg) => msg.id === messageId)
        setMessages((prev) => prev.slice(0, messageIndex))
      }
    },
    [messages],
  )

  // Format message content with better rendering
  const formatMessageContent = (content: string) => {
    // Convert markdown-like formatting to HTML
    return content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`(.*?)`/g, '<code class="bg-gray-200 px-1 rounded">$1</code>')
      .replace(/\n/g, "<br>")
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className={`fixed ${isRTL ? "left-4" : "right-4"} z-[9999] bg-gray-900 border border-gray-700 rounded-lg shadow-2xl ${
        isMinimized
          ? "w-80 h-16 bottom-4"
          : deviceInfo.isMobile
            ? "w-[95vw] h-[85vh] bottom-2"
            : "w-96 h-[600px] bottom-4"
      } transition-all duration-300 overflow-hidden`}
      style={{
        maxHeight: deviceInfo.isMobile ? "calc(100vh - 20px)" : "600px",
        top: deviceInfo.isMobile && !isMinimized ? "10px" : "auto",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bot className="w-6 h-6 text-gray-300" />
            <div
              className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                connectionStatus === "online"
                  ? "bg-green-400"
                  : connectionStatus === "connecting"
                    ? "bg-yellow-400"
                    : "bg-red-400"
              }`}
            />
          </div>
          <div>
            <h3 className="text-white font-semibold">مساعد رؤيا الذكي</h3>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              {connectionStatus === "online" ? (
                <>
                  <Wifi className="w-3 h-3" />
                  متصل
                </>
              ) : connectionStatus === "connecting" ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  جاري الاتصال...
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3" />
                  غير متصل
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-gray-400 hover:text-white hover:bg-gray-700"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onToggle}
            className="text-gray-400 hover:text-white hover:bg-gray-700"
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
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900"
            style={{ height: deviceInfo.isMobile ? "calc(85vh - 140px)" : "calc(600px - 140px)" }}
          >
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-gray-700 text-white"
                        : "bg-gray-800 text-gray-100 border border-gray-700"
                    }`}
                  >
                    <div
                      className="text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) }}
                    />

                    {/* Message metadata - simplified without percentages */}
                    <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                      <div className="flex items-center gap-2">
                        {message.status === "sending" && <Loader2 className="w-3 h-3 animate-spin" />}
                        {message.status === "error" && <AlertTriangle className="w-3 h-3 text-red-400" />}
                        {message.status === "sent" && message.role === "assistant" && (
                          <CheckCircle className="w-3 h-3 text-green-400" />
                        )}
                        <span>
                          {message.timestamp.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>

                    {/* Suggested actions */}
                    {message.metadata?.suggestedActions && message.metadata.suggestedActions.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <div className="text-xs text-gray-400 mb-2">إجراءات مقترحة:</div>
                        {message.metadata.suggestedActions.map((action, index) => (
                          <Button
                            key={index}
                            size="sm"
                            variant="outline"
                            className="text-xs mr-1 mb-1 border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                            onClick={() => {
                              if (action.includes("التواصل") || action.includes("اتصال")) {
                                window.open("tel:+963940632191")
                              } else {
                                setInputValue(action)
                              }
                            }}
                          >
                            {action}
                          </Button>
                        ))}
                      </div>
                    )}

                    {/* Message actions */}
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopyMessage(message.content)}
                        className="text-xs text-gray-400 hover:text-white p-1 h-auto"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      {message.status === "error" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRetryMessage(message.id)}
                          className="text-xs text-red-400 hover:text-red-300 p-1 h-auto"
                        >
                          إعادة المحاولة
                        </Button>
                      )}
                    </div>
                  </div>
                  {message.role === "user" && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 justify-start"
              >
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                  <div className="flex space-x-1">
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
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Scroll to bottom button */}
          {showScrollButton && (
            <Button
              size="sm"
              onClick={scrollToBottom}
              className="absolute bottom-20 right-4 rounded-full w-8 h-8 p-0 bg-gray-600 hover:bg-gray-700"
            >
              ↓
            </Button>
          )}

          {/* Error display */}
          {error && (
            <div className="px-4 py-2 bg-red-900/50 border-t border-red-700">
              <div className="flex items-center gap-2 text-red-300 text-sm">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-700 bg-gray-800">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={connectionStatus === "online" ? "اكتب رسالتك..." : "غير متصل..."}
                  disabled={isLoading || connectionStatus !== "online"}
                  className="bg-gray-900 border-gray-600 text-white placeholder-gray-400 pr-10"
                  dir="rtl"
                />
                {messages.length > 1 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleClearConversation}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white p-1 h-auto"
                    title="مسح المحادثة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading || connectionStatus !== "online"}
                className="bg-gray-600 hover:bg-gray-700 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
            <div className="text-xs text-gray-500 mt-2 text-center">
              للحصول على معلومات دقيقة عن الأسعار، اتصل بنا على (+963940632191)
            </div>
          </div>
        </>
      )}
    </motion.div>
  )
}
