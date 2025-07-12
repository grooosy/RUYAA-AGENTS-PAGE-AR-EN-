"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"

export default function ChatTester() {
  const [isMounted, setIsMounted] = useState(false)
  const [message, setMessage] = useState("")
  const [response, setResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState("disconnected")
  const [features, setFeatures] = useState<any>({})

  useEffect(() => {
    setIsMounted(true)

    if (typeof window !== "undefined") {
      // Detect browser features
      setFeatures({
        webSockets: "WebSocket" in window,
        localStorage: "localStorage" in window,
        sessionStorage: "sessionStorage" in window,
        indexedDB: "indexedDB" in window,
        serviceWorker: "serviceWorker" in navigator,
        pushManager: "PushManager" in window,
        notifications: "Notification" in window,
        geolocation: "geolocation" in navigator,
        camera: "mediaDevices" in navigator,
        microphone: "mediaDevices" in navigator,
      })

      // Test connection
      setConnectionStatus("connected")
    }
  }, [])

  const handleSendMessage = async () => {
    if (!message.trim()) return

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setResponse(`Echo: ${message}`)
    } catch (error) {
      setResponse("Error: Failed to send message")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isMounted) {
    return <div>Loading chat tester...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge variant={connectionStatus === "connected" ? "default" : "destructive"}>
          {connectionStatus === "connected" ? "Connected" : "Disconnected"}
        </Badge>
        <Badge variant={features.webSockets ? "default" : "secondary"}>
          WebSockets: {features.webSockets ? "Supported" : "Not Supported"}
        </Badge>
        <Badge variant={features.localStorage ? "default" : "secondary"}>
          Storage: {features.localStorage ? "Available" : "Unavailable"}
        </Badge>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="test-message" className="block text-sm font-medium mb-2">
            Test Message
          </label>
          <Input
            id="test-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter a test message..."
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          />
        </div>

        <Button onClick={handleSendMessage} disabled={isLoading || !message.trim()} className="w-full">
          {isLoading ? "Sending..." : "Send Test Message"}
        </Button>

        {response && (
          <div>
            <label className="block text-sm font-medium mb-2">Response</label>
            <Textarea value={response} readOnly className="min-h-[100px]" placeholder="Response will appear here..." />
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Browser Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(features).map(([feature, supported]) => (
              <div key={feature} className="flex justify-between">
                <span className="capitalize">{feature}:</span>
                <Badge variant={supported ? "default" : "secondary"} className="text-xs">
                  {supported ? "Yes" : "No"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
