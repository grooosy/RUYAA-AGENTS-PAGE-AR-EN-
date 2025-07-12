"use client"

import { motion } from "framer-motion"
import { useLanguage } from "@/contexts/LanguageContext"
import { Bot, Zap, Shield, Users, BarChart3, Clock } from "lucide-react"

const features = [
  {
    icon: Bot,
    titleAr: "وكلاء ذكيون متطورون",
    titleEn: "Advanced AI Agents",
    descriptionAr: "وكلاء ذكيون مدربون على أحدث تقنيات الذكاء الاصطناعي لخدمة عملائك بكفاءة عالية",
    descriptionEn:
      "AI agents trained on the latest artificial intelligence technologies to serve your customers efficiently",
  },
  {
    icon: Zap,
    titleAr: "استجابة فورية",
    titleEn: "Instant Response",
    descriptionAr: "ردود فورية على استفسارات العملاء على مدار الساعة دون انقطاع",
    descriptionEn: "Instant responses to customer inquiries 24/7 without interruption",
  },
  {
    icon: Shield,
    titleAr: "أمان وخصوصية",
    titleEn: "Security & Privacy",
    descriptionAr: "حماية كاملة لبيانات عملائك مع أعلى معايير الأمان والخصوصية",
    descriptionEn: "Complete protection of your customer data with the highest security and privacy standards",
  },
  {
    icon: Users,
    titleAr: "تجربة مخصصة",
    titleEn: "Personalized Experience",
    descriptionAr: "تجربة مخصصة لكل عميل بناءً على تفضيلاته وتاريخ تفاعلاته",
    descriptionEn: "Personalized experience for each customer based on their preferences and interaction history",
  },
  {
    icon: BarChart3,
    titleAr: "تحليلات ذكية",
    titleEn: "Smart Analytics",
    descriptionAr: "تقارير وتحليلات مفصلة لفهم سلوك العملاء وتحسين الخدمة",
    descriptionEn: "Detailed reports and analytics to understand customer behavior and improve service",
  },
  {
    icon: Clock,
    titleAr: "توفير الوقت",
    titleEn: "Time Saving",
    descriptionAr: "توفير الوقت والجهد من خلال أتمتة المهام المتكررة وتحسين الكفاءة",
    descriptionEn: "Save time and effort by automating repetitive tasks and improving efficiency",
  },
]

export default function Features() {
  const { language, isRTL } = useLanguage()

  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 text-shadow-lg">
            {language === "ar" ? "مميزات منصتنا" : "Platform Features"}
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {language === "ar"
              ? "اكتشف كيف يمكن لوكلائنا الذكيين تحويل تجربة خدمة العملاء في شركتك"
              : "Discover how our AI agents can transform your company's customer service experience"}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group floating-card"
            >
              <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 h-full transition-all duration-300 hover:bg-white/15 hover:border-white/30 hover:shadow-2xl hover:shadow-cyan-500/20">
                {/* Floating glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 floating-glow" />

                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-cyan-300 transition-colors duration-300">
                    {language === "ar" ? feature.titleAr : feature.titleEn}
                  </h3>

                  <p className="text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                    {language === "ar" ? feature.descriptionAr : feature.descriptionEn}
                  </p>
                </div>

                {/* Hover border effect */}
                <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-cyan-500/50 transition-colors duration-300" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              {language === "ar" ? "جاهز للبدء؟" : "Ready to Get Started?"}
            </h3>
            <p className="text-gray-300 mb-6">
              {language === "ar"
                ? "ابدأ رحلتك مع الوكلاء الذكيين اليوم واكتشف الفرق"
                : "Start your journey with AI agents today and discover the difference"}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 btn-3d"
              onClick={() => window.open("tel:+963940632191")}
            >
              {language === "ar" ? "تواصل معنا الآن" : "Contact Us Now"}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
