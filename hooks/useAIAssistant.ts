"use client"

import { useState, useCallback, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/auth/auth-context"
import { toast } from "sonner"

interface AIMessage {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  status?: "sending" | "sent" | "error"
  metadata?: {
    responseTime?: number
    confidence?: number
    sources?: string[]
    personalized?: boolean
  }
}

interface UserPreferences {
  language_preference: string
  response_style: string
  preferred_services: string[]
  interests: string[]
  business_type?: string
  industry?: string
  company_size?: string
}

interface ConversationSession {
  sessionToken: string
  startTime: Date
  messageCount: number
}

export function useAIAssistant() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null)
  const [currentSession, setCurrentSession] = useState<ConversationSession | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"online" | "offline">("online")

  const supabase = createClient()

  // Monitor connection status
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

  // Load user preferences
  const loadUserPreferences = useCallback(async () => {
    if (!user) return

    try {
      const { data, error } = await supabase.rpc("get_user_preferences", { p_user_id: user.id })

      if (error) {
        console.error("Error loading user preferences:", error)
        return
      }

      if (data && data.length > 0) {
        setUserPreferences(data[0])
      }
    } catch (error) {
      console.error("Error loading user preferences:", error)
    }
  }, [user, supabase])

  // Start a new conversation session
  const startSession = useCallback(async () => {
    if (!user) return null

    try {
      const { data, error } = await supabase.rpc("start_conversation_session", {
        p_user_id: user.id,
        p_agent_type: "ai_assistant_advanced",
        p_session_metadata: {
          browser: navigator.userAgent,
          timestamp: new Date().toISOString(),
          language: navigator.language,
        },
      })

      if (error) {
        console.error("Error starting session:", error)
        return null
      }

      const session: ConversationSession = {
        sessionToken: data,
        startTime: new Date(),
        messageCount: 0,
      }

      setCurrentSession(session)
      return session
    } catch (error) {
      console.error("Error starting session:", error)
      return null
    }
  }, [user, supabase])

  // End conversation session
  const endSession = useCallback(
    async (satisfaction?: number) => {
      if (!currentSession) return

      try {
        await supabase.rpc("end_conversation_session", {
          p_session_token: currentSession.sessionToken,
          p_user_satisfaction: satisfaction,
        })

        setCurrentSession(null)
      } catch (error) {
        console.error("Error ending session:", error)
      }
    },
    [currentSession, supabase],
  )

  // Log interaction to Supabase
  const logInteraction = useCallback(
    async (messageContent: string, responseContent: string, metadata: any = {}) => {
      if (!user || !currentSession || connectionStatus === "offline") return

      try {
        await supabase.rpc("log_ai_interaction", {
          p_user_id: user.id,
          p_agent_type: "ai_assistant_advanced",
          p_interaction_type: "chat",
          p_session_id: currentSession.sessionToken,
          p_message_content: messageContent,
          p_response_content: responseContent,
          p_metadata: {
            ...metadata,
            timestamp: new Date().toISOString(),
            session_duration: Date.now() - currentSession.startTime.getTime(),
          },
          p_response_time_ms: metadata.responseTime,
          p_confidence_score: metadata.confidence,
        })
      } catch (error) {
        console.warn("Failed to log interaction:", error)
      }
    },
    [user, currentSession, connectionStatus, supabase],
  )

  // Update user preferences
  const updatePreferences = useCallback(
    async (preferences: Partial<UserPreferences>) => {
      if (!user) return false

      try {
        const { error } = await supabase.rpc("update_user_preferences", {
          p_user_id: user.id,
          p_language_preference: preferences.language_preference,
          p_response_style: preferences.response_style,
          p_preferred_services: preferences.preferred_services,
          p_interests: preferences.interests,
          p_business_type: preferences.business_type,
          p_industry: preferences.industry,
          p_company_size: preferences.company_size,
        })

        if (error) {
          console.error("Error updating preferences:", error)
          return false
        }

        setUserPreferences((prev) => (prev ? { ...prev, ...preferences } : null))
        return true
      } catch (error) {
        console.error("Error updating preferences:", error)
        return false
      }
    },
    [user, supabase],
  )

  // Search knowledge base
  const searchKnowledge = useCallback(
    async (query: string, category?: string, language = "arabic") => {
      try {
        const { data, error } = await supabase.rpc("search_knowledge_base", {
          p_query: query,
          p_category: category,
          p_language: language,
          p_limit: 5,
        })

        if (error) {
          console.error("Error searching knowledge base:", error)
          return []
        }

        return data || []
      } catch (error) {
        console.error("Error searching knowledge base:", error)
        return []
      }
    },
    [supabase],
  )

  // Send message with comprehensive error handling
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return

      setError(null)
      setIsLoading(true)

      // Ensure we have a session
      let session = currentSession
      if (!session) {
        session = await startSession()
        if (!session) {
          setError("فشل في بدء الجلسة")
          setIsLoading(false)
          return
        }
      }

      const userMessage: AIMessage = {
        id: Date.now().toString(),
        content: content.trim(),
        role: "user",
        timestamp: new Date(),
        status: "sending",
      }

      setMessages((prev) => [...prev, userMessage])

      try {
        // Update message status to sent
        setMessages((prev) => prev.map((msg) => (msg.id === userMessage.id ? { ...msg, status: "sent" } : msg)))

        // Simulate AI processing with realistic delay
        const processingDelay = Math.min(content.length * 50 + Math.random() * 1000 + 1000, 4000)
        const startTime = Date.now()

        // Generate AI response (this would be replaced with actual LLM API call)
        setTimeout(async () => {
          try {
            const responseTime = Date.now() - startTime

            // Search knowledge base for relevant information
            const knowledgeResults = await searchKnowledge(content)

            // Generate response based on knowledge base and user preferences
            const aiResponse = generateAIResponse(content, userPreferences, knowledgeResults)

            const assistantMessage: AIMessage = {
              id: (Date.now() + 1).toString(),
              content: aiResponse.content,
              role: "assistant",
              timestamp: new Date(),
              status: "sent",
              metadata: {
                responseTime,
                confidence: aiResponse.confidence,
                sources: aiResponse.sources,
                personalized: aiResponse.personalized,
              },
            }

            setMessages((prev) => [...prev, assistantMessage])

            // Log interaction
            await logInteraction(content, aiResponse.content, {
              responseTime,
              confidence: aiResponse.confidence,
              sources: aiResponse.sources,
              knowledgeResults: knowledgeResults.length,
            })

            // Update session message count
            if (currentSession) {
              setCurrentSession((prev) =>
                prev
                  ? {
                      ...prev,
                      messageCount: prev.messageCount + 1,
                    }
                  : null,
              )
            }
          } catch (responseError) {
            console.error("Error generating response:", responseError)

            const errorMessage: AIMessage = {
              id: (Date.now() + 1).toString(),
              content:
                "عذراً، حدث خطأ في معالجة رسالتك. يرجى المحاولة مرة أخرى أو التواصل معنا مباشرة على +963940632191",
              role: "assistant",
              timestamp: new Date(),
              status: "error",
            }

            setMessages((prev) => [...prev, errorMessage])
            setError("فشل في توليد الرد")
          } finally {
            setIsLoading(false)
          }
        }, processingDelay)
      } catch (error) {
        console.error("Error sending message:", error)
        setIsLoading(false)
        setError("فشل في إرسال الرسالة")

        setMessages((prev) => prev.map((msg) => (msg.id === userMessage.id ? { ...msg, status: "error" } : msg)))

        toast.error("فشل في إرسال الرسالة. يرجى المحاولة مرة أخرى.")
      }
    },
    [isLoading, currentSession, startSession, logInteraction, userPreferences, searchKnowledge],
  )

  // Generate AI response (simplified version - would use actual LLM in production)
  const generateAIResponse = (userMessage: string, preferences: UserPreferences | null, knowledgeResults: any[]) => {
    const message = userMessage.toLowerCase()
    let confidence = 0.8
    let sources: string[] = []
    let personalized = false

    // Use knowledge base results if available
    if (knowledgeResults.length > 0) {
      confidence = Math.max(confidence, knowledgeResults[0].relevance_score)
      sources = knowledgeResults.map((r) => r.category)
    }

    // Personalize based on user preferences
    if (preferences) {
      personalized = true
      if (preferences.response_style === "brief") {
        // Generate shorter response
      }
    }

    // Generate response based on message content
    let content = "شكراً لسؤالك! أنا مساعد ذكي متطور من رؤيا كابيتال."

    if (message.includes("خدمات") || message.includes("services")) {
      content = `🤖 **خدمات الوكلاء الذكيين من رؤيا كابيتال**

نحن نقدم مجموعة شاملة من الوكلاء الذكيين المتطورين:

**1️⃣ وكيل الدعم الذكي** 🎧
نظام دعم عملاء ذكي يعمل على مدار الساعة مع قدرات متقدمة في فهم اللغة الطبيعية.

**2️⃣ وكيل أتمتة المبيعات** 📈
نظام ذكي لأتمتة عمليات المبيعات من البداية للنهاية مع تحليلات متقدمة.

**3️⃣ وكيل إدارة وسائل التواصل** 📱
منصة شاملة لإدارة وسائل التواصل الاجتماعي مع ذكاء اصطناعي.

**4️⃣ الوكيل المتخصص** 🎯
وكيل ذكي مخصص بالكامل لاحتياجات عملك المحددة.

أي من هذه الخدمات تود معرفة تفاصيل أكثر عنها؟`
      confidence = 0.95
      sources = ["services_catalog"]
    }

    return {
      content,
      confidence,
      sources,
      personalized,
    }
  }

  // Clear conversation
  const clearConversation = useCallback(() => {
    setMessages([])
    setError(null)
    if (currentSession) {
      endSession()
    }
  }, [currentSession, endSession])

  // Retry failed message
  const retryMessage = useCallback(
    (messageId: string) => {
      const message = messages.find((m) => m.id === messageId)
      if (message && message.role === "user") {
        setMessages((prev) => prev.filter((m) => m.id !== messageId))
        sendMessage(message.content)
      }
    },
    [messages, sendMessage],
  )

  // Initialize
  useEffect(() => {
    if (user) {
      loadUserPreferences()
    }
  }, [user, loadUserPreferences])

  return {
    messages,
    isLoading,
    error,
    connectionStatus,
    userPreferences,
    currentSession,
    sendMessage,
    clearConversation,
    retryMessage,
    updatePreferences,
    searchKnowledge,
    startSession,
    endSession,
  }
}
