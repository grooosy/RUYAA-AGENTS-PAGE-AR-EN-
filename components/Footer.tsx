"use client"

import { motion } from "framer-motion"
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from 'lucide-react'
import Image from "next/image"
import { useLanguage } from "@/contexts/LanguageContext"

export default function Footer() {
  const { t, isRTL } = useLanguage()

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const footerLinks = {
    [t("footer.services")]: ["الخدمات الاستشارية", "الحلول الاستثمارية", "التمويل العقاري", "إدارة الثروات"],
    [t("footer.support")]: ["مركز المساعدة", "الأسئلة الشائعة", "تواصل معنا", "الدعم الفني"],
    [t("footer.company")]: ["من نحن", "رؤيتنا ورسالتنا", "فريق العمل", "الوظائف"],
  }

  const socialLinks = [
    { icon: <Facebook className="w-5 h-5" />, href: "#", label: "Facebook" },
    { icon: <Twitter className="w-5 h-5" />, href: "#", label: "Twitter" },
    { icon: <Linkedin className="w-5 h-5" />, href: "#", label: "LinkedIn" },
    { icon: <Instagram className="w-5 h-5" />, href: "#", label: "Instagram" },
  ]

  return (
    <footer className="bg-black/80 backdrop-blur-xl text-white py-16 border-t border-cyan-500/20 relative z-10">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info with Logo */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <div className="flex items-center mb-6 cursor-pointer group" onClick={scrollToTop}>
              <Image
                src="/images/ruyaa-ai-logo.png"
                alt="Ruyaa AI Logo"
                width={40}
                height={40}
                className={`group-hover:scale-110 transition-transform duration-300 ${isRTL ? "ml-3" : "mr-3"}`}
              />
              <h3 className="text-2xl font-bold drop-shadow-lg group-hover:text-cyan-400 transition-colors duration-300">
                {isRTL ? "رؤيا كابيتال" : "Ruyaa Capital"}
              </h3>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">{t("footer.companyDescription")}</p>

            <div className="space-y-3">
              <div className="flex items-center text-gray-400">
                <MapPin className={`w-5 h-5 text-cyan-400 ${isRTL ? "ml-3" : "mr-3"}`} />
                <span>{t("footer.location")}</span>
              </div>

              <div className="flex items-center text-gray-400">
                <Mail className={`w-5 h-5 text-cyan-400 ${isRTL ? "ml-3" : "mr-3"}`} />
                <span>admin@ruyaacapital.com</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center">
                <Phone className={`w-5 h-5 text-cyan-400 ${isRTL ? "ml-3" : "mr-3"}`} />
                <a
                  href="tel:+963940632191"
                  className="text-gray-400 hover:text-cyan-400 hover:underline transition-colors duration-200"
                >
                  +963 940 632 191
                </a>
              </div>
              <div className="flex items-center">
                <svg
                  className={`w-5 h-5 text-cyan-400 ${isRTL ? "ml-3" : "mr-3"}`}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.787" />
                </svg>
                <a
                  href="https://wa.me/963940632191"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-cyan-400 hover:underline transition-colors duration-200"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </motion.div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([category, links], index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (index + 1) * 0.1 }}
            >
              <h4 className="text-lg font-semibold mb-6 drop-shadow-md">{category}</h4>
              <ul className="space-y-3">
                {links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors duration-200">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="border-t border-cyan-500/20 pt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-500 mb-4 md:mb-0">
              <p>
                &copy; 2024 {isRTL ? "رؤيا كابيتال" : "Ruyaa Capital"}. {t("footer.allRightsReserved")}
              </p>
            </div>

            <div className={`flex items-center ${isRTL ? "space-x-4 space-x-reverse" : "space-x-4"}`}>
              <span className={`text-gray-400 ${isRTL ? "ml-4" : "mr-4"}`}>{t("footer.followUs")}</span>
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="text-gray-400 hover:text-cyan-400 transition-colors duration-200 p-2 hover:bg-cyan-500/10 rounded-full"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
