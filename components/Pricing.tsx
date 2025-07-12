"use client"

import { motion } from "framer-motion"
import { useLanguage } from "@/contexts/LanguageContext"
import { Check, Star, Zap, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"

const pricingPlans = [
  {
    name: { ar: "الباقة الأساسية", en: "Basic Plan" },
    price: { ar: "حسب الطلب", en: "Custom Quote" },
    description: { ar: "مثالية للشركات الصغيرة", en: "Perfect for small businesses" },
    icon: Zap,
    features: {
      ar: ["وكيل ذكي واحد", "دعم اللغة العربية", "تدريب أساسي", "دعم فني محدود", "تقارير شهرية"],
      en: ["One AI agent", "Arabic language support", "Basic training", "Limited technical support", "Monthly reports"],
    },
    popular: false,
    color: "from-gray-600 to-gray-700",
  },
  {
    name: { ar: "الباقة المتقدمة", en: "Advanced Plan" },
    price: { ar: "حسب الطلب", en: "Custom Quote" },
    description: { ar: "الأنسب للشركات المتوسطة", en: "Best for medium businesses" },
    icon: Star,
    features: {
      ar: [
        "3 وكلاء ذكيين",
        "دعم متعدد اللغات",
        "تدريب متقدم",
        "دعم فني 24/7",
        "تقارير أسبوعية",
        "تكامل مع الأنظمة",
        "تحليلات متقدمة",
      ],
      en: [
        "3 AI agents",
        "Multi-language support",
        "Advanced training",
        "24/7 technical support",
        "Weekly reports",
        "System integration",
        "Advanced analytics",
      ],
    },
    popular: true,
    color: "from-cyan-500 to-blue-600",
  },
  {
    name: { ar: "الباقة المؤسسية", en: "Enterprise Plan" },
    price: { ar: "حسب الطلب", en: "Custom Quote" },
    description: { ar: "للمؤسسات الكبيرة", en: "For large enterprises" },
    icon: Crown,
    features: {
      ar: [
        "وكلاء ذكيين غير محدودين",
        "تخصيص كامل",
        "تدريب مخصص",
        "مدير حساب مخصص",
        "تقارير يومية",
        "API متقدم",
        "أمان متقدم",
        "نشر محلي",
      ],
      en: [
        "Unlimited AI agents",
        "Full customization",
        "Custom training",
        "Dedicated account manager",
        "Daily reports",
        "Advanced API",
        "Enhanced security",
        "On-premise deployment",
      ],
    },
    popular: false,
    color: "from-purple-600 to-pink-600",
  },
]

export default function Pricing() {
  const { language, isRTL } = useLanguage()

  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-0 right-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
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
            {language === "ar" ? "خطط الأسعار" : "Pricing Plans"}
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {language === "ar"
              ? "اختر الباقة التي تناسب احتياجات شركتك. جميع الباقات قابلة للتخصيص"
              : "Choose the plan that fits your company's needs. All plans are customizable"}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className={`relative group floating-card ${plan.popular ? "md:scale-105 z-10" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                  <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                    {language === "ar" ? "الأكثر شعبية" : "Most Popular"}
                  </div>
                </div>
              )}

              <div
                className={`relative bg-white/10 backdrop-blur-sm border ${plan.popular ? "border-cyan-500/50" : "border-white/20"} rounded-xl p-8 h-full transition-all duration-300 hover:bg-white/15 hover:border-white/30 hover:shadow-2xl hover:shadow-cyan-500/20`}
              >
                {/* Floating glow effect */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${plan.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-xl floating-glow`}
                />

                <div className="relative z-10">
                  {/* Plan Icon */}
                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${plan.color} rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <plan.icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Plan Name */}
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {language === "ar" ? plan.name.ar : plan.name.en}
                  </h3>

                  {/* Plan Description */}
                  <p className="text-gray-300 mb-6">{language === "ar" ? plan.description.ar : plan.description.en}</p>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="text-3xl font-bold text-white mb-2">
                      {language === "ar" ? plan.price.ar : plan.price.en}
                    </div>
                    <p className="text-gray-400 text-sm">
                      {language === "ar" ? "تواصل معنا للحصول على عرض سعر" : "Contact us for a quote"}
                    </p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-4 mb-8">
                    {(language === "ar" ? plan.features.ar : plan.features.en).map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 bg-gradient-to-r ${plan.color} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}
                        >
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-gray-300 text-sm leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Button
                    className={`w-full bg-gradient-to-r ${plan.color} text-white border-0 hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 btn-3d group-hover:scale-105`}
                    onClick={() => window.open("tel:+963940632191")}
                  >
                    {language === "ar" ? "احصل على عرض سعر" : "Get Quote"}
                  </Button>
                </div>

                {/* Hover border effect */}
                <div
                  className={`absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-cyan-500/50 transition-colors duration-300`}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              {language === "ar" ? "لديك احتياجات خاصة؟" : "Have Special Requirements?"}
            </h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              {language === "ar"
                ? "نحن نقدم حلول مخصصة تماماً لتناسب احتياجات شركتك. تواصل معنا لمناقشة متطلباتك الخاصة والحصول على عرض سعر مخصص."
                : "We offer fully customized solutions to fit your company's needs. Contact us to discuss your specific requirements and get a custom quote."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0 hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 btn-3d"
                onClick={() => window.open("tel:+963940632191")}
              >
                {language === "ar" ? "اتصل بنا الآن" : "Call Us Now"}
              </Button>
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-all duration-300 bg-transparent"
                onClick={() => window.open("https://wa.me/963940632191")}
              >
                {language === "ar" ? "واتساب" : "WhatsApp"}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
