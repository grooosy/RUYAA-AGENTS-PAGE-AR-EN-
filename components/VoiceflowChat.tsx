"use client"

import { useEffect, useRef } from "react"

export default function VoiceflowChat() {
  const isLoaded = useRef(false)
  const scriptRef = useRef<HTMLScriptElement | null>(null)

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
          message.includes("ZH")
        ) {
          return
        }
        originalMethod.apply(console, args)
      }
    }

    console.warn = suppressWarnings(originalConsoleWarn)
    console.error = suppressWarnings(originalConsoleError)

    // Prevent multiple loads
    if (isLoaded.current || scriptRef.current) return

    // Check if Voiceflow is already loaded
    if (window.voiceflow?.chat) {
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
      return
    }

    // Create and inject the Voiceflow script
    const script = document.createElement("script")
    script.type = "text/javascript"
    script.async = true
    script.defer = true
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
      }, 200)
    }

    script.onerror = () => {
      // Silently handle script loading errors
      scriptRef.current = null
    }

    script.src = "https://cdn.voiceflow.com/widget-next/bundle.mjs"

    // Insert the script into the document head
    const firstScript = document.getElementsByTagName("script")[0]
    if (firstScript?.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript)
    } else {
      document.head.appendChild(script)
    }

    // Cleanup function
    return () => {
      // Restore original console methods
      console.warn = originalConsoleWarn
      console.error = originalConsoleError

      // Remove script if it exists
      if (scriptRef.current?.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current)
        scriptRef.current = null
      }
    }
  }, [])

  return (
    <>
      {/* Pulsing Arrow Indicator for Chat Widget */}
      <div className="fixed bottom-24 right-6 z-[9998] pointer-events-none">
        <div className="relative">
          <div className="animate-pulse">
            <svg className="w-8 h-8 text-cyan-400 animate-bounce" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="bg-black/80 text-cyan-400 text-xs px-2 py-1 rounded whitespace-nowrap border border-cyan-400/30">
              جرب الوكيل مجاناً
            </div>
          </div>
        </div>
      </div>
      {null}
    </>
  )
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
