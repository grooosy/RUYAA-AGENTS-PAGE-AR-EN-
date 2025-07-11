"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Building2, TrendingUp, FileText } from "lucide-react"
import { useEffect } from "react"
import { useLanguage } from "@/contexts/LanguageContext"

export default function Features() {
  const { t } = useLanguage()

  useEffect(() => {
    // 3D Card Effect with Vanilla JavaScript
    const initializeCardEffects = () => {
      const cards = document.querySelectorAll(".card-3d")
      const isMobile = window.innerWidth <= 768

      if (isMobile) {
        // Disable 3D effects on mobile for performance
        cards.forEach((card) => {
          card.classList.add("mobile-optimized")
        })
        return
      }

      cards.forEach((card) => {
        const cardElement = card as HTMLElement

        const handleMouseMove = (e: MouseEvent) => {
          const rect = cardElement.getBoundingClientRect()
          const x = e.clientX - rect.left
          const y = e.clientY - rect.top

          const centerX = rect.width / 2
          const centerY = rect.height / 2

          const rotateX = (y - centerY) / 10
          const rotateY = (centerX - x) / 10

          cardElement.style.transform = `
            perspective(1000px) 
            rotateX(${rotateX}deg) 
            rotateY(${rotateY}deg) 
            translateZ(20px)
          `

          // Add glow effect
          const glowX = (x / rect.width) * 100
          const glowY = (y / rect.height) * 100

          cardElement.style.background = `
            radial-gradient(circle at ${glowX}% ${glowY}%, 
            rgba(6, 182, 212, 0.15) 0%, 
            rgba(17, 24, 39, 0.8) 50%)
          `
        }

        const handleMouseLeave = () => {
          cardElement.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)"
          cardElement.style.background = "rgba(17, 24, 39, 0.7)"
        }

        const handleMouseEnter = () => {
          cardElement.style.transition = "none"
        }

        const handleTransitionEnd = () => {
          cardElement.style.transition = "all 0.3s ease-out"
        }

        cardElement.addEventListener("mousemove", handleMouseMove)
        cardElement.addEventListener("mouseleave", handleMouseLeave)
        cardElement.addEventListener("mouseenter", handleMouseEnter)
        cardElement.addEventListener("transitionend", handleTransitionEnd)

        // Cleanup function
        return () => {
          cardElement.removeEventListener("mousemove", handleMouseMove)
          cardElement.removeEventListener("mouseleave", handleMouseLeave)
          cardElement.removeEventListener("mouseenter", handleMouseEnter)
          cardElement.removeEventListener("transitionend", handleTransitionEnd)
        }
      })
    }

    const cleanup = initializeCardEffects()

    // Reinitialize on window resize
    const handleResize = () => {
      cleanup && cleanup()
      setTimeout(initializeCardEffects, 100)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      cleanup && cleanup()
    }
  }, [])

  const aiAssistantFeatures = [
    {
      icon: <Building2 className="w-12 h-12" />,
      title: "إجراءات طلبات التمويل",
      description: "خطوات تقديم ومعالجة طلبات التمويل العقاري والشخصي.",
    },
    {
      icon: <TrendingUp className="w-12 h-12" />,
      title: "الاستثمارات المتوافقة مع الشريعة",
      description: "معلومات حول منتجاتنا الاستثمارية المتوافقة مع أحكام الشريعة الإسلامية.",
    },
    {
      icon: <FileText className="w-12 h-12" />,
      title: "فتح حساب جديد",
      description: "خطوات وإجراءات فتح حساب استثماري جديد للعملاء.",
    },
  ]

  return (
    <div className="py-20 bg-black relative z-10">
      {/* AI Assistant FAQ Section */}

      {/* AI Assistant Section */}
      <section className="mb-32 relative">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 xl:gap-16 items-center">
            {/* 3D Card on the left */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <div
                className="service-card service-card-3d cursor-pointer group h-96"
              >
                <div className="relative h-full overflow-hidden">
                  <Image
                    src="https://images.pexels.com/photos/3184287/pexels-photo-3184287.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop"
                    alt="Ruyaa Agent AI Interface"
                    fill
                    className="service-card-image"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                </div>
              </div>
            </motion.div>

            {/* Text content on the right */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <div className="space-y-6">
                <h2 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg leading-tight">
                  {t("aiAssistant.title")}
                </h2>
                <h3 className="text-2xl font-semibold text-cyan-400 drop-shadow-md">{t("aiAssistant.subtitle")}</h3>
                <div className="space-y-4">
                  <p className="text-lg text-gray-300 leading-relaxed">{t("aiAssistant.description1")}</p>
                  <p className="text-lg text-gray-300 leading-relaxed">{t("aiAssistant.description2")}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300"
                  >
                    {t("aiAssistant.tryButton")}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black px-8 py-4 text-lg font-semibold bg-transparent shadow-2xl hover:shadow-cyan-400/25 transition-all duration-300"
                  >
                    {t("aiAssistant.learnButton")}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
