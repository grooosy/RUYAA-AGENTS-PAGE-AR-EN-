"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, X, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth/auth-context"
import { useLanguage } from "@/contexts/LanguageContext"

interface ChatButtonProps {
  onClick: () => void
  isOpen: boolean
  unreadCount?: number
}

export default function ChatButton({ onClick, isOpen, unreadCount = 0 }: ChatButtonProps) {
  const { user } = useAuth()
  const { isRTL } = useLanguage()
  const [isHovered, setIsHovered] = useState(false)
  const [showPulse, setShowPulse] = useState(true)
  const [showTooltip, setShowTooltip] = useState(false)
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    touchSupported: false,
  })

  useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobile =
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) || window.innerWidth <= 768
      const touchSupported = "ontouchstart" in window || navigator.maxTouchPoints > 0

      setDeviceInfo({
        isMobile,
        touchSupported,
      })
    }

    detectDevice()
    window.addEventListener("resize", detectDevice)
    return () => window.removeEventListener("resize", detectDevice)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(true)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPulse(false)
    }, 10000)
    return () => clearTimeout(timer)
  }, [])

  const handleClick = () => {
    if (deviceInfo.touchSupported && "vibrate" in navigator) {
      try {
        navigator.vibrate(50)
      } catch (error) {
        // Ignore vibration errors
      }
    }
    setShowTooltip(false)
    onClick()
  }

  const handleMouseEnter = () => {
    if (!deviceInfo.touchSupported) {
      setIsHovered(true)
      setShowTooltip(true)
    }
  }

  const handleMouseLeave = () => {
    if (!deviceInfo.touchSupported) {
      setIsHovered(false)
      setShowTooltip(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <AnimatePresence>
        {!isOpen && showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute bottom-20 right-0 bg-black text-white px-4 py-3 rounded-2xl shadow-2xl border border-gray-700 max-w-xs"
            style={{
              direction: isRTL ? "rtl" : "ltr",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1)",
            }}
          >
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="p-2 bg-white rounded-xl">
                <Bot className="w-5 h-5 text-black flex-shrink-0" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {user ? `مرحباً ${user.user_metadata?.name || "مرة أخرى"}! 👋` : "مرحباً! 👋"}
                </p>
                <p className="text-xs text-gray-300 mt-1">أنا مساعدك الذكي. اسألني عن خدمات رؤيا كابيتال</p>
              </div>
            </div>
            <div className="absolute bottom-0 right-6 transform translate-y-1/2 rotate-45 w-3 h-3 bg-black border-r border-b border-gray-700"></div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        whileHover={{ scale: deviceInfo.touchSupported ? 1 : 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative"
      >
        {showPulse && !isOpen && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full bg-black/30"
              animate={{ scale: [1, 1.5, 2], opacity: [0.5, 0.2, 0] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeOut" }}
            />
            <motion.div
              className="absolute inset-0 rounded-full bg-black/40"
              animate={{ scale: [1, 1.3, 1.8], opacity: [0.6, 0.3, 0] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 0.5, ease: "easeOut" }}
            />
          </>
        )}

        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 bg-white text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center z-10 border-2 border-black"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.div>
        )}

        <Button
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`
            relative w-16 h-16 rounded-full shadow-2xl transition-all duration-300 overflow-hidden
            ${isOpen ? "bg-white hover:bg-gray-100 text-black" : "bg-black hover:bg-gray-900 text-white"}
            ${isHovered ? "shadow-3xl" : "shadow-2xl"}
          `}
          style={{
            boxShadow: isHovered
              ? "0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 4px rgba(255, 255, 255, 0.1)"
              : "0 10px 30px rgba(0, 0, 0, 0.3)",
          }}
        >
          <div className="relative z-10 flex items-center justify-center">
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
                  key="chat"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative"
                >
                  <MessageSquare className="w-6 h-6" />
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.7, 1, 0.7],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                    className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center"
                  >
                    <Bot className="w-2 h-2 text-black" />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.div
            className={`absolute inset-0 rounded-full opacity-0 ${isOpen ? "bg-black/10" : "bg-white/10"}`}
            animate={isHovered ? { scale: [0, 1], opacity: [0.3, 0] } : {}}
            transition={{ duration: 0.6 }}
          />
        </Button>

        <motion.div
          className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full shadow-lg"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          <div className="w-full h-full bg-black rounded-full" />
        </motion.div>
      </motion.div>

      {!deviceInfo.isMobile && !isOpen && isHovered && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          className="absolute bottom-20 right-0 bg-black text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap border border-gray-700"
        >
          اضغط للمحادثة
        </motion.div>
      )}
    </div>
  )
}
