"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, Phone, Mail, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/LanguageContext"
import AIAssistant from "./AIAssistant"

export default function ChatButton() {
  const { language } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [hasNewMessage, setHasNewMessage] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen && !isMinimized) {
        setHasNewMessage(true)
      }
    }, 5000)

    return () => clearTimeout(timer)
  }, [isOpen, isMinimized])

  const handleOpen = () => {
    setIsOpen(true)
    setIsMinimized(false)
    setHasNewMessage(false)
    setShowQuickActions(false)
  }

  const handleClose = () => {
    setIsOpen(false)
    setIsMinimized(false)
    setShowQuickActions(false)
  }

  const handleMinimize = () => {
    setIsOpen(false)
    setIsMinimized(true)
    setShowQuickActions(false)
  }

  const handleQuickContact = (type: "phone" | "email") => {
    if (type === "phone") {
      window.open("tel:+963940632191", "_self")
    } else {
      window.open("mailto:info@ruyaacapital.com", "_self")
    }
    setShowQuickActions(false)
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {showQuickActions && !isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="absolute bottom-16 right-0 flex flex-col gap-2 mb-2"
            >
              <Button
                onClick={() => handleQuickContact("phone")}
                className="bg-black hover:bg-gray-800 text-white border-2 border-white rounded-full w-12 h-12 p-0 shadow-lg"
                title={language === "ar" ? "اتصل بنا" : "Call us"}
              >
                <Phone className="w-5 h-5" />
              </Button>
              <Button
                onClick={() => handleQuickContact("email")}
                className="bg-black hover:bg-gray-800 text-white border-2 border-white rounded-full w-12 h-12 p-0 shadow-lg"
                title={language === "ar" ? "راسلنا" : "Email us"}
              >
                <Mail className="w-5 h-5" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Minimized State */}
        <AnimatePresence>
          {isMinimized && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute bottom-16 right-0 mb-2"
            >
              <Button
                onClick={handleOpen}
                className="bg-white hover:bg-gray-100 text-black border-2 border-black rounded-2xl px-4 py-2 shadow-lg"
              >
                <Bot className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">{language === "ar" ? "مساعد رؤيا" : "Ruyaa AI"}</span>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Chat Button */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative">
          {/* Pulse Animation */}
          {hasNewMessage && !isOpen && !isMinimized && (
            <div className="absolute inset-0 rounded-full">
              <div className="absolute inset-0 rounded-full bg-black animate-ping opacity-20" />
              <div
                className="absolute inset-0 rounded-full bg-white animate-ping opacity-10"
                style={{ animationDelay: "0.5s" }}
              />
            </div>
          )}

          <Button
            onClick={isOpen ? handleClose : showQuickActions ? handleOpen : () => setShowQuickActions(true)}
            className={`relative w-16 h-16 rounded-full shadow-2xl border-2 transition-all duration-300 ${
              isOpen
                ? "bg-white hover:bg-gray-100 text-black border-black"
                : "bg-black hover:bg-gray-800 text-white border-white"
            }`}
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
                  <X className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="message"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <MessageCircle className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>

          {/* New Message Badge */}
          <AnimatePresence>
            {hasNewMessage && !isOpen && !isMinimized && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-2 -right-2"
              >
                <Badge className="bg-white text-black border-2 border-black text-xs px-2 py-1 rounded-full">
                  {language === "ar" ? "جديد" : "New"}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Tooltip */}
        <AnimatePresence>
          {!isOpen && !isMinimized && !showQuickActions && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="absolute right-20 top-1/2 transform -translate-y-1/2 bg-black text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap border-2 border-white shadow-lg"
            >
              {language === "ar" ? "تحدث معنا" : "Chat with us"}
              <div className="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2 w-0 h-0 border-l-4 border-l-black border-t-4 border-t-transparent border-b-4 border-b-transparent" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* AI Assistant Component */}
      <AIAssistant isOpen={isOpen} onClose={handleClose} onMinimize={handleMinimize} />
    </>
  )
}
