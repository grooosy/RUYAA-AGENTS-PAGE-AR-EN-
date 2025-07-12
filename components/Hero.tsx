"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Image from "next/image"
import { useLanguage } from "@/contexts/LanguageContext"
import { useAuth } from "@/lib/auth/auth-context"
import { useState } from "react"
import AuthModal from "@/components/auth/AuthModal"

export default function Hero() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  const handleLoginClick = () => {
    if (!user) {
      setIsAuthModalOpen(true)
    }
  }

  return (
    <>
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Content */}
        <div className="relative z-20 container mx-auto px-4 text-center flex items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto py-20 relative"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8 flex justify-center"
            >
              <Image
                src="/images/ruyaa-ai-logo.png"
                alt="Ruyaa AI Logo"
                width={120}
                height={120}
                className="drop-shadow-2xl"
              />
            </motion.div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight text-shadow-lg">
              {t("hero.title")}
            </h1>

            <p className="text-xl md:text-2xl text-gray-100 mb-12 leading-relaxed text-shadow">{t("hero.subtitle")}</p>

            <div className="flex flex-col items-center gap-6">
              {/* Main Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  onClick={handleLoginClick}
                  size="lg"
                  variant="primary"
                  className="px-8 py-4 text-lg font-semibold min-w-[200px] shadow-2xl hover:shadow-gray-900/50 transition-all duration-300"
                >
                  {t("hero.loginButton")}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-4 text-lg font-semibold min-w-[200px] shadow-2xl hover:shadow-gray-800/50 transition-all duration-300 bg-transparent border-white/30 hover:border-white/50"
                >
                  {t("hero.supportButton")}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  )
}
