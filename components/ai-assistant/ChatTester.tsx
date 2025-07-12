"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function ChatTester() {
  const [isMounted, setIsMounted] = useState(false)
  const [browserFeatures, setBrowserFeatures] = useState({
    webSpeech: false,
    webRTC: false,
    webWorkers: false,
    localStorage: false,
    indexedDB: false,
  })

  useEffect(() => {
    setIsMounted(true)

    // Check browser features only after component has mounted
    if (typeof window !== "undefined") {
      setBrowserFeatures({
        webSpeech: "SpeechRecognition" in window || "webkitSpeechRecognition" in window,
        webRTC: "RTCPeerConnection" in window,
        webWorkers: "Worker" in window,
        localStorage: "localStorage" in window,
        indexedDB: "indexedDB" in window,
      })
    }
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Browser Compatibility</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-gray-600 mb-2">
            This section shows browser features that may affect AI assistant functionality:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Web Speech API</span>
              <Badge variant={browserFeatures.webSpeech ? "default" : "outline"}>
                {browserFeatures.webSpeech ? "Supported" : "Not Supported"}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">WebRTC</span>
              <Badge variant={browserFeatures.webRTC ? "default" : "outline"}>
                {browserFeatures.webRTC ? "Supported" : "Not Supported"}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Web Workers</span>
              <Badge variant={browserFeatures.webWorkers ? "default" : "outline"}>
                {browserFeatures.webWorkers ? "Supported" : "Not Supported"}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Local Storage</span>
              <Badge variant={browserFeatures.localStorage ? "default" : "outline"}>
                {browserFeatures.localStorage ? "Supported" : "Not Supported"}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">IndexedDB</span>
              <Badge variant={browserFeatures.indexedDB ? "default" : "outline"}>
                {browserFeatures.indexedDB ? "Supported" : "Not Supported"}
              </Badge>
            </div>
          </div>

          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Refresh Compatibility Check
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
