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
    intent?: string
    requiresHumanFollowup?: boolean
    suggestedActions?: string[]
    contextualSuggestions?: string[]
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
  const [conversationContext, setConversationContext] = useState<string[]>([])
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

  // Connection status monitoring with real-time updates
  useEffect(() => {
    const handleOnline = () => setConnectionStatus("online")
    const handleOffline = () => setConnectionStatus("offline")

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    setConnectionStatus(navigator.onLine ? "online" : "offline")

    // Test AI connection on mount
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

  // Initialize chat with welcome message and contextual suggestions
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

⚠️ **ملاحظة مهمة:** للحصول على معلومات دقيقة عن الأسعار والتفاصيل التقنية المحددة، يرجى التواصل معنا مباشرة على (+963940632191)

كيف يمكنني مساعدتك اليوم؟`,
        role: "assistant",
        timestamp: new Date(),
        status: "sent",
        metadata: {
          confidence: 1.0,
          sources: ["welcome"],
          requiresHumanFollowup: false,
          contextualSuggestions: [
            "ما هي خدماتكم؟",
            "كيف يعمل الوكيل الذكي؟",
            "أريد استشارة مخصصة",
            "ما هي أسعار خدماتكم؟",
          ],
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

  // Generate contextual suggestions based on conversation
  const generateContextualSuggestions = useCallback((lastMessage: string, conversationHistory: string[]): string[] => {
    const suggestions: string[] = []
    const lastMessageLower = lastMessage.toLowerCase()

    // Context-aware suggestions based on conversation flow
    if (lastMessageLower.includes("خدمات") || lastMessageLower.includes("services")) {
      suggestions.push("كيف يمكنني البدء؟", "ما هي التكلفة؟", "هل لديكم عروض تجريبية؟")
    } else if (lastMessageLower.includes("وكيل ذكي") || lastMessageLower.includes("ai agent")) {
      suggestions.push("كيف يتم التدريب؟", "ما هي المميزات؟", "هل يدعم اللغة العربية؟")
    } else if (
      lastMessageLower.includes("سعر") ||
      lastMessageLower.includes("تكلفة") ||
      lastMessageLower.includes("price")
    ) {
      suggestions.push("أريد عرض سعر مخصص", "ما هي طرق الدفع؟", "هل توجد خصومات؟")
    } else if (lastMessageLower.includes("تدريب") || lastMessageLower.includes("training")) {
      suggestions.push("كم يستغرق التدريب؟", "هل تقدمون الدعم؟", "ما هي المتطلبات؟")
    } else if (lastMessageLower.includes("دعم") || lastMessageLower.includes("support")) {
      suggestions.push("ما هي ساعات الدعم؟", "كيف أتواصل معكم؟", "هل الدعم مجاني؟")
    } else {
      // Default contextual suggestions
      suggestions.push("أخبرني المزيد", "كيف أبدأ؟", "أريد التحدث مع مختص")
    }

    // Avoid repetitive suggestions from conversation history
    const uniqueSuggestions = suggestions.filter(
      (suggestion) => !conversationHistory.some((msg) => msg.includes(suggestion)),
    )

    return uniqueSuggestions.slice(0, 3)
  }, [])

  // Handle suggested question click - direct sending
  const handleSuggestedQuestionClick = useCallback(
    async (question: string) => {
      if (isLoading) return

      // Add to conversation context to avoid repetition
      setConversationContext((prev) => [...prev, question])

      const userMessage: Message = {
        id: Date.now().toString(),
        content: question,
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

        // Prepare conversation history for AI with real-time context
        const conversationHistory = messages.map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        }))

        // Add current user message
        conversationHistory.push({
          role: "user",
          content: question,
        })

        // Generate AI response with real-time data integration
        const aiResponse = await groqAI.generateResponse(conversationHistory, {
          userId: user?.id,
          sessionId,
          deviceInfo,
          conversationContext,
          timestamp: new Date().toISOString(),
          realTimeData: {
            currentTime: new Date().toLocaleString("ar-SA"),
            userLocation: "Syria", // Can be enhanced with actual geolocation
            sessionDuration: Date.now() - Number.parseInt(sessionId.split("_")[1]),
          },
        })

        // Generate contextual suggestions for next interaction
        const contextualSuggestions = generateContextualSuggestions(aiResponse.content, conversationContext)

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
            contextualSuggestions,
          },
        }

        setMessages((prev) => [...prev, assistantMessage])

        // Log interaction to database if user is authenticated
        if (user && profile) {
          try {
            await supabase.from("agent_interactions").insert({
              user_id: user.id,
              session_id: sessionId,
              message_type: "suggested_question",
              user_message: question,
              ai_response: aiResponse.content,
              response_time: aiResponse.responseTime,
              confidence_score: aiResponse.confidence,
              metadata: {
                sources: aiResponse.sources,
                intent: "suggested_question",
                requiresHumanFollowup: aiResponse.requiresHumanFollowup,
                deviceInfo,
                contextualSuggestions,
              },
            })
          } catch (dbError) {
            console.error("Error logging interaction:", dbError)
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
        console.error("Error sending suggested question:", error)
        setError("حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.")

        // Update user message status to error
        setMessages((prev) => prev.map((msg) => (msg.id === userMessage.id ? { ...msg, status: "error" } : msg)))
      } finally {
        setIsLoading(false)
        setIsTyping(false)
      }
    },
    [
      isLoading,
      messages,
      user,
      profile,
      sessionId,
      deviceInfo,
      conversationContext,
      supabase,
      generateContextualSuggestions,
    ],
  )

  // Send message with enhanced AI processing and real-time data
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return

    const messageContent = inputValue.trim()
    setInputValue("")
    setError(null)

    // Check for repetitive questions
    const isRepetitive = conversationContext.some(
      (msg) =>
        msg.toLowerCase().includes(messageContent.toLowerCase()) ||
        messageContent.toLowerCase().includes(msg.toLowerCase()),
    )

    if (isRepetitive) {
      toast.warning("لقد سألت هذا السؤال من قبل. جرب سؤالاً مختلفاً أو اطلب توضيحاً إضافياً.")
      return
    }

    // Add to conversation context
    setConversationContext((prev) => [...prev, messageContent])

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

      // Prepare conversation history for AI with enhanced context
      const conversationHistory = messages.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }))

      // Add current user message
      conversationHistory.push({
        role: "user",
        content: messageContent,
      })

      // Generate AI response with real-time data integration
      const aiResponse = await groqAI.generateResponse(conversationHistory, {
        userId: user?.id,
        sessionId,
        deviceInfo,
        conversationContext,
        timestamp: new Date().toISOString(),
        realTimeData: {
          currentTime: new Date().toLocaleString("ar-SA"),
          userLocation: "Syria",
          sessionDuration: Date.now() - Number.parseInt(sessionId.split("_")[1]),
          messageCount: messages.length + 1,
        },
      })

      // Generate contextual suggestions based on AI response
      const contextualSuggestions = generateContextualSuggestions(aiResponse.content, conversationContext)

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
          contextualSuggestions,
        },
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Log interaction to database
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
              contextualSuggestions,
            },
          })
        } catch (dbError) {
          console.error("Error logging interaction:", dbError)
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
  }, [
    inputValue,
    isLoading,
    messages,
    user,
    profile,
    sessionId,
    deviceInfo,
    conversationContext,
    supabase,
    generateContextualSuggestions,
  ])

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
      setConversationContext([])
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
            contextualSuggestions: ["ما هي خدماتكم؟", "كيف يعمل الوكيل الذكي؟", "أريد استشارة مخصصة"],
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
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded text-black">$1</code>')
      .replace(/\n/g, "<br>")
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className={`fixed ${isRTL ? "left-4" : "right-4"} z-[9999] bg-white border-2 border-black rounded-2xl shadow-2xl ${
        isMinimized
          ? "w-80 h-16 bottom-4"
          : deviceInfo.isMobile
            ? "w-[95vw] h-[85vh] bottom-2"
            : "w-96 h-[600px] bottom-4"
      } transition-all duration-300 overflow-hidden`}
      style={{
        maxHeight: deviceInfo.isMobile ? "calc(100vh - 20px)" : "600px",
        top: deviceInfo.isMobile && !isMinimized ? "10px" : "auto",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b-2 border-black bg-black">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-black" />
            </div>
            <div
              className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border border-black ${
                connectionStatus === "online"
                  ? "bg-white"
                  : connectionStatus === "connecting"
                    ? "bg-gray-300"
                    : "bg-gray-500"
              }`}
            />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">مساعد رؤيا الذكي</h3>
            <div className="flex items-center gap-2 text-xs text-gray-300">
              {connectionStatus === "online" ? (
                <>
                  <Wifi className="w-3 h-3" />
                  متصل ومتاح
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
            className="text-white hover:text-gray-300 hover:bg-gray-800 rounded-full w-8 h-8 p-0"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onToggle}
            className="text-white hover:text-gray-300 hover:bg-gray-800 rounded-full w-8 h-8 p-0"
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
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-white"
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
                      <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 ${
                      message.role === "user" ? "bg-black text-white" : "bg-gray-50 text-black border-2 border-gray-200"
                    }`}
                  >
                    <div
                      className="text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) }}
                    />

                    {/* Message metadata */}
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

                    {/* Contextual suggestions - direct click to send */}
                    {message.metadata?.contextualSuggestions && message.metadata.contextualSuggestions.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <div className="text-xs text-gray-500 mb-2 font-medium">اقتراحات:</div>
                        <div className="flex flex-wrap gap-2">
                          {message.metadata.contextualSuggestions.map((suggestion, index) => (
                            <Button
                              key={index}
                              size="sm"
                              variant="outline"
                              className="text-xs border-2 border-black text-black hover:bg-black hover:text-white bg-white transition-all duration-200 rounded-full px-3 py-1 h-auto"
                              onClick={() => handleSuggestedQuestionClick(suggestion)}
                              disabled={isLoading}
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Suggested actions */}
                    {message.metadata?.suggestedActions && message.metadata.suggestedActions.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <div className="text-xs text-gray-500 mb-2 font-medium">إجراءات مقترحة:</div>
                        <div className="flex flex-wrap gap-2">
                          {message.metadata.suggestedActions.map((action, index) => (
                            <Button
                              key={index}
                              size="sm"
                              variant="outline"
                              className="text-xs border-2 border-black text-black hover:bg-black hover:text-white bg-white transition-all duration-200 rounded-full px-3 py-1 h-auto"
                              onClick={() => {
                                if (action.includes("التواصل") || action.includes("اتصال")) {
                                  window.open("tel:+963940632191")
                                } else {
                                  handleSuggestedQuestionClick(action)
                                }
                              }}
                            >
                              {action}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Message actions */}
                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-200">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopyMessage(message.content)}
                        className="text-xs text-gray-500 hover:text-black p-1 h-auto rounded-full"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      {message.status === "error" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRetryMessage(message.id)}
                          className="text-xs text-gray-600 hover:text-black p-1 h-auto rounded-full"
                        >
                          إعادة المحاولة
                        </Button>
                      )}
                    </div>
                  </div>
                  {message.role === "user" && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-black" />
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
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 border-2 border-gray-200">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
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
              className="absolute bottom-20 right-4 rounded-full w-10 h-10 p-0 bg-black hover:bg-gray-800 text-white shadow-lg border-2 border-white"
            >
              ↓
            </Button>
          )}

          {/* Error display */}
          {error && (
            <div className="px-4 py-3 bg-gray-100 border-t-2 border-gray-300">
              <div className="flex items-center gap-2 text-black text-sm">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t-2 border-black bg-white">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={connectionStatus === "online" ? "اكتب رسالتك..." : "غير متصل..."}
                  disabled={isLoading || connectionStatus !== "online"}
                  className="bg-white border-2 border-black text-black placeholder-gray-500 pr-12 pl-4 py-3 rounded-full focus:ring-2 focus:ring-black focus:border-black"
                  dir="rtl"
                />
                {messages.length > 1 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleClearConversation}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black p-1 h-auto rounded-full"
                    title="مسح المحادثة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading || connectionStatus !== "online"}
                className="bg-black hover:bg-gray-800 disabled:opacity-50 text-white border-2 border-black rounded-full w-12 h-12 p-0 flex items-center justify-center"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </div>
            <div className="text-xs text-gray-500 mt-3 text-center">
              للحصول على معلومات دقيقة عن الأسعار، اتصل بنا على (+963940632191)
            </div>
          </div>
        </>
      )}
    </motion.div>
  )
}
