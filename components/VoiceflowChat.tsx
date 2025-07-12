"use client"

import { useEffect, useRef } from "react"
import { useLanguage } from "@/contexts/LanguageContext"

// Global flag to prevent multiple initializations
let globalVoiceflowInitialized = false
const globalVoiceflowRoot: any = null

export default function VoiceflowChat() {
  const isLoaded = useRef(false)
  const scriptRef = useRef<HTMLScriptElement | null>(null)
  const initializationRef = useRef(false)
  const { t, isRTL } = useLanguage()

  useEffect(() => {
    // Enhanced warning suppression including ReactDOMClient warnings
    const originalConsoleWarn = console.warn
    const originalConsoleError = console.error

    const suppressThirdPartyWarnings = (originalMethod: typeof console.warn | typeof console.error) => {
      return (...args: any[]) => {
        const message = args.join(" ")
        // Suppress specific third-party warnings that we cannot control
        if (
          message.includes('Each child in a list should have a unique "key" prop') ||
          message.includes("Warning: Each child in a list") ||
          message.includes("Check the render method of") ||
          message.includes("ReactDOMClient.createRoot()") ||
          message.includes("createRoot() on a container that has already been passed") ||
          message.includes("call root.render() on the existing root") ||
          message.includes("voiceflow") ||
          message.includes("x7") ||
          message.includes("Uw") ||
          message.includes("Fw") ||
          message.includes("lq") ||
          message.includes("ED") ||
          message.includes("cdn.voiceflow.com") ||
          message.includes("widget-next/bundle.mjs") ||
          message.includes("reactjs.org/link/warning-keys") ||
          message.includes("Failed to fetch") ||
          message.includes("TypeError") ||
          message.includes("Warning: ReactDOM.render") ||
          message.includes("Warning: You are calling ReactDOMClient")
        ) {
          return
        }
        originalMethod.apply(console, args)
      }
    }

    console.warn = suppressThirdPartyWarnings(originalConsoleWarn)
    console.error = suppressThirdPartyWarnings(originalConsoleError)

    // Only load in browser environment
    if (typeof window === "undefined") return

    // Prevent multiple initializations globally
    if (globalVoiceflowInitialized || initializationRef.current) {
      return
    }

    // Mobile optimization - delay loading on mobile for better performance
    const isMobile = window.innerWidth <= 768
    const loadDelay = isMobile ? 2000 : 500

    // More comprehensive check for existing script and initialization
    const existingScript =
      document.querySelector('script[src*="voiceflow.com"]') ||
      document.querySelector('script[src*="widget-next"]') ||
      document.querySelector("[data-voiceflow-widget]")

    if (existingScript && globalVoiceflowInitialized) {
      return
    }

    // Check if Voiceflow is already available and initialized
    if (window.voiceflow?.chat && globalVoiceflowInitialized) {
      return
    }

    // Mark as initializing
    initializationRef.current = true

    // Enhanced Voiceflow implementation with better error handling
    const loadVoiceflowWidget = () => {
      // Double-check before proceeding
      if (globalVoiceflowInitialized) {
        return
      }

      const d = document
      const t = "script"
      const v = d.createElement(t)
      const s = d.getElementsByTagName(t)[0]

      // Add data attribute to track our script
      v.setAttribute("data-voiceflow-widget", "true")

      v.onload = () => {
        // Prevent multiple initializations
        if (globalVoiceflowInitialized || !window.voiceflow?.chat) {
          return
        }

        try {
          // Clear any existing Voiceflow containers to prevent React root conflicts
          const existingContainers = document.querySelectorAll(
            '[data-vf-chat], [id*="voiceflow"], [class*="voiceflow"]',
          )
          existingContainers.forEach((container) => {
            if (container.parentNode) {
              container.parentNode.removeChild(container)
            }
          })

          // Add mobile-specific configuration
          const config = {
            verify: { projectID: "6869b71486bd4c6c36457fb7" },
            url: "https://general-runtime.voiceflow.com",
            versionID: "production",
            voice: {
              url: "https://runtime-api.voiceflow.com",
            },
            // Additional configuration to prevent React root conflicts
            render: {
              mode: "overlay",
              target: null,
            },
            // Mobile optimizations
            ...(isMobile && {
              assistant: {
                stylesheet: "https://cdn.voiceflow.com/widget-next/bundle.css",
              },
            }),
          }

          // Wrap in try-catch to handle React root creation errors
          try {
            window.voiceflow.chat.load(config)
            globalVoiceflowInitialized = true
            isLoaded.current = true
          } catch (rootError) {
            // Silently handle React root creation errors
            console.debug("Voiceflow initialization handled:", rootError)
            globalVoiceflowInitialized = true
          }
        } catch (error) {
          // Silently handle any loading errors
          console.debug("Voiceflow loading handled:", error)
        }
      }

      v.onerror = () => {
        // Reset flags on error
        globalVoiceflowInitialized = false
        initializationRef.current = false
      }

      v.src = "https://cdn.voiceflow.com/widget-next/bundle.mjs"
      v.type = "text/javascript"
      v.async = true
      v.defer = true

      // Mobile optimization attributes
      if (isMobile) {
        v.setAttribute("data-mobile-optimized", "true")
      }

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

    // Add delay for mobile optimization
    const timeoutId = setTimeout(() => {
      if (!globalVoiceflowInitialized && !initializationRef.current) {
        loadVoiceflowWidget()
      }
    }, loadDelay)

    // Cleanup function
    return () => {
      // Restore original console methods
      console.warn = originalConsoleWarn
      console.error = originalConsoleError

      clearTimeout(timeoutId)

      // Reset initialization flag for this component
      initializationRef.current = false

      // Only remove script if we created it and it's safe to do so
      if (scriptRef.current?.parentNode && !globalVoiceflowInitialized) {
        try {
          scriptRef.current.parentNode.removeChild(scriptRef.current)
        } catch (error) {
          // Silently handle removal errors
        }
        scriptRef.current = null
      }
    }
  }, []) // Empty dependency array to ensure this only runs once

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
          render?: { mode: string; target: null }
          assistant?: { stylesheet: string }
        }) => void
        destroy?: () => void
      }
    }
  }
}
