"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { useLanguage } from "@/contexts/LanguageContext"
import { useAuth } from "@/lib/auth/auth-context"
import { Button } from "@/components/ui/button"
import { Menu, X, Globe, User, LogOut, Settings, ChevronDown } from "lucide-react"
import AuthModal from "./auth/AuthModal"
import UserProfile from "./auth/UserProfile"

export default function Header() {
  const { language, setLanguage, translations } = useLanguage()
  const { user, signOut } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showLangMenu, setShowLangMenu] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navigation = [
    { name: language === "ar" ? "الرئيسية" : "Home", href: "#" },
    { name: language === "ar" ? "الخدمات" : "Services", href: "#features" },
    { name: language === "ar" ? "الأسعار" : "Pricing", href: "#pricing" },
    { name: language === "ar" ? "من نحن" : "About", href: "#about" },
    { name: language === "ar" ? "تواصل معنا" : "Contact", href: "#contact" },
  ]

  const handleSignOut = async () => {
    await signOut()
    setShowUserMenu(false)
  }

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-black/80 backdrop-blur-lg border-b border-white/10" : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
              <Image
                src="/images/ruyaa-ai-logo.png"
                alt="Ruyaa Capital"
                width={120}
                height={48}
                className="drop-shadow-lg"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8 rtl:space-x-reverse">
              {navigation.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className="text-white hover:text-cyan-400 transition-colors duration-300 font-medium"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              {/* Language Selector */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="text-white hover:text-cyan-400 hover:bg-white/10"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  {language === "ar" ? "العربية" : "English"}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
                <AnimatePresence>
                  {showLangMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full mt-2 right-0 bg-black/90 backdrop-blur-lg border border-white/20 rounded-lg shadow-xl min-w-[120px]"
                    >
                      <button
                        onClick={() => {
                          setLanguage("ar")
                          setShowLangMenu(false)
                        }}
                        className="w-full px-4 py-2 text-left text-white hover:bg-white/10 rounded-t-lg transition-colors duration-200"
                      >
                        العربية
                      </button>
                      <button
                        onClick={() => {
                          setLanguage("en")
                          setShowLangMenu(false)
                        }}
                        className="w-full px-4 py-2 text-left text-white hover:bg-white/10 rounded-b-lg transition-colors duration-200"
                      >
                        English
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Menu or Auth Button */}
              {user ? (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="text-white hover:text-cyan-400 hover:bg-white/10"
                  >
                    <User className="w-4 h-4 mr-2" />
                    {user.user_metadata?.full_name || user.email}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full mt-2 right-0 bg-black/90 backdrop-blur-lg border border-white/20 rounded-lg shadow-xl min-w-[180px]"
                      >
                        <button
                          onClick={() => setShowUserMenu(false)}
                          className="w-full px-4 py-2 text-left text-white hover:bg-white/10 rounded-t-lg transition-colors duration-200 flex items-center"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          {language === "ar" ? "الإعدادات" : "Settings"}
                        </button>
                        <button
                          onClick={handleSignOut}
                          className="w-full px-4 py-2 text-left text-white hover:bg-white/10 rounded-b-lg transition-colors duration-200 flex items-center"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          {language === "ar" ? "تسجيل الخروج" : "Sign Out"}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 btn-3d"
                >
                  {language === "ar" ? "تسجيل الدخول" : "Sign In"}
                </Button>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden text-white hover:text-cyan-400 hover:bg-white/10"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-black/95 backdrop-blur-lg border-t border-white/10"
            >
              <div className="container mx-auto px-4 py-6">
                <nav className="space-y-4">
                  {navigation.map((item, index) => (
                    <Link
                      key={index}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="block text-white hover:text-cyan-400 transition-colors duration-300 font-medium py-2"
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* User Profile Modal */}
      {user && <UserProfile isOpen={showUserMenu} onClose={() => setShowUserMenu(false)} />}
    </>
  )
}
