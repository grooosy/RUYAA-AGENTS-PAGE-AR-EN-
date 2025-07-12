"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { useLanguage } from "@/contexts/LanguageContext"
import { createClient } from "@/lib/supabase/client"
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
  const [showKnowledgeManager, setShowKnowledgeManager] = useState(false)
  const [sessionId, setSessionId] = useState<string>("")
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

⚠️ **ملاحظة مهمة:** للحصول على معلومات دقيقة عن الأسعار والتفاصيل التقنية المحددة، يرجى التواصل معنا مباشرة على +963940632191

كيف يمكنني مساعدتك اليوم؟`,
        role: "assistant",
        timestamp: new Date(),
        status: "sent",
        metadata: {
          confidence: 1.0,
          sources: ["welcome"],
          requiresHumanFollowup: false
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
        deviceInfo
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
          suggestedActions: aiResponse.suggestedActions
        },
      }

      setMessages((prev) => [...prev, assistantMessage])
