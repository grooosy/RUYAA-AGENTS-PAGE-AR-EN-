"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { useLanguage } from "@/contexts/LanguageContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, ArrowRight, ArrowLeft, Send } from "lucide-react"

export default function Footer() {
  const { language } = useLanguage()

  const footerSections = [
    {
      title: language === "ar" ? "الخدمات" : "Services",
      links: [
        { name: language === "ar" ? "الذكاء الاصطناعي" : "AI Solutions", href: "#" },
        { name: language === "ar" ? "تحليل البيانات" : "Data Analysis", href: "#" },
        { name: language === "ar" ? "أتمتة العمليات" : "Process Automation", href: "#" },
        { name: language === "ar" ? "الاستشارات" : "Consulting", href: "#" },
      ],
    },
    {
      title: language === "ar" ? "الشركة" : "Company",
      links: [
        { name: language === "ar" ? "من نحن" : "About Us", href: "#" },
        { name: language === "ar" ? "فريق العمل" : "Our Team", href: "#" },
        { name: language === "ar" ? "الوظائف" : "Careers", href: "#" },
        { name: language === "ar" ? "الأخبار" : "News", href: "#" },
      ],
    },
    {
      title: language === "ar" ? "الدعم" : "Support",
      links: [
        { name: language === "ar" ? "مركز المساعدة" : "Help Center", href: "#" },
        { name: language === "ar" ? "التوثيق" : "Documentation", href: "#" },
        { name: language === "ar" ? "تواصل معنا" : "Contact Us", href: "#" },
        { name: language === "ar" ? "الحالة" : "Status", href: "#" },
      ],
    },
  ]

  const contactInfo = [
    {
      icon: Mail,
      text: "admin@ruyaacapital.com",
      href: "mailto:admin@ruyaacapital.com",
    },
    {
      icon: Phone,
      text: "+966 50 123 4567",
      href: "tel:+966501234567",
    },
    {
      icon: MapPin,
      text: language === "ar" ? "الرياض، المملكة العربية السعودية" : "Riyadh, Saudi Arabia",
      href: "#",
    },
  ]

  const socialLinks = [
    { icon: Facebook, href: "#", name: "Facebook" },
    { icon: Twitter, href: "#", name: "Twitter" },
    { icon: Linkedin, href: "#", name: "LinkedIn" },
    { icon: Instagram, href: "#", name: "Instagram" },
  ]

  return (
    <footer className="relative py-20 mt-20">
      <div className="section-overlay">
        <div className="container mx-auto px-4">
          {/* Main Footer Content */}
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-12 mb-12">
            {/* Company Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div>
                <Image
                  src="/images/ruyaa-ai-logo.png"
                  alt="Ruyaa Capital Logo"
                  width={150}
                  height={60}
                  className="mb-4"
                />
                <p className="text-gray-300 leading-relaxed">
                  {language === "ar"
                    ? "رؤيا كابيتال - شريكك في التحول الرقمي وحلول الذكاء الاصطناعي المتقدمة"
                    : "Ruyaa Capital - Your partner in digital transformation and advanced AI solutions"}
                </p>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                {contactInfo.map((contact, index) => {
                  const IconComponent = contact.icon
                  return (
                    <Link
                      key={index}
                      href={contact.href}
                      className="flex items-center text-gray-300 hover:text-white transition-colors duration-300"
                    >
                      <IconComponent className="w-5 h-5 mr-3 text-cyan-400" />
                      <span>{contact.text}</span>
                    </Link>
                  )
                })}
              </div>

              {/* Social Links */}
              <div className="flex space-x-4 rtl:space-x-reverse">
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon
                  return (
                    <Link
                      key={index}
                      href={social.href}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-all duration-300 btn-3d"
                      aria-label={social.name}
                    >
                      <IconComponent className="w-5 h-5" />
                    </Link>
                  )
                })}
              </div>
            </motion.div>

            {/* Footer Sections */}
            {footerSections.map((section, sectionIndex) => (
              <motion.div
                key={sectionIndex}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: (sectionIndex + 1) * 0.1 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <h3 className="text-xl font-bold text-white">{section.title}</h3>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link
                        href={link.href}
                        className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center group"
                      >
                        <span>{link.name}</span>
                        {language === "ar" ? (
                          <ArrowLeft className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 group-hover:-translate-x-1 transition-all duration-300" />
                        ) : (
                          <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Newsletter Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="content-card rounded-2xl p-8 mb-12"
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">
                {language === "ar" ? "اشترك في نشرتنا الإخبارية" : "Subscribe to Our Newsletter"}
              </h3>
              <p className="text-gray-300">
                {language === "ar"
                  ? "احصل على آخر الأخبار والتحديثات حول حلول الذكاء الاصطناعي"
                  : "Get the latest news and updates about AI solutions"}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder={language === "ar" ? "أدخل بريدك الإلكتروني" : "Enter your email"}
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-cyan-400"
              />
              <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-6 btn-3d">
                <Send className="w-4 h-4 mr-2" />
                {language === "ar" ? "اشترك" : "Subscribe"}
              </Button>
            </div>
          </motion.div>

          {/* Bottom Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
            className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0"
          >
            <div className="text-gray-400 text-sm">
              © 2024 Ruyaa Capital. {language === "ar" ? "جميع الحقوق محفوظة" : "All rights reserved"}.
            </div>
            <div className="flex space-x-6 rtl:space-x-reverse text-sm">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                {language === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                {language === "ar" ? "شروط الاستخدام" : "Terms of Service"}
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                {language === "ar" ? "ملفات تعريف الارتباط" : "Cookies"}
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl floating-element" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl floating-element" />
      </div>
    </footer>
  )
}
