"use client"

import { motion } from "framer-motion"
import { useLanguage } from "@/contexts/LanguageContext"
import { Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
  const { t, language, isRTL } = useLanguage()

  const contactInfo = [
    {
      icon: Mail,
      label: "Email",
      value: "info@ruyaacapital.com",
      href: "mailto:info@ruyaacapital.com",
    },
    {
      icon: Phone,
      label: "Phone",
      value: "+963 940 632 191",
      href: "tel:+963940632191",
    },
    {
      icon: MapPin,
      label: "Location",
      value: "Damascus, Syria",
      href: "#",
    },
  ]

  const quickLinks = [
    { name: t("footer.home"), href: "#home" },
    { name: t("footer.services"), href: "#services" },
    { name: t("footer.features"), href: "#features" },
    { name: t("footer.contact"), href: "#contact" },
  ]

  const services = ["AI Customer Support", "Appointment Management", "Sales Automation", "Follow-up Management"]

  return (
    <footer id="contact" className="bg-black/95 backdrop-blur-xl border-t border-gray-800/50 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`${isRTL ? "text-right" : "text-left"}`}
          >
            <h3 className={`text-2xl font-bold text-white mb-4 ${isRTL ? "font-arabic" : ""}`}>
              {language === "ar" ? "رؤيا كابيتال" : "Ruyaa Capital"}
            </h3>
            <p className={`text-gray-300 mb-6 leading-relaxed ${isRTL ? "font-arabic" : ""}`}>
              {t("footer.description")}
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className={`${isRTL ? "text-right" : "text-left"}`}
          >
            <h4 className={`text-lg font-semibold text-white mb-4 ${isRTL ? "font-arabic" : ""}`}>
              {t("footer.quickLinks")}
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className={`text-gray-300 hover:text-white transition-colors duration-200 ${isRTL ? "font-arabic" : ""}`}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className={`${isRTL ? "text-right" : "text-left"}`}
          >
            <h4 className={`text-lg font-semibold text-white mb-4 ${isRTL ? "font-arabic" : ""}`}>
              {t("footer.services")}
            </h4>
            <ul className="space-y-2">
              {services.map((service, index) => (
                <li key={index}>
                  <span className={`text-gray-300 ${isRTL ? "font-arabic" : ""}`}>{service}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className={`${isRTL ? "text-right" : "text-left"}`}
          >
            <h4 className={`text-lg font-semibold text-white mb-4 ${isRTL ? "font-arabic" : ""}`}>
              {t("footer.contact")}
            </h4>
            <ul className="space-y-3">
              {contactInfo.map((info, index) => {
                const IconComponent = info.icon
                return (
                  <li key={index}>
                    <a
                      href={info.href}
                      className={`flex items-center gap-3 text-gray-300 hover:text-white transition-colors duration-200 ${
                        isRTL ? "flex-row-reverse" : ""
                      }`}
                    >
                      <IconComponent className="w-4 h-4 flex-shrink-0" />
                      <span className={`${isRTL ? "font-arabic" : ""}`}>{info.value}</span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="border-t border-gray-800/50 pt-8 text-center"
        >
          <p className={`text-gray-400 ${isRTL ? "font-arabic" : ""}`}>
            {t("footer.copyright")} {new Date().getFullYear()} {language === "ar" ? "رؤيا كابيتال" : "Ruyaa Capital"}.{" "}
            {t("footer.allRightsReserved")}
          </p>
        </motion.div>
      </div>
    </footer>
  )
}
