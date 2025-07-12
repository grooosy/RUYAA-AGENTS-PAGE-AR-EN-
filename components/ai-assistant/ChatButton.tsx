"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import AIAssistant from "./AIAssistant"

interface ChatButtonProps {
  className?: string
}

export default function ChatButton({ className = "" }: ChatButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [hasNewMessage, setHasNewMessage] = useState(false)
  const [isOnline, setIsOnline] = useState(true)

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Simulate new message notification (you can connect this to real notifications)
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setHasNewMessage(true)
      }, 30000) // Show notification after 30 seconds of inactivity

      return () => clearTimeout(timer)
    } else {
      setHasNewMessage(false)
    }
  }, [isOpen])

  const handleToggle = () => {
    setIsOpen(!isOpen)
    setHasNewMessage(false)
    if (isMinimized) {
      setIsMinimized(false)
    }
  }

  const handleMinimize = () => {
    setIsMinimized(true)
  }

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`fixed bottom-6 right-6 z-[9998] ${className}`}
          >
            <div className="relative">
              <Button
                onClick={handleToggle}
                className="w-16 h-16 rounded-full bg-black hover:bg-gray-800 text-white shadow-2xl border-2 border-white transition-all duration-300 hover:scale-105"
                style={{
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)",
                }}
              >
                <MessageCircle className="w-8 h-8" />
              </Button>

              {/* Online/Offline Status Indicator */}
              <div
                className={`absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-black ${
                  isOnline ? "bg-green-500" : "bg-red-500"
                }`}
              />

              {/* New Message Notification */}
              <AnimatePresence>
                {hasNewMessage && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    className="absolute -top-2 -left-2"
                  >
                    <Badge className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">جديد</Badge>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pulse Animation for New Messages */}
              {hasNewMessage && <div className="absolute inset-0 rounded-full bg-black animate-ping opacity-20" />}
            </div>

            {/* Tooltip */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1, duration: 0.3 }}
              className="absolute right-20 top-1/2 transform -translate-y-1/2 bg-black text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap border border-gray-700"
            >
              مساعد رؤيا الذكي
              <div className="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2 w-0 h-0 border-l-4 border-l-black border-t-4 border-t-transparent border-b-4 border-b-transparent" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Assistant Component */}
      <AIAssistant isOpen={isOpen} onToggle={handleToggle} />
    </>
  )
}
