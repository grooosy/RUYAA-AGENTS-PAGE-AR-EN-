"use client"

import { useLanguage } from "@/contexts/LanguageContext"
import { Mail, MapPin } from "lucide-react"

export default function Footer() {
  const { t, isRTL } = useLanguage()

  const footerSections = [
    {
      title: t("footer.services.title"),
      links: [
        t("footer.services.aiAssistant"),
        t("footer.services.automation"),
        t("footer.services.analytics"),
        t("footer.services.integration"),
      ],
    },
    {
      title: t("footer.company.title"),
      links: [
        t("footer.company.about"),
        t("footer.company.careers"),
        t("footer.company.blog"),
        t("footer.company.news"),
      ],
    },
    {
      title: t("footer.support.title"),
      links: [
        t("footer.support.help"),
        t("footer.support.documentation"),
        t("footer.support.contact"),
        t("footer.support.status"),
      ],
    },
  ]

  return (
    <footer className="bg-black/30 backdrop-blur-sm border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <h3 className={`text-2xl font-bold text-white mb-4 ${isRTL ? "font-arabic" : ""}`}>{t("brand.name")}</h3>
            <p className={`text-gray-300 mb-4 ${isRTL ? "font-arabic" : ""}`}>{t("footer.description")}</p>
            <div className="space-y-2">
              <div className="flex items-center text-gray-300">
                <Mail className="w-4 h-4 mr-2" />
                <span>info@ruyaacapital.com</span>
              </div>
              <div className="flex items-center text-gray-300">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{t("footer.location")}</span>
              </div>
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h4 className={`text-lg font-semibold text-white mb-4 ${isRTL ? "font-arabic" : ""}`}>{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href="#"
                      className={`text-gray-300 hover:text-white transition-colors duration-200 ${isRTL ? "font-arabic" : ""}`}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className={`text-gray-400 text-sm ${isRTL ? "font-arabic" : ""}`}>{t("footer.copyright")}</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                {t("footer.privacy")}
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                {t("footer.terms")}
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                {t("footer.cookies")}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
