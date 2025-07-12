"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bot, MessageSquare, Zap, Activity, Database } from "lucide-react"
import ChatTester from "@/components/ai-assistant/ChatTester"
import AIAssistant from "@/components/ai-assistant/AIAssistant"
import DebugPanel from "@/components/ai-assistant/DebugPanel"

export default function TestChatPage() {
  const [isAIOpen, setIsAIOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="animate-pulse text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">AI Chat Testing Center</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Test and explore our AI assistant capabilities in a controlled environment
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* AI Assistant Demo */}
          <Card className="bg-black/40 backdrop-blur-xl border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Bot className="h-6 w-6 text-cyan-400" />
                AI Assistant Demo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-300">
                  Click the button below to open our AI assistant and test its capabilities:
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-cyan-400" />
                    <span className="text-sm text-gray-300">Natural Language</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-cyan-400" />
                    <span className="text-sm text-gray-300">Real-time Responses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-cyan-400" />
                    <span className="text-sm text-gray-300">Context Awareness</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-cyan-400" />
                    <span className="text-sm text-gray-300">Knowledge Base</span>
                  </div>
                </div>

                <Button onClick={() => setIsAIOpen(true)} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">
                  <Bot className="h-4 w-4 mr-2" />
                  Open AI Assistant
                </Button>

                <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
                  <h4 className="text-white font-medium mb-2">Try asking:</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• "ما هي خدمات رؤيا كابيتال؟"</li>
                    <li>• "How can AI help my business?"</li>
                    <li>• "أريد معرفة المزيد عن الوكلاء الأذكياء"</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Browser Compatibility */}
          <ChatTester />
        </div>

        {/* Debug Panel */}
        <DebugPanel />

        {/* AI Assistant Modal */}
        <AIAssistant isOpen={isAIOpen} onToggle={() => setIsAIOpen(!isAIOpen)} />
      </div>
    </div>
  )
}
