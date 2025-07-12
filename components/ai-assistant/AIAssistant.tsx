"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Send, Bot, User, Mic, MicOff, Volume2, VolumeX, RefreshCw } from "lucide-react"

interface ChatMessage {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
}

export function AIAssistant() {
  const [isMounted, setIsMounted] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      type: "assistant",
      content: "مرحباً! أنا المساعد الذكي لرؤيا كابيتال. كيف يمكنني مساعدتك اليوم؟",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(
      () => {
        const responses = [
          "شكراً لك على استفسارك. نحن في رؤيا كابيتال نقدم حلول الذكاء الاصطناعي المتطورة للشركات.",
          "يمكنني مساعدتك في فهم خدماتنا بشكل أفضل. هل تريد معرفة المزيد عن الوكلاء الأذكياء؟",
          "نحن متخصصون في تطوير وكلاء ذكيين مخصصين حسب احتياجات عملك. كيف يمكنني مساعدتك؟",
          "أهلاً وسهلاً! أنا هنا لأجيب على جميع استفساراتك حول خدمات رؤيا كابيتال.",
        ]

        const randomResponse = responses[Math.floor(Math.random() * responses.length)]

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: randomResponse,
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, assistantMessage])
        setIsLoading(false)
      },
      1000 + Math.random() * 2000,
    )
  }

  const toggleListening = () => {
    setIsListening(!isListening)
    // In a real implementation, this would start/stop speech recognition
  }

  const toggleSpeaking = () => {
    setIsSpeaking(!isSpeaking)
    // In a real implementation, this would start/stop text-to-speech
  }

  const resetChat = () => {
    setMessages([
      {
        id: "1",
        type: "assistant",
        content: "مرحباً! أنا المساعد الذكي لرؤيا كابيتال. كيف يمكنني مساعدتك اليوم؟",
        timestamp: new Date(),
      },
    ])
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="font-medium text-sm">المساعد الذكي</p>
            <p className="text-xs text-gray-600">متصل ونشط</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="secondary" className="text-xs">
            AI مدعوم بـ
          </Badge>
          <Button variant="ghost" size="sm" onClick={resetChat}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chat Area */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-80 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.type === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-blue-600" />
                    </div>
                  )}

                  <div className={`max-w-[80%] ${message.type === "user" ? "order-2" : ""}`}>
                    <div
                      className={`p-3 rounded-lg ${
                        message.type === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{message.timestamp.toLocaleTimeString("ar-SA")}</p>
                  </div>

                  {message.type === "user" && (
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 order-3">
                      <User className="h-4 w-4 text-green-600" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
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
                      <span className="text-xs text-gray-500">جاري التفكير...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Input Area */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="اسأل المساعد الذكي..."
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={toggleListening}
            className={isListening ? "bg-red-100 text-red-600" : ""}
          >
            {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSpeaking}
            className={isSpeaking ? "bg-blue-100 text-blue-600" : ""}
          >
            {isSpeaking ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
          <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isLoading} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick Suggestions */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInputValue("أخبرني عن خدمات رؤيا كابيتال")}
            disabled={isLoading}
            className="text-xs"
          >
            خدماتنا
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInputValue("كيف تعمل الوكلاء الأذكياء؟")}
            disabled={isLoading}
            className="text-xs"
          >
            الوكلاء الأذكياء
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInputValue("ما هي تكلفة الخدمات؟")}
            disabled={isLoading}
            className="text-xs"
          >
            الأسعار
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInputValue("كيف يمكنني البدء؟")}
            disabled={isLoading}
            className="text-xs"
          >
            البدء
          </Button>
        </div>
      </div>
    </div>
  )
}
