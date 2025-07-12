"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import AIAssistant from "@/components/ai-assistant/AIAssistant"
import ChatTester from "@/components/ai-assistant/ChatTester"
import DebugPanel from "@/components/ai-assistant/DebugPanel"
import { AuthProvider } from "@/lib/auth/auth-context"
import { LanguageProvider } from "@/contexts/LanguageContext"
import { Toaster } from "sonner"

export default function TestChatPage() {
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false)
  const [testMessages] = useState([
    "مرحبا",
    "ما هي خدماتكم؟",
    "كم تكلفة الوكيل الذكي؟",
    "كيف يعمل الوكيل الذكي؟",
    "ما هي فوائد الوكيل الذكي؟",
    "أريد معرفة المزيد عن وكيل الدعم",
    "كيف يمكنني البدء؟",
    "هل يدعم اللغة العربية؟",
  ])

  return (
    <AuthProvider>
      <LanguageProvider>
        <div className="min-h-screen p-4">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>AI Assistant Testing Page</span>
                  <Badge variant="outline">Development</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  This page is designed for testing the AI assistant functionality across different devices and
                  scenarios.
                </p>
                <div className="flex gap-2">
                  <Button onClick={() => setIsAIAssistantOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                    Open AI Assistant
                  </Button>
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    Reload Page
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Test Messages */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Test Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Click these buttons to quickly test different conversation scenarios:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {testMessages.map((message, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsAIAssistantOpen(true)
                        // Simulate typing the message
                        setTimeout(() => {
                          const event = new CustomEvent("test-message", { detail: message })
                          window.dispatchEvent(event)
                        }, 500)
                      }}
                      className="text-xs h-auto py-2 px-3 whitespace-normal"
                    >
                      {message}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Compatibility Tests */}
            <ChatTester />

            {/* Device Information */}
            <Card>
              <CardHeader>
                <CardTitle>Device Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold mb-2">Browser Info</h4>
                    <div className="space-y-1 text-gray-600">
                      <div>User Agent: {navigator.userAgent.substring(0, 50)}...</div>
                      <div>Platform: {navigator.platform}</div>
                      <div>Language: {navigator.language}</div>
                      <div>Online: {navigator.onLine ? "Yes" : "No"}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Screen Info</h4>
                    <div className="space-y-1 text-gray-600">
                      <div>
                        Screen: {screen.width}×{screen.height}
                      </div>
                      <div>
                        Viewport: {window.innerWidth}×{window.innerHeight}
                      </div>
                      <div>Device Pixel Ratio: {window.devicePixelRatio}</div>
                      <div>Touch Support: {"ontouchstart" in window ? "Yes" : "No"}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testing Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Testing Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Manual Testing Steps:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-gray-600">
                      <li>Open the AI assistant using the button above</li>
                      <li>Try sending different types of messages</li>
                      <li>Test on different screen sizes (resize browser window)</li>
                      <li>Test with network disconnected (go offline)</li>
                      <li>Test keyboard shortcuts (Enter to send, Escape to close)</li>
                      <li>Test touch interactions on mobile devices</li>
                      <li>Verify error handling by sending very long messages</li>
                      <li>Check message status indicators</li>
                    </ol>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Expected Behavior:</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>Chat should open smoothly with welcome message</li>
                      <li>Messages should send and receive properly</li>
                      <li>UI should be responsive on all screen sizes</li>
                      <li>Error states should be handled gracefully</li>
                      <li>Offline mode should show appropriate messages</li>
                      <li>Keyboard navigation should work properly</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Assistant */}
          <AIAssistant isOpen={isAIAssistantOpen} onToggle={() => setIsAIAssistantOpen(!isAIAssistantOpen)} />

          {/* Debug Panel (only in development) */}
          <DebugPanel />

          {/* Toast notifications */}
          <Toaster position="top-right" richColors closeButton />
        </div>
      </LanguageProvider>
    </AuthProvider>
  )
}
