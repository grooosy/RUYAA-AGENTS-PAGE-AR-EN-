"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { useLanguage } from "@/contexts/LanguageContext"
import { Button } from "@/components/ui/button"
import AuthModal from "@/components/auth/AuthModal"

export default function Pricing() {
  const { t, language, isRTL } = useLanguage()
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])
  const floatingAnimationsRef = useRef<number[]>([])
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  useEffect(() => {
    const isMobile = window.innerWidth <= 768
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (isMobile || prefersReducedMotion) {
      // Simple mobile animations
      cardsRef.current.forEach((card, index) => {
        if (card) {
          card.style.animation = `gentleFloat ${6 + index}s ease-in-out infinite`
          card.style.animationDelay = `${index * 0.5}s`
        }
      })
      return
    }

    // Enhanced 3D effects for desktop
    const setupCard3D = (card: HTMLDivElement, index: number) => {
      let isHovering = false
      let animationId: number
      let currentRotateX = 0
      let currentRotateY = 0
      let currentScale = 1
      let targetRotateX = 0
      let targetRotateY = 0
      let targetScale = 1
      let floatingOffset = 0

      // Floating animation with unique phase for each card
      const startFloating = () => {
        const animate = (timestamp: number) => {
          if (!isHovering) {
            const phase = (index * Math.PI) / 2 // Different phase for each card
            floatingOffset = Math.sin(timestamp * 0.0008 + phase) * 4 + Math.cos(timestamp * 0.0012 + phase) * 2
            card.style.transform = `translateY(${floatingOffset}px) rotateX(${currentRotateX}deg) rotateY(${currentRotateY}deg) scale(${currentScale})`
          }
          floatingAnimationsRef.current[index] = requestAnimationFrame(animate)
        }
        floatingAnimationsRef.current[index] = requestAnimationFrame(animate)
      }

      const handleMouseMove = (e: MouseEvent) => {
        const rect = card.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2

        const mouseX = e.clientX - centerX
        const mouseY = e.clientY - centerY

        const rotateX = (mouseY / rect.height) * -12
        const rotateY = (mouseX / rect.width) * 12

        targetRotateX = Math.max(-12, Math.min(12, rotateX))
        targetRotateY = Math.max(-12, Math.min(12, rotateY))
        targetScale = 1.03
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

      const animate = () => {
        currentRotateX += (targetRotateX - currentRotateX) * 0.1
        currentRotateY += (targetRotateY - currentRotateY) * 0.1
        currentScale += (targetScale - currentScale) * 0.1

        if (isHovering) {
          card.style.transform = `translateY(${floatingOffset}px) rotateX(${currentRotateX}deg) rotateY(${currentRotateY}deg) scale(${currentScale})`
        }

        animationId = requestAnimationFrame(animate)
      }

      card.addEventListener("mousemove", handleMouseMove)
      card.addEventListener("mouseenter", handleMouseEnter)
      card.addEventListener("mouseleave", handleMouseLeave)

      startFloating()
      animate()

      return () => {
        card.removeEventListener("mousemove", handleMouseMove)
        card.removeEventListener("mouseenter", handleMouseEnter)
        card.removeEventListener("mouseleave", handleMouseLeave)
        if (animationId) cancelAnimationFrame(animationId)
        if (floatingAnimationsRef.current[index]) {
          cancelAnimationFrame(floatingAnimationsRef.current[index])
        }
      }
    }

    // Setup 3D effects for service cards
    const cleanupFunctions: (() => void)[] = []
    cardsRef.current.forEach((card, index) => {
      if (card) {
        const cleanup = setupCard3D(card, index)
        cleanupFunctions.push(cleanup)
      }
    })

    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup())
    }
  }, [])

  const services = [
    {
      title: t("services.aiSupport.title"),
      description: t("services.aiSupport.description"),
      price: "$249",
      period: "/month",
      features: [
        t("services.aiSupport.feature1"),
        t("services.aiSupport.feature2"),
        t("services.aiSupport.feature3"),
        "تكامل البريد الإلكتروني",
        "لوحة تحكم أساسية",
        "دعم ساعات العمل",
      ],
      popular: false,
    },
    {
      title: t("services.salesAutomation.title"),
      description: t("services.salesAutomation.description"),
      price: "$449",
      period: "/month",
      features: [
        "كل ما في الخطة الأساسية",
        t("services.salesAutomation.feature1"),
        t("services.salesAutomation.feature2"),
        t("services.salesAutomation.feature3"),
        "تواصل متعدد القنوات",
        "تقارير وتحليلات متقدمة",
        "دعم أولوية",
      ],
      popular: true,
    },
    {
      title: t("services.socialMedia.title"),
      description: t("services.socialMedia.description"),
      price: "$749",
      period: "/month",
      features: [
        "كل ما في الخطة المهنية",
        t("services.socialMedia.feature1"),
        t("services.socialMedia.feature2"),
        "أتمتة سير العمل المتقدمة",
        "تكاملات مخصصة",
        "مدير حساب مخصص",
        "دعم متميز 24/7",
      ],
      popular: false,
    },
    {
      title: t("services.customerService.title"),
      description: t("services.customerService.description"),
      price: "مخصص",
      period: "التسعير",
      features: [
        t("services.customerService.feature1"),
        t("services.customerService.feature2"),
        t("services.customerService.feature3"),
        "فريق تطوير مخصص",
        "خيارات النشر المحلي",
        "أمان على مستوى المؤسسة",
        "حلول العلامة البيضاء",
      ],
      popular: false,
    },
  ]

  return (
    <section id="services" className="py-20 bg-black relative overflow-hidden">
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
            {t("services.title")}
          </h2>
          <p className={`text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed ${isRTL ? "font-arabic" : ""}`}>
            Choose the perfect AI solution for your business needs with transparent pricing
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {services.map((service, index) => (
            <motion.div
              key={index}
              ref={(el) => (cardsRef.current[index] = el)}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-black/90 backdrop-blur-xl rounded-2xl border ${
                service.popular ? "border-gray-600" : "border-gray-800/50"
              } shadow-2xl overflow-hidden group floating-card`}
              style={{
                transformStyle: "preserve-3d",
                willChange: "transform",
              }}
            >
              {service.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gray-700 text-white text-center py-2 text-sm font-medium">
                  {isRTL ? "الأكثر شعبية" : "Most Popular"}
                </div>
              )}

              <div className="p-6">
                <div className="mb-6">
                  <h3 className={`text-xl font-bold text-white mb-2 ${isRTL ? "font-arabic text-right" : ""}`}>
                    {service.title}
                  </h3>
                  <p className={`text-gray-300 text-sm leading-relaxed ${isRTL ? "font-arabic text-right" : ""}`}>
                    {service.description}
                  </p>
                </div>

                <div className={`mb-6 ${isRTL ? "text-right" : ""}`}>
                  <div className="text-3xl font-bold text-white">
                    {service.price}
                    <span className="text-lg text-gray-400 font-normal">{service.period}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {service.features.map((feature, featureIndex) => (
                    <div
                      key={featureIndex}
                      className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse text-right" : ""}`}
                    >
                      <div className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0"></div>
                      <span className={`text-gray-400 text-sm ${isRTL ? "font-arabic" : ""}`}>{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  variant={service.popular ? "primary" : "outline"}
                  className={`w-full ${service.popular ? "bg-slate-900 hover:bg-slate-800" : "border-gray-600 text-white hover:bg-gray-800"} ${isRTL ? "font-arabic" : ""}`}
                  onClick={() => setIsAuthModalOpen(true)}
                >
                  {service.price === "مخصص" || service.price === "Custom"
                    ? isRTL
                      ? "تواصل مع المبيعات"
                      : "Contact Sales"
                    : isRTL
                      ? "ابدأ الآن"
                      : "Get Started"}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative bg-black/90 backdrop-blur-xl rounded-2xl border border-gray-800/50 shadow-2xl overflow-hidden group floating-card"
          style={{
            transformStyle: "preserve-3d",
            willChange: "transform",
          }}
        >
          <div className="p-8 lg:p-12 text-center">
            <h3 className={`text-2xl font-bold text-white mb-4 ${isRTL ? "font-arabic" : ""}`}>
              {isRTL ? "هل أنت مستعد للبدء؟" : "Ready to Get Started?"}
            </h3>
            <p className={`text-gray-300 mb-8 max-w-2xl mx-auto ${isRTL ? "font-arabic" : ""}`}>
              {isRTL
                ? "تواصل معنا اليوم لمناقشة متطلباتك المحددة والحصول على حل مخصص لعملك."
                : "Contact us today to discuss your specific requirements and get a customized solution for your business."}
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              {/* WhatsApp Button */}
              <a
                href="https://wa.me/963940632191"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-6 py-3 bg-[#25D366] hover:bg-[#20BA5A] rounded-xl transition-colors duration-200 text-white font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.787" />
                </svg>
                <span className={isRTL ? "font-arabic" : ""}>{isRTL ? "راسلنا على واتساب" : "Chat on WhatsApp"}</span>
              </a>

              {/* Phone Button */}
              <a
                href="tel:+963940632191"
                className="flex items-center gap-3 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors duration-200 text-white font-medium border border-gray-600"
              >
                <span>Call Us</span>
              </a>

              {/* Get Your Agent Button */}
              <Button
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white"
                onClick={() => setIsAuthModalOpen(true)}
              >
                GET YOUR AGENT
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </section>
  )
}
