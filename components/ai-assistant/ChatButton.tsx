"use client"

import { useState, useEffect } from "react"
import { MessageCircle, Phone, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import AIAssistant from "./AIAssistant"

export default function ChatButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [hasNewMessage, setHasNewMessage] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
      // Show notification after 3 seconds
      setTimeout(() => {
        if (!isOpen) {
          setHasNewMessage(true)
        }
      }, 3000)
    }, 1000)

    return () => clearTimeout(timer)
  }, [isOpen])

  const handleToggle = () => {
    setIsOpen(!isOpen)
    setHasNewMessage(false)
  }

  if (!isVisible) return null

  return (
    <>
      <div className="fixed bottom-4 right-4 z-40">
        {!isOpen && (
          <div className="relative">
            {/* Pulse animation rings */}
            {hasNewMessage && (
              <>
                <div className="absolute inset-0 rounded-full bg-black animate-ping opacity-20" />
                <div
                  className="absolute inset-0 rounded-full bg-black animate-ping opacity-10"
                  style={{ animationDelay: "0.5s" }}
                />
              </>
            )}

            {/* Main chat button */}
            <Button
              onClick={handleToggle}
              className={`w-16 h-16 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 ${
                isOpen
                  ? "bg-white text-black border-2 border-black hover:bg-gray-100"
                  : "bg-black text-white border-2 border-white hover:bg-gray-900"
              }`}
              aria-label="فتح المساعد الذكي"
            >
              <MessageCircle className="w-8 h-8" />
            </Button>

            {/* Status indicator */}
            <div className="absolute -top-2 -right-2">
              <div className="w-6 h-6 bg-white border-2 border-black rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-black rounded-full animate-pulse" />
              </div>
            </div>

            {/* New message badge */}
            {hasNewMessage && (
              <div className="absolute -top-3 -left-3">
                <div className="w-8 h-8 bg-white border-2 border-black rounded-full flex items-center justify-center animate-bounce">
                  <span className="text-black text-xs font-bold">!</span>
                </div>
              </div>
            )}

            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="bg-black text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap border-2 border-white">
                مساعد رؤيا الذكي
                <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black" />
              </div>
            </div>
          </div>
        )}

        {/* Quick contact buttons when chat is closed */}
        {!isOpen && (
          <div className="absolute bottom-20 right-0 space-y-2 opacity-0 hover:opacity-100 transition-opacity duration-300">
            <Button
              onClick={() => window.open("tel:+966112345678")}
              className="w-12 h-12 bg-black text-white border-2 border-white rounded-full hover:bg-gray-900 transition-all duration-200"
              aria-label="اتصال هاتفي"
            >
              <Phone className="w-5 h-5" />
            </Button>
            <Button
              onClick={() => window.open("mailto:info@ruyaacapital.com")}
              className="w-12 h-12 bg-black text-white border-2 border-white rounded-full hover:bg-gray-900 transition-all duration-200"
              aria-label="إرسال بريد إلكتروني"
            >
              <Mail className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>

      <AIAssistant isOpen={isOpen} onToggle={handleToggle} />
    </>
  )
}
