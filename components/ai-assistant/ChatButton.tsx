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
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-black hover:bg-gray-800 text-white shadow-lg"
        size="lg"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>

      <AIAssistant isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
