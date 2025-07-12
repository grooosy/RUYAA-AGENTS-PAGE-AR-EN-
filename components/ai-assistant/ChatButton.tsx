"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, Sparkles, X, Brain } from "lucide-react"
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
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    touchSupported: false,
  })

  // Device detection
  useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
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

  // Hide pulse after initial display
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPulse(false)
    }, 5000)
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
    onClick()
  }

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <AnimatePresence>
        {/* Welcome tooltip */}
        {!isOpen && showPulse && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute bottom-20 right-0 bg-slate-900/95 backdrop-blur-sm text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 max-w-xs"
            style={{ direction: isRTL ? "rtl" : "ltr" }}
          >
            <div className="flex items-center space-x-2 space-x-reverse">
              <Sparkles className="w-5 h-5 text-cyan-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">{user ? `مرحباً مرة أخرى! 🎯` : "مرحباً! 👋"}</p>
                <p className="text-xs text-slate-300 mt-1">
                  {user ? "لدي معلومات محدثة عن خدماتنا الجديدة" : "أنا مساعدك الذكي. اسألني عن خدمات الوكلاء الذكيين!"}
                </p>
              </div>
            </div>
            <div className="absolute bottom-0 right-6 transform translate-y-1/2 rotate-45 w-2 h-2 bg-slate-900/95 border-r border-b border-slate-700"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main chat button */}
      <motion.div
        whileHover={{ scale: deviceInfo.touchSupported ? 1 : 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative"
      >
        {/* Pulse animation */}
        {showPulse && !isOpen && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 animate-ping opacity-75"></div>
        )}

        {/* Unread count badge */}
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center z-10"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.div>
        )}

        <Button
          onClick={handleClick}
          onMouseEnter={() => !deviceInfo.touchSupported && setIsHovered(true)}
          onMouseLeave={() => !deviceInfo.touchSupported && setIsHovered(false)}
          className={`
            relative w-16 h-16 rounded-full shadow-2xl border-2 transition-all duration-300 overflow-hidden
            ${
              isOpen
                ? "bg-red-600 hover:bg-red-700 border-red-500"
                : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 border-cyan-500"
            }
            ${isHovered ? "shadow-3xl" : "shadow-2xl"}
          `}
          style={{
            boxShadow: isHovered
              ? "0 20px 40px rgba(6, 182, 212, 0.4), 0 0 0 4px rgba(6, 182, 212, 0.1)"
              : "0 10px 30px rgba(0, 0, 0, 0.3)",
          }}
        >
          {/* Icon container */}
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
                  <X className="w-6 h-6 text-white" />
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
                  <MessageSquare className="w-6 h-6 text-white" />
                  {/* AI indicator */}
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
                    className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full flex items-center justify-center"
                  >
                    <Brain className="w-2 h-2 text-slate-900" />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Ripple effect on click */}
          <motion.div
            className="absolute inset-0 bg-white rounded-full opacity-0"
            animate={isHovered ? { scale: [0, 1], opacity: [0.3, 0] } : {}}
            transition={{ duration: 0.6 }}
          />
        </Button>

        {/* Status indicator */}
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 shadow-lg">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            className="w-full h-full bg-green-400 rounded-full"
          />
        </div>
      </motion.div>

      {/* Keyboard shortcut hint for desktop */}
      {!deviceInfo.isMobile && !isOpen && isHovered && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          className="absolute bottom-20 right-0 bg-slate-900/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap border border-slate-700"
        >
          اضغط Ctrl+K للفتح السريع
        </motion.div>
      )}
    </div>
  )
}
