"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/LanguageContext"
import { useAuth } from "@/lib/auth/auth-context"
import AuthModal from "@/components/auth/AuthModal"
import UserProfile from "@/components/auth/UserProfile"
import { Menu, X, Globe } from "lucide-react"

export default function Header() {
  const { t, language, setLanguage, isRTL } = useLanguage()
  const { user } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  const toggleLanguage = () => {
    setLanguage(language === "ar" ? "en" : "ar")
  }

  const navigation = [
    { name: t("nav.home"), href: "#home" },
    { name: t("nav.features"), href: "#features" },
    { name: t("nav.pricing"), href: "#pricing" },
    { name: t("nav.contact"), href: "#contact" },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className={`text-2xl font-bold text-white ${isRTL ? "font-arabic" : ""}`}>{t("brand.name")}</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`text-gray-300 hover:text-white transition-colors duration-200 ${isRTL ? "font-arabic" : ""}`}
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={toggleLanguage} className="text-gray-300 hover:text-white">
              <Globe className="w-4 h-4 mr-2" />
              {language === "ar" ? "EN" : "العربية"}
            </Button>

            {user ? (
              <UserProfile />
            ) : (
              <Button variant="primary" onClick={() => setIsAuthModalOpen(true)} className="text-sm">
                {t("auth.signIn")}
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-black/40 backdrop-blur-md rounded-lg mt-2">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 text-gray-300 hover:text-white transition-colors duration-200 ${isRTL ? "font-arabic text-right" : ""}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <div className="border-t border-gray-700 pt-3 mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleLanguage}
                  className="w-full justify-start text-gray-300 hover:text-white mb-2"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  {language === "ar" ? "English" : "العربية"}
                </Button>
                {user ? (
                  <UserProfile />
                ) : (
                  <Button
                    variant="primary"
                    onClick={() => {
                      setIsAuthModalOpen(true)
                      setIsMenuOpen(false)
                    }}
                    className="w-full"
                  >
                    {t("auth.signIn")}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </header>
  )
}
