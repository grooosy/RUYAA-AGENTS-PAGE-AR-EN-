"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/LanguageContext"
import { useAuth } from "@/lib/auth/auth-context"
import AuthModal from "@/components/auth/AuthModal"

export default function Hero() {
  const { t, isRTL } = useLanguage()
  const { user } = useAuth()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <h1
          className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-white text-shadow-lg ${isRTL ? "font-arabic" : ""}`}
        >
          {t("hero.title")}
        </h1>
        <p
          className={`text-xl sm:text-2xl mb-8 text-gray-200 text-shadow max-w-3xl mx-auto ${isRTL ? "font-arabic" : ""}`}
        >
          {t("hero.subtitle")}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {!user ? (
            <>
              <Button
                variant="primary"
                size="lg"
                onClick={() => setIsAuthModalOpen(true)}
                className="text-lg px-8 py-3 min-w-[200px]"
              >
                {t("hero.getStarted")}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-3 min-w-[200px] bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                {t("hero.learnMore")}
              </Button>
            </>
          ) : (
            <Button variant="primary" size="lg" className="text-lg px-8 py-3 min-w-[200px]">
              {t("hero.dashboard")}
            </Button>
          )}
        </div>
      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </section>
  )
}
