"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Hero from "@/components/Hero"
import Features from "@/components/Features"
import Pricing from "@/components/Pricing"
import Footer from "@/components/Footer"
import Header from "@/components/Header"
import { AuthProvider } from "@/lib/auth/auth-context"
import { LanguageProvider } from "@/contexts/LanguageContext"
import { Toaster } from "sonner"

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <AuthProvider>
      <LanguageProvider>
        <div className="min-h-screen bg-black text-white">
          <Header />
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <Hero />
            <Features />
            <Pricing />
          </motion.main>
          <Footer />

          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "rgba(15, 23, 42, 0.95)",
                color: "white",
                border: "1px solid rgba(148, 163, 184, 0.2)",
                backdropFilter: "blur(10px)",
              },
            }}
          />
        </div>
      </LanguageProvider>
    </AuthProvider>
  )
}
