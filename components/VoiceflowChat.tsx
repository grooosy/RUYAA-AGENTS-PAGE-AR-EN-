"use client"

import { useEffect, useRef } from "react"
import { useLanguage } from "@/contexts/LanguageContext"

export default function VoiceflowChat() {
  const isLoaded = useRef(false)
  const scriptRef = useRef<HTMLScriptElement | null>(null)
  const { t, isRTL } = useLanguage()

  useEffect(() => {
    // Only load in browser environment
    if (typeof window === "undefined") return

    // Check if script is already loaded
    const existingScript = document.querySelector('script[src*="voiceflow.com"]')
    if (existingScript || isLoaded.current) return

    // Simple fallback - just show a placeholder for now
    // This prevents the widget from causing errors during development
    const loadVoiceflowWidget = () => {
      try {
        // Create a simple placeholder div instead of loading external script
        const placeholder = document.createElement('div')
        placeholder.id = 'voiceflow-placeholder'
        placeholder.style.cssText = `
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #06b6d4, #3b82f6);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
          z-index: 9999;
          transition: transform 0.2s ease;
        `
        placeholder.innerHTML = '💬'
        placeholder.title = t("chatWidget.tryFree")
        
        placeholder.addEventListener('mouseenter', () => {
          placeholder.style.transform = 'scale(1.1)'
        })
        
        placeholder.addEventListener('mouseleave', () => {
          placeholder.style.transform = 'scale(1)'
        })
        
        placeholder.addEventListener('click', () => {
          alert('Chat widget would open here in production')
        })
        
        // Remove any existing placeholder
        const existing = document.getElementById('voiceflow-placeholder')
        if (existing) existing.remove()
        
        document.body.appendChild(placeholder)
        isLoaded.current = true
      } catch (error) {
        console.log('Chat widget placeholder creation failed')
      }
    }

    // Add a small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      loadVoiceflowWidget()
    }, 1000)

    // Cleanup function
    return () => {
      clearTimeout(timeoutId)
      const placeholder = document.getElementById('voiceflow-placeholder')
      if (placeholder) {
        placeholder.remove()
      }
    }
  }, [t])

  return null
}