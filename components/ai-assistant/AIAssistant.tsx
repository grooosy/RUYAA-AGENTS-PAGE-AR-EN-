"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Send, Minimize2, Bot, Phone, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/LanguageContext"
import { groqService } from "@/lib/ai/groq-service"
import { knowledgeManager } from "@/lib/ai/knowledge-manager"
import KnowledgeManager from "./KnowledgeManager"

interface Message {
  id: string
  content: string
  sender: "user" | "assistant"
  timestamp: Date
  metadata?: {
    confidence?: number
    sources?: string[]
    intent?: string
  }
}

interface AIAssistantProps {
  isOpen: boolean
  onClose: () => void
  onMinimize: () => void
}

export default function AIAssistant({ isOpen, onClose, onMinimize }: AIAssistantProps) {
  const { language, translations } = useLanguage()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "testing">("testing")
  const [isKnowledgeManagerOpen, setIsKnowledgeManagerOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen) {
      testAIConnection()
      if (messages.length === 0) {
        addWelcomeMessage()
      }
    }
  }, [isOpen])

  const testAIConnection = async () => {
    setConnectionStatus("testing")
    try {
      const isConnected = await groqService.testConnection()
      setConnectionStatus(isConnected ? "connected" : "disconnected")
    } catch (error) {
      console.error("Connection test failed:", error)
      setConnectionStatus("disconnected")
    }
  }

  const addWelcomeMessage = () => {
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      content:
        language === "ar"
          ? "مرحباً! أنا مساعد رؤيا كابيتال الذكي. كيف يمكنني مساعدتك اليوم؟"
          : "Hello! I'm Ruyaa Capital's AI assistant. How can I help you today?",
      sender: "assistant",
      timestamp: new Date(),
    }
    setMessages([welcomeMessage])
  }

  const searchKnowledge = async (query: string) => {
    try {
      const results = await knowledgeManager.searchKnowledge(query, {
        language: language,
        verified: true,
        limit: 3,
      })
      return results
    } catch (error) {
      console.error("Knowledge search failed:", error)
      return []
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      // Search knowledge base first
      const knowledgeResults = await searchKnowledge(inputValue.trim())

      let response = ""
      if (connectionStatus === "connected") {
        response = await groqService.generateResponse(inputValue.trim(), knowledgeResults)
      } else {
        // Fallback response when AI is not available
        if (language === "ar") {
          response = "عذراً، المساعد الذكي غير متاح حالياً. يمكنك التواصل معنا مباشرة على الهاتف أو البريد الإلكتروني."
        } else {
          response = "Sorry, the AI assistant is currently unavailable. You can contact us directly via phone or email."
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: "assistant",
        timestamp: new Date(),
        metadata: {
          sources: knowledgeResults.map((r) => r.title),
        },
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error generating response:", error)

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          language === "ar"
            ? "عذراً، حدث خطأ. يرجى المحاولة مرة أخرى أو التواصل معنا مباشرة."
            : "Sorry, an error occurred. Please try again or contact us directly.",
        sender: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
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

  const getStatusText = () => {
    if (language === "ar") {
      switch (connectionStatus) {
        case "connected":
          return "متصل ومتاح"
        case "disconnected":
          return "غير متصل"
        case "testing":
          return "جاري الاتصال..."
        default:
          return "غير معروف"
      }
    } else {
      switch (connectionStatus) {
        case "connected":
          return "Online & Available"
        case "disconnected":
          return "Offline"
        case "testing":
          return "Connecting..."
        default:
          return "Unknown"
      }
    }
  }

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "bg-green-500"
      case "disconnected":
        return "bg-red-500"
      case "testing":
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
        className="fixed bottom-24 right-6 w-96 h-[600px] bg-black border-2 border-white rounded-3xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden z-50"
      >
        {/* Header */}
        <div className="bg-black border-b-2 border-white px-4 py-4 min-h-[72px] flex items-center gap-3">
          <div className="relative">
            <Avatar className="w-12 h-12 border-2 border-white">
              <AvatarImage src="/images/ruyaa-ai-logo.png" alt="Ruyaa AI" />
              <AvatarFallback className="bg-white text-black font-bold">AI</AvatarFallback>
            </Avatar>
            <div
              className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor()} rounded-full border-2 border-black`}
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-lg leading-tight">
              {language === "ar" ? "مساعد رؤيا الذكي" : "Ruyaa AI Assistant"}
            </h3>
            <p className="text-white/80 text-sm mt-1 whitespace-nowrap">{getStatusText()}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsKnowledgeManagerOpen(true)}
              className="w-10 h-10 p-0 text-white hover:bg-white/10 rounded-full"
              title={language === "ar" ? "إدارة قاعدة المعرفة" : "Manage Knowledge Base"}
            >
              <Bot className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onMinimize}
              className="w-10 h-10 p-0 text-white hover:bg-white/10 rounded-full"
            >
              <Minimize2 className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="w-10 h-10 p-0 text-white hover:bg-white/10 rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.sender === "user" ? "bg-black text-white" : "bg-gray-100 text-black border-2 border-black"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  {message.metadata?.sources && message.metadata.sources.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {message.metadata.sources.map((source, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {source}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-gray-100 border-2 border-black rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  </div>
                  <span className="text-xs text-gray-600">{language === "ar" ? "جاري الكتابة..." : "Typing..."}</span>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="px-4 py-2 bg-white border-t border-gray-200">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs border-black text-black hover:bg-black hover:text-white bg-transparent"
              onClick={() => setInputValue(language === "ar" ? "ما هي خدماتكم؟" : "What are your services?")}
            >
              <Bot className="w-3 h-3 mr-1" />
              {language === "ar" ? "الخدمات" : "Services"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs border-black text-black hover:bg-black hover:text-white bg-transparent"
              onClick={() => setInputValue(language === "ar" ? "كيف يمكنني التواصل معكم؟" : "How can I contact you?")}
            >
              <Phone className="w-3 h-3 mr-1" />
              {language === "ar" ? "التواصل" : "Contact"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs border-black text-black hover:bg-black hover:text-white bg-transparent"
              onClick={() => setInputValue(language === "ar" ? "ما هي أسعاركم؟" : "What are your prices?")}
            >
              <Mail className="w-3 h-3 mr-1" />
              {language === "ar" ? "الأسعار" : "Pricing"}
            </Button>
          </div>
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t-2 border-black min-h-[80px]">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={language === "ar" ? "اكتب رسالتك هنا..." : "Type your message here..."}
                className="rounded-full border-2 border-black focus:ring-2 focus:ring-black/20 resize-none"
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="w-12 h-12 rounded-full bg-black hover:bg-gray-800 text-white border-2 border-black p-0"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Knowledge Manager Modal */}
      <KnowledgeManager isOpen={isKnowledgeManagerOpen} onClose={() => setIsKnowledgeManagerOpen(false)} />
    </>
  )
}
