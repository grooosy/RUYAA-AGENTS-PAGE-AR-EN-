"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User, Trash2, Download, Copy, Zap } from "lucide-react"

interface Message {
  id: string
  type: "user" | "bot"
  content: string
  timestamp: Date
  status: "sending" | "sent" | "error"
  responseTime?: number
}

export function ChatTester() {
  const [isMounted, setIsMounted] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "connecting">("disconnected")

  useEffect(() => {
    setIsMounted(true)
    // Simulate connection
    setConnectionStatus("connecting")
    setTimeout(() => {
      setConnectionStatus("connected")
    }, 1000)
  }, [])

  if (!isMounted) {
    return null
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
      status: "sent",
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    const startTime = Date.now()

    // Simulate AI response
    setTimeout(
      () => {
        const responseTime = Date.now() - startTime
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "bot",
          content: `شكراً لك على رسالتك: "${userMessage.content}". هذا رد تجريبي من الوكيل الذكي. يمكنني مساعدتك في مختلف الاستفسارات المتعلقة بخدماتنا.`,
          timestamp: new Date(),
          status: "sent",
          responseTime,
        }
        setMessages((prev) => [...prev, botMessage])
        setIsLoading(false)
      },
      Math.random() * 2000 + 500,
    )
  }

  const clearChat = () => {
    setMessages([])
  }

  const exportChat = () => {
    const chatData = {
      timestamp: new Date().toISOString(),
      messages: messages.map((msg) => ({
        type: msg.type,
        content: msg.content,
        timestamp: msg.timestamp.toISOString(),
        responseTime: msg.responseTime,
      })),
    }

    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `chat-export-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const copyMessage = (content: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(content)
    }
  }

  return (
    <div className="space-y-4">
      {/* Status Bar */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              connectionStatus === "connected"
                ? "bg-green-500"
                : connectionStatus === "connecting"
                  ? "bg-yellow-500"
                  : "bg-red-500"
            }`}
          />
          <span className="text-sm font-medium">
            {connectionStatus === "connected"
              ? "متصل"
              : connectionStatus === "connecting"
                ? "جاري الاتصال..."
                : "غير متصل"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {messages.length} رسالة
          </Badge>
          <Button variant="ghost" size="sm" onClick={exportChat} disabled={messages.length === 0}>
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={clearChat} disabled={messages.length === 0}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chat Messages */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-96 p-4">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Bot className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>ابدأ محادثة جديدة مع الوكيل الذكي</p>
                <p className="text-sm mt-2">اكتب رسالتك أدناه للبدء</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.type === "bot" && (
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

                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <span>{message.timestamp.toLocaleTimeString("ar-SA")}</span>
                        {message.responseTime && (
                          <>
                            <Separator orientation="vertical" className="h-3" />
                            <div className="flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              <span>{message.responseTime}ms</span>
                            </div>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 text-xs"
                          onClick={() => copyMessage(message.content)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
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
                        <span className="text-xs text-gray-500">جاري الكتابة...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Input Area */}
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="اكتب رسالتك هنا..."
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          disabled={isLoading || connectionStatus !== "connected"}
          className="flex-1"
        />
        <Button
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || isLoading || connectionStatus !== "connected"}
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => setInputValue("ما هي خدماتكم؟")} disabled={isLoading}>
          ما هي خدماتكم؟
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setInputValue("كيف يمكنني التواصل معكم؟")}
          disabled={isLoading}
        >
          كيف يمكنني التواصل معكم؟
        </Button>
        <Button variant="outline" size="sm" onClick={() => setInputValue("ما هي أسعاركم؟")} disabled={isLoading}>
          ما هي أسعاركم؟
        </Button>
      </div>
    </div>
  )
}
