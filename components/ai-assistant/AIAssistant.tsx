"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { groqService } from "@/lib/ai/groq-service"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/auth/auth-context"
import { Send, Maximize2, Minimize2, X, Bot, User } from "lucide-react"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

interface AIAssistantProps {
  isOpen: boolean
  onClose: () => void
}

export default function AIAssistant({ isOpen, onClose }: AIAssistantProps) {
  const { user } = useAuth()
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, isMinimized])

  // Add welcome message when first opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        content: `أهلاً فيك! أنا مساعد رؤيا كابيتال.

بقدر ساعدك تفهم خدماتنا بتطوير الوكلاء الذكيين وكيف ممكن يفيدوا شركتك.

شو بدك تعرف عن خدماتنا؟`,
        role: "assistant",
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])
    }
  }, [isOpen, messages.length])

  // Log interaction to Supabase
  const logInteraction = async (userMessage: string, aiResponse: string) => {
    try {
      await supabase.from("ai_conversations").insert({
        user_id: user?.id || null,
        user_message: userMessage,
        ai_response: aiResponse,
        timestamp: new Date().toISOString(),
        session_id: `session_${Date.now()}`,
        metadata: {
          user_agent: navigator.userAgent,
          language: /[\u0600-\u06FF]/.test(userMessage) ? "ar" : "en",
        },
      })
    } catch (error) {
      console.warn("Failed to log interaction:", error)
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
    const messageContent = inputValue.trim()
    setInputValue("")
    setIsLoading(true)

    try {
      const response = await groqService.generateResponse(messageContent)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Log to Supabase
      await logInteraction(messageContent, response)
    } catch (error) {
      console.error("Error generating response:", error)

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "عذراً، حدث خطأ تقني. تواصل معنا على admin@ruyaacapital.com",
        role: "assistant",
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

  if (!isOpen) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`bg-black border-2 border-white rounded-3xl shadow-2xl transition-all duration-300 ${
          isMinimized ? "w-80 h-16" : "w-96 h-[600px]"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between min-h-[72px] px-4 py-4 border-b-2 border-white">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative">
              <Avatar className="w-12 h-12 border-2 border-white">
                <AvatarImage src="/images/ruyaa-ai-logo.png" alt="Ruyaa AI" />
                <AvatarFallback className="bg-white text-black font-bold">AI</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-black bg-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-bold text-lg whitespace-nowrap">مساعد رؤيا الذكي</h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-white" />
                <span className="text-white text-sm whitespace-nowrap">متصل ومتاح</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="w-10 h-10 text-white hover:bg-white hover:text-black rounded-full"
            >
              {isMinimized ? <Maximize2 className="w-5 h-5" /> : <Minimize2 className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="w-10 h-10 text-white hover:bg-white hover:text-black rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="h-[400px] p-4 overflow-auto">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === "user"
                          ? "bg-white text-black border-2 border-gray-200"
                          : "bg-gray-800 text-white border-2 border-gray-600"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {message.role === "assistant" && <Bot className="w-4 h-4 mt-1 flex-shrink-0" />}
                        {message.role === "user" && <User className="w-4 h-4 mt-1 flex-shrink-0" />}
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-800 text-white border-2 border-gray-600 rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4" />
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
                          <div
                            className="w-2 h-2 bg-white rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          />
                          <div
                            className="w-2 h-2 bg-white rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input */}
            <div className="min-h-[140px] p-4 border-t-2 border-white">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="اكتب رسالتك هنا..."
                  className="flex-1 bg-gray-900 border-2 border-gray-600 text-white placeholder-gray-400 rounded-full px-4 py-3 focus:border-white focus:ring-0"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="w-12 h-12 bg-white text-black hover:bg-gray-200 rounded-full flex-shrink-0 disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
              <div className="mt-3 text-center">
                <p className="text-gray-400 text-xs">
                  للتواصل المباشر:
                  <span className="text-white font-medium"> admin@ruyaacapital.com</span>
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
