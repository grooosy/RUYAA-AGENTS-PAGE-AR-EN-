"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/LanguageContext"
import { AuthModal } from "@/components/auth/AuthModal"

export function Hero() {
  const { language, translations } = useLanguage()
  const [showAuthModal, setShowAuthModal] = useState(false)

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white text-shadow-lg">
              {translations.hero.title}
            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl text-gray-200 max-w-4xl mx-auto text-shadow">
              {translations.hero.subtitle}
            </p>
          </div>

          <div className="space-y-6">
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto text-shadow">
              {translations.hero.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="btn-3d bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 text-lg font-semibold shadow-xl"
                onClick={() => setShowAuthModal(true)}
              >
                {translations.hero.cta}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="btn-3d border-white text-white hover:bg-white hover:text-slate-900 px-8 py-3 text-lg font-semibold shadow-xl bg-transparent"
              >
                {translations.hero.learnMore}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </section>
  )
}
