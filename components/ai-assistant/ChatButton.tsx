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
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 z-40"
        size="icon"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>

      <AIAssistant isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
