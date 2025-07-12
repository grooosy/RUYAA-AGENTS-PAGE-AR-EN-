"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import AIAssistant from "./AIAssistant"

export default function ChatButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full bg-black hover:bg-gray-800 text-white border-2 border-white shadow-2xl transition-all duration-300 hover:scale-110"
        size="lg"
      >
        <MessageCircle className="w-8 h-8" />
      </Button>

      <AIAssistant isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
