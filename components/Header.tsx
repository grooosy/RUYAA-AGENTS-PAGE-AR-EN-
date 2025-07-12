"use client"

import { useState, useEffect } from "react"
import { Moon, Sun, Menu, X, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Image from "next/image"
import { useLanguage } from "@/contexts/LanguageContext"
import { useAuth } from "@/lib/auth/auth-context"
import AuthModal from "@/components/auth/AuthModal"
import UserProfile from "@/components/auth/UserProfile"

export default function Header() {
  const [isDark, setIsDark] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const { language, setLanguage, t, isRTL } = useLanguage()
  const { user, loading } = useAuth()

  useEffect(() => {
    const stored = localStorage.getItem("theme")
    const prefersDark = stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)
    setIsDark(prefersDark)
    document.documentElement.classList.toggle("dark", prefersDark)
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    localStorage.setItem("theme", newTheme ? "dark" : "light")
    document.documentElement.classList.toggle("dark", newTheme)
  }

  const toggleLanguage = () => {
    setLanguage(language === "ar" ? "en" : "ar")
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const navItems = [
    { id: "home", label: t("header.home") },
    { id: "services", label: t("header.services") },
    { id: "ai-assistant", label: t("header.aiAssistant") },
    { id: "training", label: t("header.training") },
    { id: "contact", label: t("header.contact") },
  ]

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-cyan-500/20"
      >
        <div className="container mx-auto px-4 py-4">
          <div className={`flex items-center justify-between ${isRTL ? "flex-row" : "flex-row"}`}>
            {/* Logo - positioned based on language direction */}
            <div
              className={`flex items-center cursor-pointer group ${isRTL ? "order-1" : "order-1"}`}
              onClick={scrollToTop}
            >
              <Image
                src="/images/ruyaa-ai-logo.png"
                alt="Ruyaa AI Logo"
                width={50}
                height={50}
                className={`group-hover:scale-110 transition-transform duration-300 ${isRTL ? "ml-3" : "mr-3"}`}
              />
              <div className="text-2xl font-bold text-white drop-shadow-lg group-hover:text-cyan-400 transition-colors duration-300">
                {language === "ar" ? "رؤيا كابيتال" : "Ruyaa Capital"}
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav
              className={`hidden md:flex items-center ${isRTL ? "space-x-8 space-x-reverse order-2" : "space-x-8 order-2"}`}
            >
              {navItems.map((item, index) => (
                <a
                  key={index}
                  href={`#${item.id}`}
                  className="text-gray-300 hover:text-cyan-400 transition-all duration-300 hover:drop-shadow-lg"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Controls - Language, Theme, Auth, Mobile Menu */}
            <div className={`flex items-center ${isRTL ? "space-x-4 space-x-reverse order-3" : "space-x-4 order-3"}`}>
              {/* Language Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleLanguage}
                className="text-gray-300 hover:text-cyan-400 relative group"
                title={language === "ar" ? "Switch to English" : "التبديل إلى العربية"}
              >
                <Globe className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 text-xs font-bold text-cyan-400">
                  {language.toUpperCase()}
                </span>
              </Button>

              {/* Theme Toggle */}
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-gray-300 hover:text-cyan-400">
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              {/* Auth Section */}
              {loading ? (
                <div className="w-10 h-10 rounded-full bg-gray-800 animate-pulse" />
              ) : user ? (
                <UserProfile />
              ) : (
                <Button
                  onClick={() => setIsAuthModalOpen(true)}
                  variant="primary"
                  className="px-4 py-2 rounded-lg font-medium transition-all duration-300"
                >
                  {t("auth.signIn")}
                </Button>
              )}

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-gray-300 hover:text-cyan-400"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden mt-4 pb-4 border-t border-cyan-500/20 pt-4 bg-black/90 backdrop-blur-xl rounded-lg"
            >
              {navItems.map((item, index) => (
                <a
                  key={index}
                  href={`#${item.id}`}
                  className="block py-2 text-gray-300 hover:text-cyan-400 transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}

              {/* Mobile Auth Button */}
              {!user && (
                <div className="pt-4 border-t border-gray-700 mt-4">
                  <Button
                    onClick={() => {
                      setIsAuthModalOpen(true)
                      setIsMenuOpen(false)
                    }}
                    variant="primary"
                    className="w-full"
                  >
                    {t("auth.signIn")}
                  </Button>
                </div>
              )}
            </motion.nav>
          )}
        </div>
      </motion.header>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  )
}
