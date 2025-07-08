"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Image from "next/image"
import { useLanguage } from "@/contexts/LanguageContext"

export default function Hero() {
  const { t } = useLanguage()

  return (
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
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight drop-shadow-2xl">
            {t("hero.title")}
          </h1>

          <p className="text-xl md:text-2xl text-gray-200 mb-12 leading-relaxed drop-shadow-lg">{t("hero.subtitle")}</p>

          <div className="flex flex-col items-center gap-6">
            {/* Main Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold min-w-[200px] shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300"
              >
                {t("hero.loginButton")}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black px-8 py-4 text-lg font-semibold min-w-[200px] bg-transparent shadow-2xl hover:shadow-cyan-400/25 transition-all duration-300"
              >
                {t("hero.supportButton")}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
