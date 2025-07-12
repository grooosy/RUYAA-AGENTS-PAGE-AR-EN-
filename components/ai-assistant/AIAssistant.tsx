"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Wifi, WifiOff, Loader2, MessageCircle, Database, Activity, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth/auth-context"
import { useLanguage } from "@/contexts/LanguageContext"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { groqAI } from "@/lib/ai/groq-service"
import { knowledgeManager } from "@/lib/ai/knowledge-manager"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  status?: "sending" | "sent" | "error"
  language?: "ar" | "en"
  metadata?: {
    responseTime?: number
    confidence?: number
    sources?: string[]
    requiresHumanFollowup?: boolean
    contextUnderstanding?: number
    detectedLanguage?: "ar" | "en"
  }
}

interface AIAssistantProps {
  isOpen: boolean
  onToggle: () => void
}

interface APIStatus {
  status: "online" | "offline" | "degraded"
  responseTime: number
  lastChecked: Date
}

export default function AIAssistant({ isOpen, onToggle }: AIAssistantProps) {
  const { user, profile } = useAuth()
  const { t, isRTL } = useLanguage()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [apiStatus, setApiStatus] = useState<APIStatus>({
    status: "online",
    responseTime: 0,
    lastChecked: new Date(),
  })
  const [error, setError] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [sessionId, setSessionId] = useState<string>("")
  const [isKnowledgeManagerOpen, setIsKnowledgeManagerOpen] = useState(false)
  const [conversationLanguage, setConversationLanguage] = useState<"ar" | "en">("ar")
  const [knowledgeItems, setKnowledgeItems] = useState<any[]>([])
  const [isInitializing, setIsInitializing] = useState(false)
  const [conversationContext, setConversationContext] = useState({
    previousTopics: [] as string[],
    userPreferences: {},
    sessionDuration: 0,
    messageCount: 0,
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const sessionStartTime = useRef<number>(Date.now())

  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    screenWidth: 0,
    screenHeight: 0,
    touchSupported: false,
  })

  // Language detection function
  const detectLanguage = useCallback((text: string): "ar" | "en" => {
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
  }, [])

  // Device detection
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

  // API Status monitoring
  useEffect(() => {
    const checkAPIStatus = async () => {
      try {
        const status = await groqAI.getAPIStatus()
        setApiStatus(status)
      } catch (error) {
        console.error("Failed to check API status:", error)
        setApiStatus({
          status: "offline",
          responseTime: 0,
          lastChecked: new Date(),
        })
      }
    }

    if (isOpen) {
      checkAPIStatus()
      const interval = setInterval(checkAPIStatus, 30000) // Check every 30 seconds
      return () => clearInterval(interval)
    }
  }, [isOpen])

  // Initialize knowledge base
  const initializeKnowledgeBase = useCallback(async () => {
    setIsInitializing(true)
    try {
      console.log("Initializing knowledge base...")
      const success = await knowledgeManager.initializeKnowledgeBase()
      if (success) {
        console.log("Knowledge base initialized successfully")
        toast.success("Knowledge base initialized")
      } else {
        console.log("Knowledge base initialization skipped or failed")
      }
    } catch (error) {
      console.error("Failed to initialize knowledge base:", error)
      toast.error("Failed to initialize knowledge base")
    } finally {
      setIsInitializing(false)
    }
  }, [])

  // Load knowledge base
  useEffect(() => {
    const loadKnowledgeBase = async () => {
      try {
        console.log("Loading knowledge base...")
        const items = await knowledgeManager.getKnowledgeItems({
          verified: true,
          limit: 50,
        })
        console.log(`Loaded ${items.length} knowledge items`)
        setKnowledgeItems(items)
        
        // If no items found, try to initialize
        if (items.length === 0) {
          console.log("No knowledge items found, attempting to initialize...")
          await initializeKnowledgeBase()
          
          // Try loading again after initialization
          const newItems = await knowledgeManager.getKnowledgeItems({
            verified: true,
            limit: 50,
          })
          setKnowledgeItems(newItems)
        }
      } catch (error) {
        console.error("Failed to load knowledge base:", error)
        setKnowledgeItems([])
      }
    }

    if (isOpen) {
      loadKnowledgeBase()
    }
  }, [isOpen, initializeKnowledgeBase])

  // Session management
  useEffect(() => {
    if (isOpen && !sessionId) {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      setSessionId(newSessionId)
      sessionStartTime.current = Date.now()
    }
  }, [isOpen, sessionId])

  // Update conversation context
  useEffect(() => {
    setConversationContext((prev) => ({
      ...prev,
      sessionDuration: Date.now() - sessionStartTime.current,
      messageCount: messages.length,
    }))
  }, [messages.length])

  // Scroll management
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

  // Welcome message
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
        status: "sent",
        language: conversationLanguage,
        metadata: {
          confidence: 1.0,
          sources: ["welcome"],
          requiresHumanFollowup: false,
          contextUnderstanding: 1.0,
          detectedLanguage: conversationLanguage,
        },
      }

      setMessages([welcomeMessage])
    }
  }, [isOpen, conversationLanguage])

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Focus input when opened
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
    const detectedLang = detectLanguage(messageContent)

    // Update conversation language if it changes
    if (detectedLang !== conversationLanguage) {
      setConversationLanguage(detectedLang)
    }

    setInputValue("")
    setError(null)

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageContent,
      role: "user",
      timestamp: new Date(),
      status: "sending",
      language: detectedLang,
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)
    setIsTyping(true)

    try {
      // Update message status to sent
      setMessages((prev) => prev.map((msg) => (msg.id === userMessage.id ? { ...msg, status: "sent" } : msg)))

      // Prepare conversation history
      const conversationHistory = [...messages, userMessage].map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
        timestamp: msg.timestamp,
        language: msg.language,
      }))

      // Filter knowledge base by detected language
      const relevantKnowledge = knowledgeItems.filter((item) => item.language === detectedLang && item.isVerified)

      console.log(`Making real-time API call for ${detectedLang} message with ${relevantKnowledge.length} knowledge items...`)

      // Make real-time API call
      const aiResponse = await groqAI.generateResponse(conversationHistory, relevantKnowledge, {
        userId: user?.id,
        sessionId,
        deviceInfo,
        timestamp: new Date().toISOString(),
        conversationContext: {
          ...conversationContext,
          previousTopics: conversationContext.previousTopics,
          userPreferences: {},
          sessionDuration: Date.now() - sessionStartTime.current,
          messageCount: messages.length + 1,
        },
      })

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse.content,
        role: "assistant",
        timestamp: new Date(),
        status: "sent",
        language: aiResponse.detectedLanguage,
        metadata: {
          responseTime: aiResponse.responseTime,
          confidence: aiResponse.confidence,
          sources: aiResponse.sources,
          requiresHumanFollowup: aiResponse.requiresHumanFollowup,
          contextUnderstanding: aiResponse.contextUnderstanding,
          detectedLanguage: aiResponse.detectedLanguage,
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
              requiresHumanFollowup: aiResponse.requiresHumanFollowup,
              contextUnderstanding: aiResponse.contextUnderstanding,
              detectedLanguage: aiResponse.detectedLanguage,
              deviceInfo,
            },
          })
        } catch (dbError) {
          console.error("Error logging interaction:", dbError)
        }
      }

      // Show notification if human followup is needed
      if (aiResponse.requiresHumanFollowup) {
        toast.info(
          detectedLang === "ar"
            ? "للحصول على معلومات أكثر دقة، يُنصح بالتواصل المباشر"
            : "For more accurate information, direct contact is recommended",
        )
      }
    } catch (error) {
      console.error("Error in real-time API call:", error)
      setError(
        detectedLang === "ar"
          ? "حدث خطأ في الاتصال بالخدمة. يرجى المحاولة مرة أخرى."
          : "Connection error occurred. Please try again.",
      )

      // Update user message status to error
      setMessages((prev) => prev.map((msg) => (msg.id === userMessage.id ? { ...msg, status: "error" } : msg)))

      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          detectedLang === "ar"
            ? `عذراً، حدث خطأ في الاتصال مع الخدمة.

يمكنك:
• المحاولة مرة أخرى
• تحديث قاعدة المعرفة إذا كانت المعلومات غير دقيقة
• التواصل المباشر للحصول على المساعدة`
            : `Sorry, a connection error occurred with the service.

You can:
• Try again
• Update the knowledge base if information is inaccurate  
• Contact directly for assistance`,
        role: "assistant",
        timestamp: new Date(),
        status: "sent",
        language: detectedLang,
        metadata: {
          confidence: 1.0,
          sources: ["error_fallback"],
          requiresHumanFollowup: true,
          contextUnderstanding: 0.5,
          detectedLanguage: detectedLang,
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
    supabase,
    detectLanguage,
    conversationLanguage,
    knowledgeItems,
    conversationContext,
  ])

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
    const confirmText =
      conversationLanguage === "ar"
        ? "هل أنت متأكد من حذف المحادثة؟"
        : "Are you sure you want to clear the conversation?"

    if (confirm(confirmText)) {
      setMessages([])
      setError(null)
      setConversationContext({
        previousTopics: [],
        userPreferences: {},
        sessionDuration: 0,
        messageCount: 0,
      })
      sessionStartTime.current = Date.now()

      setTimeout(() => {
        const welcomeMessage: Message = {
          id: Date.now().toString(),
          content:
            conversationLanguage === "ar" ? "مرحباً مجدداً! كيف يمكنني مساعدتك؟" : "Hello again! How can I help you?",
          role: "assistant",
          timestamp: new Date(),
          status: "sent",
          language: conversationLanguage,
          metadata: {
            confidence: 1.0,
            sources: ["welcome"],
            contextUnderstanding: 1.0,
            detectedLanguage: conversationLanguage,
          },
        }
        setMessages([welcomeMessage])
      }, 100)
    }
  }, [conversationLanguage])

  const handleCopyMessage = useCallback(
    (content: string) => {
      navigator.clipboard.writeText(content).then(() => {
        toast.success(conversationLanguage === "ar" ? "تم نسخ الرسالة" : "Message copied")
      })
    },
    [conversationLanguage],
  )

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

  const getStatusText = () => {
    if (conversationLanguage === "ar") {
      switch (apiStatus.status) {
        case "online":
          return "متصل ومتاح"
        case "offline":
          return "غير متصل"
        case "degraded":
          return "اتصال بطيء"
        default:
          return "غير معروف"
      }
    } else {
      switch (apiStatus.status) {
        case "online":
          return "Online & Available"
        case "offline":
          return "Offline"
        case "degraded":
          return "Slow Connection"
        default:
          return "Unknown"
      }
    }
  }

  const getStatusColor = () => {
    switch (apiStatus.status) {
      case "online":
        return "bg-green-500"
      case "offline":
        return "bg-red-500"
      case "degraded":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  if (!isOpen) return null

  return (
    <>
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
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800 bg-black min-h-[72px]">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-black" />
              </div>
              <div
                className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-black ${getStatusColor()}`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-lg leading-tight">
                {conversationLanguage === "ar" ? "مساعد رؤيا الذكي" : "Ruyaa AI Assistant"}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-300 mt-1">
                {apiStatus.status === "online" ? (
                  <Wifi className="w-4 h-4 flex-shrink-0" />
                ) : apiStatus.status === "degraded" ? (
                  <Activity className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <WifiOff className="w-4 h-4 flex-shrink-0" />
                )}
                <span className="whitespace-nowrap">{getStatusText()}</span>
                <Badge variant="outline" className="text-xs">
                  {conversationLanguage === "ar" ? "ع" : "EN"}
                </Badge>
                {knowledgeItems.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {knowledgeItems.length} KB
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {knowledgeItems.length === 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={initializeKnowledgeBase}
                disabled={isInitializing}
                className="text-white hover:text-gray-300 hover:bg-gray-800 rounded-full w-10 h-10 p-0"
                title={conversationLanguage === "ar" ? "تهيئة قاعدة المعرفة" : "Initialize Knowledge Base"}
              >
                {isInitializing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsKnowledgeManagerOpen(true)}
              className="text-white hover:text-gray-300 hover:bg-gray-800 rounded-full w-10 h-10 p-0"
              title={conversationLanguage === "ar" ? "إدارة قاعدة المعرفة" : "Manage Knowledge Base"}
            >
              <Database className="w-5 h-5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:text-gray-300 hover:bg-gray-800 rounded-full w-10 h-10 p-0"
            >
              {isMinim
