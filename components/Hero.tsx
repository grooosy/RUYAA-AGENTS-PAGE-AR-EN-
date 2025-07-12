"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { useLanguage } from "@/contexts/LanguageContext"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Sparkles, Zap, Target } from "lucide-react"

export default function Hero() {
  const { language, translations } = useLanguage()
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      title: language === "ar" ? "حلول الذكاء الاصطناعي المتقدمة" : "Advanced AI Solutions",
      subtitle:
        language === "ar"
          ? "نحول أعمالك بتقنيات الذكاء الاصطناعي المبتكرة"
          : "Transform your business with innovative AI technologies",
      image: "/images/ai-assistant.png",
      icon: Sparkles,
    },
    {
      title: language === "ar" ? "أتمتة العمليات التجارية" : "Business Process Automation",
      subtitle:
        language === "ar"
          ? "زيادة الكفاءة وتقليل التكاليف من خلال الأتمتة الذكية"
          : "Increase efficiency and reduce costs through intelligent automation",
      image: "/images/smart-dashboard.png",
      icon: Zap,
    },
    {
      title: language === "ar" ? "استراتيجيات الاستثمار الذكية" : "Smart Investment Strategies",
      subtitle:
        language === "ar"
          ? "اتخاذ قرارات استثمارية مدروسة بدعم من الذكاء الاصطناعي"
          : "Make informed investment decisions with AI support",
      image: "/images/investment-solutions.png",
      icon: Target,
    },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const currentSlideData = slides[currentSlide]
  const IconComponent = currentSlideData.icon

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: language === "ar" ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className={`text-center lg:text-${language === "ar" ? "right" : "left"} space-y-8`}
          >
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex justify-center lg:justify-start mb-8"
            >
              <Image
                src="/images/ruyaa-ai-logo.png"
                alt="Ruyaa Capital Logo"
                width={200}
                height={80}
                className="drop-shadow-2xl"
                priority
              />
            </motion.div>

            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex justify-center lg:justify-start"
            >
              <div className="p-4 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-white/10">
                <IconComponent className="w-12 h-12 text-cyan-400" />
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight text-shadow-lg"
            >
              {currentSlideData.title}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-200 leading-relaxed text-shadow"
            >
              {currentSlideData.subtitle}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 btn-3d"
              >
                {language === "ar" ? "ابدأ الآن" : "Get Started"}
                {language === "ar" ? <ArrowLeft className="ml-2 w-5 h-5" /> : <ArrowRight className="ml-2 w-5 h-5" />}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-xl backdrop-blur-sm transition-all duration-300 btn-3d bg-transparent"
              >
                {language === "ar" ? "اعرف المزيد" : "Learn More"}
              </Button>
            </motion.div>

            {/* Navigation Dots */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex justify-center lg:justify-start space-x-2 rtl:space-x-reverse"
            >
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? "bg-cyan-400 shadow-lg shadow-cyan-400/50"
                      : "bg-white/30 hover:bg-white/50"
                  }`}
                />
              ))}
            </motion.div>
          </motion.div>

          {/* Image */}
          <motion.div
            key={`image-${currentSlide}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative floating-card">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-3xl blur-xl floating-glow" />
              <Image
                src={currentSlideData.image || "/placeholder.svg"}
                alt={currentSlideData.title}
                width={600}
                height={400}
                className="relative z-10 rounded-3xl shadow-2xl floating-element"
                priority
              />
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-white hover:bg-black/70 transition-all duration-300 btn-3d"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-white hover:bg-black/70 transition-all duration-300 btn-3d"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
          </motion.div>
        </div>
      </div>

      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl floating-element" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl floating-element" />
      </div>
    </section>
  )
}
