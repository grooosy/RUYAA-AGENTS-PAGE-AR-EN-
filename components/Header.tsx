"use client"

import { useState, useEffect } from "react"
import { Moon, Sun, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Image from "next/image"

export default function Header() {
  const [isDark, setIsDark] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const navItems = [
    { id: "home", label: "الرئيسية" },
    { id: "services", label: "خدماتنا" },
    { id: "ai-assistant", label: "المساعد الذكي" },
    { id: "training", label: "التدريب" },
    { id: "contact", label: "تواصل معنا" },
  ]

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-cyan-500/20"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center cursor-pointer group" onClick={scrollToTop}>
            <Image
              src="/images/ruyaa-ai-logo.png"
              alt="Ruyaa AI Logo"
              width={50}
              height={50}
              className="ml-3 group-hover:scale-110 transition-transform duration-300"
            />
            <div className="text-2xl font-bold text-white drop-shadow-lg group-hover:text-cyan-400 transition-colors duration-300">
              رؤيا كابيتال
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 space-x-reverse">
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

          {/* Theme Toggle & Mobile Menu */}
          <div className="flex items-center space-x-4 space-x-reverse">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-gray-300 hover:text-cyan-400">
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

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
          </motion.nav>
        )}
      </div>
    </motion.header>
  )
}
