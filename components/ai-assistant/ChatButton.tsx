"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, Sparkles, X, Brain, Zap } from "lucide-react"
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

  // Device detection
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

  // Show tooltip after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(true)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  // Hide pulse after initial display
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPulse(false)
    }, 8000)
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
        {/* Welcome tooltip */}
        {!isOpen && showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute bottom-20 right-0 bg-black/95 backdrop-blur-xl text-white px-4 py-3 rounded-2xl shadow-2xl border border-gray-800/50 max-w-xs"
            style={{
              direction: isRTL ? "rtl" : "ltr",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)",
            }}
          >
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="p-2 bg-gray-800/50 rounded-xl border border-gray-700/50">
                <Sparkles className="w-5 h-5 text-gray-300 flex-shrink-0" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{user ? `مرحباً مرة أخرى! 🎯` : "مرحباً! 👋"}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {user ? "لدي معلومات محدثة عن خدماتنا الجديدة" : "أنا مساعدك الذكي. اسألني عن خدمات الوكلاء الذكيين!"}
                </p>
              </div>
            </div>
            <div className="absolute bottom-0 right-6 transform translate-y-1/2 rotate-45 w-2 h-2 bg-black/95 border-r border-b border-gray-800/50"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main chat button */}
      <motion.div
        whileHover={{ scale: deviceInfo.touchSupported ? 1 : 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative"
      >
        {/* Pulse animation rings */}
        {showPulse && !isOpen && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full bg-gray-700/30"
              animate={{ scale: [1, 1.5, 2], opacity: [0.5, 0.2, 0] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeOut" }}
            />
            <motion.div
              className="absolute inset-0 rounded-full bg-gray-600/40"
              animate={{ scale: [1, 1.3, 1.8], opacity: [0.6, 0.3, 0] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 0.5, ease: "easeOut" }}
            />
          </>
        )}

        {/* Unread count badge */}
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center z-10 border-2 border-black"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.div>
        )}

        <Button
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`
            relative w-16 h-16 rounded-full shadow-2xl border-2 transition-all duration-300 overflow-hidden
            ${isOpen ? "bg-gray-800 hover:bg-gray-700 border-gray-700" : "bg-black hover:bg-gray-900 border-gray-800"}
            ${isHovered ? "shadow-3xl" : "shadow-2xl"}
          `}
          style={{
            boxShadow: isHovered
              ? "0 20px 40px rgba(0, 0, 0, 0.6), 0 0 0 4px rgba(75, 85, 99, 0.2)"
              : "0 10px 30px rgba(0, 0, 0, 0.5)",
          }}
        >
          {/* Background gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800/20 to-gray-900/40 rounded-full" />

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
                    className="absolute -top-1 -right-1 w-3 h-3 bg-gray-400 rounded-full flex items-center justify-center border border-black"
                  >
                    <Brain className="w-2 h-2 text-black" />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Ripple effect on hover */}
          <motion.div
            className="absolute inset-0 bg-white/10 rounded-full opacity-0"
            animate={isHovered ? { scale: [0, 1], opacity: [0.3, 0] } : {}}
            transition={{ duration: 0.6 }}
          />

          {/* Inner glow effect */}
          <div className="absolute inset-1 bg-gradient-to-br from-gray-700/20 to-transparent rounded-full" />
        </Button>

        {/* Status indicator */}
        <motion.div
          className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-600 rounded-full border-2 border-black shadow-lg"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          <div className="w-full h-full bg-green-500 rounded-full" />
        </motion.div>

        {/* Power indicator */}
        <motion.div
          className="absolute -top-1 -left-1 w-3 h-3 bg-gray-600 rounded-full border border-black flex items-center justify-center"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
        >
          <Zap className="w-2 h-2 text-white" />
        </motion.div>
      </motion.div>

      {/* Keyboard shortcut hint for desktop */}
      {!deviceInfo.isMobile && !isOpen && isHovered && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          className="absolute bottom-20 right-0 bg-black/90 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap border border-gray-800/50 backdrop-blur-sm"
        >
          اضغط Ctrl+K للفتح السريع
        </motion.div>
      )}
    </div>
  )
}
