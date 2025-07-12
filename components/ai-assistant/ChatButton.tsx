"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import AIAssistant from "./AIAssistant"

export default function ChatButton() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      {/* Chat Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-[9998]"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={toggleChat}
          className={`relative w-16 h-16 rounded-full shadow-2xl transition-all duration-300 ${
            isOpen
              ? "bg-white text-black hover:bg-gray-100 border-2 border-black"
              : "bg-black text-white hover:bg-gray-800 border-2 border-white"
          }`}
          style={{
            boxShadow: isOpen ? "0 20px 40px -12px rgba(0, 0, 0, 0.3)" : "0 20px 40px -12px rgba(0, 0, 0, 0.8)",
          }}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-7 h-7" />
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <MessageCircle className="w-7 h-7" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pulse animation when closed */}
          {!isOpen && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-white"
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeOut",
              }}
            />
          )}
        </Button>

        {/* Tooltip */}
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 2 }}
            className="absolute right-full top-1/2 transform -translate-y-1/2 mr-4 bg-black text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap border border-gray-700"
          >
            تحدث معنا
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 translate-x-full">
              <div className="w-0 h-0 border-l-4 border-l-black border-t-4 border-t-transparent border-b-4 border-b-transparent" />
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Chat Widget */}
      <AnimatePresence>{isOpen && <AIAssistant isOpen={isOpen} onToggle={toggleChat} />}</AnimatePresence>
    </>
  )
}
