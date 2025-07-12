"use client"

import { useState, useEffect } from "react"
import Hero from "@/components/Hero"
import Features from "@/components/Features"
import Pricing from "@/components/Pricing"
import Footer from "@/components/Footer"
import Header from "@/components/Header"
import AIAssistant from "@/components/ai-assistant/AIAssistant"
import ChatButton from "@/components/ai-assistant/ChatButton"
import { AuthProvider } from "@/lib/auth/auth-context"
import { LanguageProvider } from "@/contexts/LanguageContext"
import { Toaster } from "sonner"

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault()
        setIsChatOpen((prev) => !prev)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const toggleChat = () => {
    setIsChatOpen((prev) => !prev)
    setUnreadCount(0)
  }

  if (!mounted) {
    return null
  }

  return (
    <AuthProvider>
      <LanguageProvider>
        <main className="min-h-screen bg-white">
          <Header />
          <Hero />
          <Features />
          <Pricing />
          <Footer />
          <ChatButton onClick={toggleChat} isOpen={isChatOpen} unreadCount={unreadCount} />
          <AIAssistant isOpen={isChatOpen} onToggle={toggleChat} />
        </main>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "rgba(15, 23, 42, 0.95)",
              color: "white",
              border: "1px solid rgba(148, 163, 184, 0.2)",
              backdropFilter: "blur(10px)",
            },
          }}
        />
      </LanguageProvider>
    </AuthProvider>
  )
}
