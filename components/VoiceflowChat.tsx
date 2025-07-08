"use client"

import { useEffect, useRef } from "react"
import { useLanguage } from "@/contexts/LanguageContext"

export default function VoiceflowChat() {
  const isLoaded = useRef(false)
  const scriptRef = useRef<HTMLScriptElement | null>(null)
  const { t, isRTL } = useLanguage()

  useEffect(() => {
    // Suppress console warnings from third-party widgets
    const originalConsoleWarn = console.warn
    const originalConsoleError = console.error

    const suppressWarnings = (originalMethod: typeof console.warn) => {
      return (...args: any[]) => {
        const message = args.join(" ")
        // Suppress specific Voiceflow and React key warnings
        if (
          message.includes('Each child in a list should have a unique "key" prop') ||
          message.includes("voiceflow") ||
          message.includes("HP") ||
          message.includes("QH") ||
          message.includes("ZH") ||
          message.includes("createRoot()") ||
          message.includes("ReactDOMClient")
        ) {
          return
        }
        originalMethod.apply(console, args)
      }
    }

    console.warn = suppressWarnings(originalConsoleWarn)
    console.error = suppressWarnings(originalConsoleError)

    // Check if script is already loaded or loading
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

    // Create and inject the Voiceflow script only once
    const script = document.createElement("script")
    script.type = "text/javascript"
    script.async = true
    script.defer = true
    script.src = "https://cdn.voiceflow.com/widget-next/bundle.mjs"
    scriptRef.current = script

    script.onload = () => {
      // Add a delay to ensure the widget is fully initialized
      setTimeout(() => {
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
            // Silently handle initialization errors
          }
        }
      }, 500) // Increased delay to prevent race conditions
    }

    script.onerror = () => {
      // Silently handle script loading errors
      scriptRef.current = null
    }

    // Insert the script into the document head
    document.head.appendChild(script)

    // Cleanup function
    return () => {
      // Restore original console methods
      console.warn = originalConsoleWarn
      console.error = originalConsoleError

      // Only remove script if we created it
      if (scriptRef.current?.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current)
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
