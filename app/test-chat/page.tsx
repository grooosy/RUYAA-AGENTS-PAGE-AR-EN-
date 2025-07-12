"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ChatTester from "@/components/ai-assistant/ChatTester"
import AIAssistant from "@/components/ai-assistant/AIAssistant"
import DebugPanel from "@/components/ai-assistant/DebugPanel"

export default function TestChatPage() {
  const [isMounted, setIsMounted] = useState(false)
  const [browserInfo, setBrowserInfo] = useState<{
    userAgent: string
    language: string
    platform: string
    cookieEnabled: boolean
    onlineStatus: boolean
    screenResolution: string
    viewportSize: string
    timeZone: string
  } | null>(null)

  useEffect(() => {
    setIsMounted(true)

    // Only access browser APIs after mounting
    if (typeof window !== "undefined") {
      setBrowserInfo({
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        onlineStatus: navigator.onLine,
        screenResolution: `${screen.width}x${screen.height}`,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })
    }
  }, [])

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center py-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Chat Testing Environment</h1>
            <p className="text-lg text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Chat Testing Environment</h1>
          <p className="text-lg text-gray-600 mb-6">
            Test and debug AI assistant functionality with comprehensive tools
          </p>
          <div className="flex justify-center gap-2 flex-wrap">
            <Badge variant="secondary">Groq Integration</Badge>
            <Badge variant="secondary">Real-time Testing</Badge>
            <Badge variant="secondary">Debug Tools</Badge>
            <Badge variant="secondary">Performance Monitoring</Badge>
          </div>
        </div>

        {/* Browser Information */}
        {browserInfo && (
          <Card>
            <CardHeader>
              <CardTitle>Browser Environment</CardTitle>
              <CardDescription>Current browser and system information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <strong>Platform:</strong> {browserInfo.platform}
                </div>
                <div>
                  <strong>Language:</strong> {browserInfo.language}
                </div>
                <div>
                  <strong>Cookies:</strong> {browserInfo.cookieEnabled ? "Enabled" : "Disabled"}
                </div>
                <div>
                  <strong>Online:</strong> {browserInfo.onlineStatus ? "Yes" : "No"}
                </div>
                <div>
                  <strong>Screen:</strong> {browserInfo.screenResolution}
                </div>
                <div>
                  <strong>Viewport:</strong> {browserInfo.viewportSize}
                </div>
                <div>
                  <strong>Timezone:</strong> {browserInfo.timeZone}
                </div>
                <div>
                  <strong>User Agent:</strong> {browserInfo.userAgent.slice(0, 20)}...
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Testing Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chat Tester */}
          <div className="space-y-4">
            <ChatTester />
          </div>

          {/* Debug Panel */}
          <div className="space-y-4">
            <DebugPanel />
          </div>
        </div>

        {/* AI Assistant Modal Trigger */}
        <Card>
          <CardHeader>
            <CardTitle>AI Assistant Modal</CardTitle>
            <CardDescription>Test the modal AI assistant interface</CardDescription>
          </CardHeader>
          <CardContent>
            <AIAssistant />
          </CardContent>
        </Card>

        {/* Additional Testing Tools */}
        <Card>
          <CardHeader>
            <CardTitle>Testing Guidelines</CardTitle>
            <CardDescription>How to effectively test the AI assistant</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Test Scenarios:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>Basic conversation flow</li>
                  <li>Error handling and recovery</li>
                  <li>Long conversation threads</li>
                  <li>Special characters and formatting</li>
                  <li>Network interruption scenarios</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Performance Metrics:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>Response time measurement</li>
                  <li>Token usage tracking</li>
                  <li>Error rate monitoring</li>
                  <li>Memory usage analysis</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
