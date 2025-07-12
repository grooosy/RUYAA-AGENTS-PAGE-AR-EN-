"use client"

import { useState, useEffect } from "react"
import { MessageCircle } from "lucide-react"
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
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 w-16 h-16 rounded-full bg-black border-2 border-white text-white hover:bg-gray-800 shadow-2xl transition-all duration-300 hover:scale-110"
        size="lg"
      >
        <MessageCircle className="w-8 h-8" />
      </Button>

      <AIAssistant isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
