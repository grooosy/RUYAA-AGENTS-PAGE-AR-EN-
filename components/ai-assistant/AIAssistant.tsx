"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { X, Send, User, Bot, Minimize2, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { GroqAIService } from "@/lib/ai/groq-service"

interface Message {
  id: string
  content: string
  sender: "user" | "assistant"
  timestamp: Date
}

interface AIAssistantProps {
  isOpen: boolean
  onToggle: () => void
}

export default function AIAssistant({ isOpen, onToggle }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "testing">("testing")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const groqService = new GroqAIService()

  useEffect(() => {
    if (isOpen) {
      testAIConnection()
      if (messages.length === 0) {
        addWelcomeMessage()
      }
    }
  }, [isOpen])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const testAIConnection = async () => {
    try {
      setConnectionStatus("testing")
      await groqService.testConnection()
      setConnectionStatus("connected")
    } catch (error) {
      console.error("AI connection test failed:", error)
      setConnectionStatus("disconnected")
    }
  }

  const addWelcomeMessage = () => {
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      content:
        "مرحباً بك في رؤيا كابيتال! أنا مساعدك الذكي وأنا هنا لمساعدتك في جميع استفساراتك حول خدماتنا المالية والاستثمارية. كيف يمكنني مساعدتك اليوم؟",
      sender: "assistant",
      timestamp: new Date(),
    }
    setMessages([welcomeMessage])
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
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
      const response = await groqService.generateResponse(inputValue.trim())

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error generating response:", error)

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "أعتذر، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى أو التواصل معنا مباشرة على الرقم: +966 11 234 5678",
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
              <div
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-black ${
                  connectionStatus === "connected"
                    ? "bg-white"
                    : connectionStatus === "testing"
                      ? "bg-gray-400"
                      : "bg-gray-600"
                }`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-bold text-lg whitespace-nowrap">مساعد رؤيا الذكي</h3>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    connectionStatus === "connected"
                      ? "bg-white"
                      : connectionStatus === "testing"
                        ? "bg-gray-400"
                        : "bg-gray-600"
                  }`}
                />
                <span className="text-white text-sm whitespace-nowrap">
                  {connectionStatus === "connected"
                    ? "متصل ومتاح"
                    : connectionStatus === "testing"
                      ? "جاري الاتصال..."
                      : "غير متصل"}
                </span>
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
              onClick={onToggle}
              className="w-10 h-10 text-white hover:bg-white hover:text-black rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <ScrollArea className="h-[400px] p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.sender === "user"
                          ? "bg-white text-black border-2 border-gray-200"
                          : "bg-gray-800 text-white border-2 border-gray-600"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {message.sender === "assistant" && <Bot className="w-4 h-4 mt-1 flex-shrink-0" />}
                        {message.sender === "user" && <User className="w-4 h-4 mt-1 flex-shrink-0" />}
                        <p className="text-sm leading-relaxed">{message.content}</p>
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
            </ScrollArea>

            {/* Input */}
            <div className="min-h-[140px] p-4 border-t-2 border-white">
              <div className="flex gap-2">
                <Input
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
                  للمساعدة الفورية، اتصل بنا على:
                  <span className="text-white font-medium"> +966 11 234 5678</span>
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
