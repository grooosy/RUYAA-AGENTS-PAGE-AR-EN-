"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import ChatTester from "@/components/ai-assistant/ChatTester"
import AIAssistant from "@/components/ai-assistant/AIAssistant"
import DebugPanel from "@/components/ai-assistant/DebugPanel"

export default function TestChatPage() {
  const [isMounted, setIsMounted] = useState(false)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [showDebugPanel, setShowDebugPanel] = useState(false)
  const [browserInfo, setBrowserInfo] = useState<any>(null)
  const [screenInfo, setScreenInfo] = useState<any>(null)

  useEffect(() => {
    setIsMounted(true)

    if (typeof window !== "undefined") {
      setBrowserInfo({
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
      })

      if (typeof screen !== "undefined") {
        setScreenInfo({
          width: screen.width,
          height: screen.height,
          availWidth: screen.availWidth,
          availHeight: screen.availHeight,
          colorDepth: screen.colorDepth,
          pixelDepth: screen.pixelDepth,
        })
      }
    }
  }, [])

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Loading Chat Test Environment...</h1>
            <div className="animate-pulse bg-gray-200 h-4 w-48 mx-auto rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Chat Test Environment</h1>
          <p className="text-gray-600 mb-6">Test and debug AI chat functionality</p>

          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <Badge variant="outline">Browser: {browserInfo?.platform || "Unknown"}</Badge>
            <Badge variant="outline">
              Screen: {screenInfo ? `${screenInfo.width}x${screenInfo.height}` : "Unknown"}
            </Badge>
            <Badge variant="outline">Online: {browserInfo?.onLine ? "Yes" : "No"}</Badge>
            <Badge variant="outline">Cookies: {browserInfo?.cookieEnabled ? "Enabled" : "Disabled"}</Badge>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Button onClick={() => setShowAIAssistant(true)} className="bg-blue-600 hover:bg-blue-700">
              Open AI Assistant
            </Button>
            <Button onClick={() => setShowDebugPanel(!showDebugPanel)} variant="outline">
              {showDebugPanel ? "Hide" : "Show"} Debug Panel
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Chat Tester</CardTitle>
              <CardDescription>Test chat functionality and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ChatTester />
            </CardContent>
          </Card>

          {showDebugPanel && (
            <Card>
              <CardHeader>
                <CardTitle>Debug Panel</CardTitle>
                <CardDescription>System monitoring and diagnostics</CardDescription>
              </CardHeader>
              <CardContent>
                <DebugPanel />
              </CardContent>
            </Card>
          )}
        </div>

        {showAIAssistant && <AIAssistant isOpen={showAIAssistant} onClose={() => setShowAIAssistant(false)} />}
      </div>
    </div>
  )
}
