"use client"

import { useState, useEffect, useRef } from "react"
import { Send, Maximize2, Minimize2, X, Bot, User } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { groqService } from "@/lib/ai/groq-service"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/auth/auth-context"

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
        content: `مرحباً! أنا مساعدك الذكي من رؤيا كابيتال.

أنا هنا لأساعدك في فهم الوكلاء الذكيين وكيف يمكنهم تنفيذ مهام حقيقية لشركتك.

كيف يمكنني مساعدتك اليوم؟`,
        role: "assistant",
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])
    }
  }, [isOpen, messages.length])

  // Log interaction to Supabase
  const logInteraction = async (userMessage: string, aiResponse: string) => {
    if (!user) return

    try {
      await supabase.from('ai_interactions').insert({
        user_id: user.id,
        message: userMessage,
        response: aiResponse,
        timestamp: new Date().toISOString(),
        agent_type: 'ai_assistant'
      })
    } catch (error) {
      console.warn('Failed to log interaction:', error)
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
        content: "أعتذر، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى أو التواصل معنا على admin@ruyaacapital.com",
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
                <span className="
