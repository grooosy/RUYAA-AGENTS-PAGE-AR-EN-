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
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-blue-600 hover:bg-blue-700 z-40"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="sr-only">فتح المساعد الذكي</span>
        </Button>

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

      <AIAssistant isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
