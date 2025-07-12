"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Bot, MessageSquare, Zap, Activity } from "lucide-react"
import Image from "next/image"
import { useLanguage } from "@/contexts/LanguageContext"

export default function Features() {
  const { t, language, isRTL } = useLanguage()
  const cardRef = useRef<HTMLDivElement>(null)
  const floatingAnimationRef = useRef<number>()

  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    // Check if device is mobile or has reduced motion preference
    const isMobile = window.innerWidth <= 768
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (isMobile || prefersReducedMotion) {
      // Simple mobile-friendly animations
      card.style.animation = "subtleFloat 4s ease-in-out infinite"
      return
    }

    let isHovering = false
    let animationId: number
    let currentRotateX = 0
    let currentRotateY = 0
    let currentScale = 1
    let targetRotateX = 0
    let targetRotateY = 0
    let targetScale = 1
    let floatingOffset = 0

    // Floating animation
    const startFloating = () => {
      const animate = (timestamp: number) => {
        if (!isHovering) {
          floatingOffset = Math.sin(timestamp * 0.001) * 3
          card.style.transform = `translateY(${floatingOffset}px) rotateX(${currentRotateX}deg) rotateY(${currentRotateY}deg) scale(${currentScale})`
        }
        floatingAnimationRef.current = requestAnimationFrame(animate)
      }
      floatingAnimationRef.current = requestAnimationFrame(animate)
    }

    // 3D Tilt Effect
    const handleMouseMove = (e: MouseEvent) => {
      if (!card) return

      const rect = card.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const mouseX = e.clientX - centerX
      const mouseY = e.clientY - centerY

      const rotateX = (mouseY / rect.height) * -15
      const rotateY = (mouseX / rect.width) * 15

      targetRotateX = Math.max(-15, Math.min(15, rotateX))
      targetRotateY = Math.max(-15, Math.min(15, rotateY))
      targetScale = 1.05
    }

    const handleMouseEnter = () => {
      isHovering = true
      card.style.transition = "transform 0.1s ease-out"
    }

    const handleMouseLeave = () => {
      isHovering = false
      targetRotateX = 0
      targetRotateY = 0
      targetScale = 1
      card.style.transition = "transform 0.5s ease-out"
    }

    // Smooth animation loop
    const animate = () => {
      // Lerp for smooth transitions
      currentRotateX += (targetRotateX - currentRotateX) * 0.1
      currentRotateY += (targetRotateY - currentRotateY) * 0.1
      currentScale += (targetScale - currentScale) * 0.1

      if (isHovering) {
        card.style.transform = `translateY(${floatingOffset}px) rotateX(${currentRotateX}deg) rotateY(${currentRotateY}deg) scale(${currentScale})`
      }

      animationId = requestAnimationFrame(animate)
    }

    // Event listeners
    card.addEventListener("mousemove", handleMouseMove)
    card.addEventListener("mouseenter", handleMouseEnter)
    card.addEventListener("mouseleave", handleMouseLeave)

    // Start animations
    startFloating()
    animate()

    return () => {
      card.removeEventListener("mousemove", handleMouseMove)
      card.removeEventListener("mouseenter", handleMouseEnter)
      card.removeEventListener("mouseleave", handleMouseLeave)
      if (animationId) cancelAnimationFrame(animationId)
      if (floatingAnimationRef.current) cancelAnimationFrame(floatingAnimationRef.current)
    }
  }, [])

  return (
    <section id="ai-assistant" className="py-20 bg-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/10 via-transparent to-gray-800/10" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className={`text-4xl md:text-5xl font-bold text-white mb-6 ${isRTL ? "font-arabic" : ""}`}>
            {t("features.title")}
          </h2>
          <p className={`text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed ${isRTL ? "font-arabic" : ""}`}>
            {t("features.subtitle")}
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-black/90 backdrop-blur-xl rounded-2xl border border-gray-800/50 shadow-2xl overflow-hidden group floating-card"
            style={{
              transformStyle: "preserve-3d",
              willChange: "transform",
            }}
          >
            <div className={`grid lg:grid-cols-2 gap-0 ${isRTL ? "lg:grid-cols-2" : ""}`}>
              {/* Image Side */}
              <div className={`${isRTL ? "lg:order-2" : "order-1"} relative`}>
                <div className="relative h-full min-h-[400px] lg:min-h-[500px]">
                  <Image
                    src="/images/ruyaa-agent-interface.png"
                    alt={t("features.aiAssistant.imageAlt")}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/60" />
                </div>
              </div>

              {/* Content Side */}
              <div className={`${isRTL ? "lg:order-1" : "order-2"} p-8 lg:p-12 flex flex-col justify-center`}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
                    <Bot className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className={`text-2xl lg:text-3xl font-bold text-white ${isRTL ? "font-arabic" : ""}`}>
                    {t("features.aiAssistant.title")}
                  </h3>
                </div>

                <p className={`text-gray-300 text-lg leading-relaxed mb-8 ${isRTL ? "font-arabic text-right" : ""}`}>
                  {t("features.aiAssistant.description")}
                </p>

                {/* Feature List */}
                <div className="space-y-4">
                  {[
                    { icon: MessageSquare, text: t("features.aiAssistant.feature1") },
                    { icon: Zap, text: t("features.aiAssistant.feature2") },
                    { icon: Activity, text: t("features.aiAssistant.feature3") },
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
                    >
                      <div className="p-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
                        <feature.icon className="w-5 h-5 text-gray-300" />
                      </div>
                      <span className={`text-gray-300 ${isRTL ? "font-arabic" : ""}`}>{feature.text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
