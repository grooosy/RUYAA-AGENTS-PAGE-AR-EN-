"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, CheckCircle, Clock, Send, Trash2 } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  responseTime?: number
  tokenCount?: number
  error?: string
}

interface TestMetrics {
  totalMessages: number
  averageResponseTime: number
  totalTokens: number
  errorCount: number
  successRate: number
}

export default function ChatTester() {
  const [isMounted, setIsMounted] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [metrics, setMetrics] = useState<TestMetrics>({
    totalMessages: 0,
    averageResponseTime: 0,
    totalTokens: 0,
    errorCount: 0,
    successRate: 100,
  })

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    const startTime = Date.now()

    try {
      // Simulate API call to Groq
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputMessage.trim(),
          conversationHistory: messages.slice(-10), // Last 10 messages for context
        }),
      })

      const responseTime = Date.now() - startTime

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "No response received",
        timestamp: new Date(),
        responseTime,
        tokenCount: data.tokenCount || 0,
      }

      setMessages((prev) => [...prev, assistantMessage])
      updateMetrics(assistantMessage, false)
    } catch (error) {
      const responseTime = Date.now() - startTime
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Error: Failed to get response from AI assistant",
        timestamp: new Date(),
        responseTime,
        error: error instanceof Error ? error.message : "Unknown error",
      }

      setMessages((prev) => [...prev, errorMessage])
      updateMetrics(errorMessage, true)
    } finally {
      setIsLoading(false)
    }
  }

  const updateMetrics = (message: Message, isError: boolean) => {
    setMetrics((prev) => {
      const newTotalMessages = prev.totalMessages + 1
      const newErrorCount = prev.errorCount + (isError ? 1 : 0)
      const newTotalTokens = prev.totalTokens + (message.tokenCount || 0)

      // Calculate average response time
      const allResponseTimes = messages.filter((m) => m.responseTime).map((m) => m.responseTime!)
      allResponseTimes.push(message.responseTime || 0)

      const newAverageResponseTime = allResponseTimes.reduce((a, b) => a + b, 0) / allResponseTimes.length

      return {
        totalMessages: newTotalMessages,
        averageResponseTime: Math.round(newAverageResponseTime),
        totalTokens: newTotalTokens,
        errorCount: newErrorCount,
        successRate: Math.round(((newTotalMessages - newErrorCount) / newTotalMessages) * 100),
      }
    })
  }

  const clearChat = () => {
    setMessages([])
    setMetrics({
      totalMessages: 0,
      averageResponseTime: 0,
      totalTokens: 0,
      errorCount: 0,
      successRate: 100,
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!isMounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chat Tester</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Chat Tester</CardTitle>
            <CardDescription>Test AI assistant responses and performance</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={clearChat}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{metrics.totalMessages}</div>
            <div className="text-xs text-muted-foreground">Messages</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{metrics.averageResponseTime}ms</div>
            <div className="text-xs text-muted-foreground">Avg Response</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{metrics.totalTokens}</div>
            <div className="text-xs text-muted-foreground">Tokens</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{metrics.successRate}%</div>
            <div className="text-xs text-muted-foreground">Success Rate</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0">
        {/* Messages */}
        <ScrollArea className="flex-1 mb-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No messages yet. Start a conversation to test the AI assistant.
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="space-y-2">
                  <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : message.error
                            ? "bg-destructive/10 border border-destructive/20"
                            : "bg-muted"
                      }`}
                    >
                      <div className="text-sm">{message.content}</div>
                      <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                        <span>{message.timestamp.toLocaleTimeString()}</span>
                        {message.responseTime && (
                          <>
                            <Clock className="h-3 w-3" />
                            <span>{message.responseTime}ms</span>
                          </>
                        )}
                        {message.tokenCount && (
                          <Badge variant="secondary" className="text-xs">
                            {message.tokenCount} tokens
                          </Badge>
                        )}
                        {message.error ? (
                          <AlertCircle className="h-3 w-3 text-destructive" />
                        ) : message.role === "assistant" ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <Separator className="mb-4" />

        {/* Input */}
        <div className="flex gap-2">
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here..."
            className="flex-1 min-h-[60px] resize-none"
            disabled={isLoading}
          />
          <Button onClick={sendMessage} disabled={!inputMessage.trim() || isLoading} className="self-end">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
