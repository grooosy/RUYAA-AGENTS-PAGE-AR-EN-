"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Users, TrendingUp, Briefcase, Building2 } from "lucide-react"
import { useEffect } from "react"
import { useLanguage } from "@/contexts/LanguageContext"

export default function Pricing() {
  const { t } = useLanguage()

  useEffect(() => {
    // Initialize 3D effects for service cards
    const initializeEnhancedCards = () => {
      const enhancedCards = document.querySelectorAll(".enhanced-card-3d")
      const isMobile = window.innerWidth <= 768

      if (isMobile) {
        // Disable 3D effects on mobile for performance
        enhancedCards.forEach((card) => {
          card.classList.add("mobile-optimized")
        })
        return
      }

      enhancedCards.forEach((card) => {
        const cardElement = card as HTMLElement

        const handleMouseMove = (e: MouseEvent) => {
          const rect = cardElement.getBoundingClientRect()
          const x = e.clientX - rect.left
          const y = e.clientY - rect.top

          const centerX = rect.width / 2
          const centerY = rect.height / 2

          const rotateX = (y - centerY) / 25 // Reduced sensitivity for smoother effect
          const rotateY = (centerX - x) / 25 // Reduced sensitivity for smoother effect

          cardElement.style.transform = `
            perspective(1500px) 
            rotateX(${rotateX}deg) 
            rotateY(${rotateY}deg) 
            translateZ(10px)
            scale(1.02)
          `

          // Subtle dynamic glow effect
          const glowX = (x / rect.width) * 100
          const glowY = (y / rect.height) * 100

          const glowElement = cardElement.querySelector(".absolute.inset-0.rounded-xl") as HTMLElement
          if (glowElement) {
            glowElement.style.background = `
              radial-gradient(circle at ${glowX}% ${glowY}%, 
              rgba(6, 182, 212, 0.15) 0%, 
              transparent 50%)
            `
          }
        }

        const handleMouseLeave = () => {
          cardElement.style.transform = "perspective(1500px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)"
          cardElement.style.transition = "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"

          const glowElement = cardElement.querySelector(".absolute.inset-0.rounded-xl") as HTMLElement
          if (glowElement) {
            glowElement.style.background = "radial-gradient(circle, transparent 0%, transparent 100%)"
          }
        }

        const handleMouseEnter = () => {
          cardElement.style.transition = "none"
        }

        cardElement.addEventListener("mousemove", handleMouseMove)
        cardElement.addEventListener("mouseleave", handleMouseLeave)
        cardElement.addEventListener("mouseenter", handleMouseEnter)
      })
    }

    // Call the enhanced initialization
    initializeEnhancedCards()
  }, [])

  const services = [
    {
      title: t("services.service1.title"),
      description: t("services.service1.description"),
      image: "/images/investment-solutions.png",
      icon: <TrendingUp className="w-8 h-8" />,
    },
    {
      title: t("services.service2.title"),
      description: t("services.service2.description"),
      image: "/images/customer-service-agent.png",
      icon: <Users className="w-8 h-8" />,
    },
    {
      title: t("services.service3.title"),
      description: t("services.service3.description"),
      image: "/images/specialized-agent.png",
      icon: <Briefcase className="w-8 h-8" />,
    },
    {
      title: t("services.service4.title"),
      description: t("services.service4.description"),
      image: "/images/business-management-team.png",
      icon: <Building2 className="w-8 h-8" />,
    },
  ]

  return (
    <div className="py-20 relative z-10">
      {/* Distinguished Services Section */}
      <section id="services" className="mb-32 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white drop-shadow-lg">{t("services.title")}</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="service-card-3d rounded-xl overflow-hidden backdrop-blur-sm border border-cyan-500/20 cursor-pointer group hover:border-cyan-400/40 transition-all duration-300"
                style={{
                  transformStyle: "preserve-3d",
                  background: "rgba(17, 24, 39, 0.7)",
                }}
              >
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={service.image || "/placeholder.svg"}
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    priority={index < 2} // Prioritize loading for first two images
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10" />
                  <div className="absolute top-4 right-4 bg-cyan-500/20 backdrop-blur-sm rounded-full p-2 border border-cyan-400/30">
                    <div className="text-cyan-400 drop-shadow-lg">{service.icon}</div>
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="text-cyan-400 ml-4 drop-shadow-lg">{service.icon}</div>
                    <h3 className="text-xl font-bold text-white drop-shadow-md leading-tight">{service.title}</h3>
                  </div>
                  <p className="text-gray-300 leading-relaxed text-base">{service.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Training and Development Center */}
      <section id="training" className="mb-32">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white drop-shadow-lg">{t("training.title")}</h2>
          </motion.div>

          <div className="flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="service-card-3d rounded-xl overflow-hidden backdrop-blur-sm border border-cyan-500/20 cursor-pointer group hover:border-cyan-400/40 transition-all duration-300 max-w-4xl w-full"
              style={{
                transformStyle: "preserve-3d",
                background: "rgba(17, 24, 39, 0.7)",
              }}
            >
              <div className="relative h-96 md:h-[500px] overflow-hidden">
                <Image
                  src="/images/new-client-dashboard.png"
                  alt="Training and Development Center"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <p className="text-lg text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">{t("training.description")}</p>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white drop-shadow-lg">{t("contact.title")}</h2>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 xl:gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-white drop-shadow-md">{t("contact.technicalSupport")}</h3>
                  <p className="text-lg text-gray-300 leading-relaxed">{t("contact.supportDescription")}</p>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-4 text-white drop-shadow-md">
                    {t("contact.relationshipManager")}
                  </h3>
                  <p className="text-lg text-gray-300 leading-relaxed">{t("contact.managerDescription")}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href="https://wa.me/963940632191"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-2xl hover:shadow-green-500/25 transition-all duration-300 min-w-[200px]"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.787" />
                    </svg>
                    {t("contact.whatsappButton")}
                  </a>
                  <a
                    href="tel:+963940632191"
                    className="inline-flex items-center justify-center gap-3 border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black px-8 py-4 text-lg font-semibold bg-transparent shadow-2xl hover:shadow-cyan-400/25 transition-all duration-300 rounded-lg min-w-[200px]"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    {t("contact.callButton")}
                  </a>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            ></motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
