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
    const existingScript = document.querySelector('script[src="https://cdn.voiceflow.com/widget-next/bundle.mjs"]')
    if (existingScript || isLoaded.current) return

    // Check if Voiceflow is already available
    if (window.voiceflow?.chat) {
      if (!isLoaded.current) {
        try {
          window.voiceflow.chat.load({
            verify: { projectID: "6869b71486bd4c6c36457fb7" },
            url: "https://general-runtime.voiceflow.com",
            versionID: "production",
            voice: {
              url: "https://runtime-api.voiceflow.com",
            },
          })
          isLoaded.current = true
        } catch (error) {
          // Silently handle initialization errors
        }
      }
      return
    }

    // Use the exact original Voiceflow implementation
    const loadVoiceflowWidget = () => {
      const d = document
      const t = "script"
      const v = d.createElement(t)
      const s = d.getElementsByTagName(t)[0]

      v.onload = () => {
        if (window.voiceflow?.chat && !isLoaded.current) {
          try {
            window.voiceflow.chat.load({
              verify: { projectID: "6869b71486bd4c6c36457fb7" },
              url: "https://general-runtime.voiceflow.com",
              versionID: "production",
              voice: {
                url: "https://runtime-api.voiceflow.com",
              },
            })
            isLoaded.current = true
          } catch (error) {
            // Silently handle any loading errors
          }
        }
      }

      v.onerror = () => {
        // Silently handle script loading errors
      }

      v.src = "https://cdn.voiceflow.com/widget-next/bundle.mjs"
      v.type = "text/javascript"
      v.async = true
      v.defer = true

      // Store reference for cleanup
      scriptRef.current = v

      // Insert script using original method
      if (s && s.parentNode) {
        s.parentNode.insertBefore(v, s)
      } else {
        // Fallback if no script tags exist
        document.head.appendChild(v)
      }
    }

    // Add a small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      loadVoiceflowWidget()
    }, 100)

    // Cleanup function
    return () => {
      clearTimeout(timeoutId)

      // Only remove script if we created it
      if (scriptRef.current?.parentNode) {
        try {
          scriptRef.current.parentNode.removeChild(scriptRef.current)
        } catch (error) {
          // Silently handle removal errors
        }
        scriptRef.current = null
      }
    }
  }, [])

  return null
}

// Extend the Window interface to include voiceflow
declare global {
  interface Window {
    voiceflow?: {
      chat?: {
        load: (config: {
          verify: { projectID: string }
          url: string
          versionID: string
          voice: { url: string }
        }) => void
      }
    }
  }
}
