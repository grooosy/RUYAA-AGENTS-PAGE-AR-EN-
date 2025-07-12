"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useLanguage } from "@/contexts/LanguageContext"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Check, Star, Zap, Crown, Rocket, ArrowRight, ArrowLeft } from "lucide-react"

export default function Pricing() {
  const { language } = useLanguage()
  const [isAnnual, setIsAnnual] = useState(false)

  const plans = [
    {
      name: language === "ar" ? "الأساسي" : "Basic",
      icon: Zap,
      price: { monthly: 99, annual: 990 },
      description: language === "ar" ? "مثالي للشركات الناشئة" : "Perfect for startups",
      features: [
        language === "ar" ? "مساعد ذكي أساسي" : "Basic AI Assistant",
        language === "ar" ? "تحليل البيانات الأساسي" : "Basic Data Analysis",
        language === "ar" ? "دعم فني 24/7" : "24/7 Technical Support",
        language === "ar" ? "تقارير شهرية" : "Monthly Reports",
        language === "ar" ? "حتى 1000 معاملة" : "Up to 1,000 transactions",
      ],
      popular: false,
      color: "from-blue-500 to-cyan-500",
    },
    {
      name: language === "ar" ? "المتقدم" : "Professional",
      icon: Star,
      price: { monthly: 199, annual: 1990 },
      description: language === "ar" ? "الأفضل للشركات المتوسطة" : "Best for medium businesses",
      features: [
        language === "ar" ? "مساعد ذكي متقدم" : "Advanced AI Assistant",
        language === "ar" ? "تحليل البيانات المتقدم" : "Advanced Data Analysis",
        language === "ar" ? "أتمتة العمليات" : "Process Automation",
        language === "ar" ? "تقارير أسبوعية" : "Weekly Reports",
        language === "ar" ? "حتى 10,000 معاملة" : "Up to 10,000 transactions",
        language === "ar" ? "تكامل API" : "API Integration",
      ],
      popular: true,
      color: "from-purple-500 to-pink-500",
    },
    {
      name: language === "ar" ? "المؤسسي" : "Enterprise",
      icon: Crown,
      price: { monthly: 399, annual: 3990 },
      description: language === "ar" ? "للمؤسسات الكبيرة" : "For large enterprises",
      features: [
        language === "ar" ? "مساعد ذكي مخصص" : "Custom AI Assistant",
        language === "ar" ? "تحليل البيانات الشامل" : "Comprehensive Data Analysis",
        language === "ar" ? "أتمتة كاملة" : "Full Automation",
        language === "ar" ? "تقارير يومية" : "Daily Reports",
        language === "ar" ? "معاملات غير محدودة" : "Unlimited transactions",
        language === "ar" ? "تكامل متقدم" : "Advanced Integration",
        language === "ar" ? "دعم مخصص" : "Dedicated Support",
      ],
      popular: false,
      color: "from-yellow-500 to-orange-500",
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  }

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex justify-center mb-6">
            <div className="p-3 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-white/10">
              <Rocket className="w-8 h-8 text-pink-400" />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-shadow-lg">
            {language === "ar" ? "خطط الأسعار" : "Pricing Plans"}
          </h2>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto mb-8 text-shadow">
            {language === "ar"
              ? "اختر الخطة المناسبة لاحتياجات عملك مع إمكانية الترقية في أي وقت"
              : "Choose the right plan for your business needs with the ability to upgrade anytime"}
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 rtl:space-x-reverse">
            <span className={`text-lg ${!isAnnual ? "text-white" : "text-gray-400"}`}>
              {language === "ar" ? "شهري" : "Monthly"}
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-pink-500"
            />
            <span className={`text-lg ${isAnnual ? "text-white" : "text-gray-400"}`}>
              {language === "ar" ? "سنوي" : "Annual"}
            </span>
            {isAnnual && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                {language === "ar" ? "وفر 20%" : "Save 20%"}
              </Badge>
            )}
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {plans.map((plan, index) => {
            const IconComponent = plan.icon
            const price = isAnnual ? plan.price.annual : plan.price.monthly
            const monthlyPrice = isAnnual ? plan.price.annual / 12 : plan.price.monthly

            return (
              <motion.div key={index} variants={itemVariants}>
                <Card
                  className={`content-card h-full relative group hover:scale-105 transition-all duration-300 ${
                    plan.popular ? "ring-2 ring-purple-500/50 shadow-2xl shadow-purple-500/20" : ""
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1">
                        {language === "ar" ? "الأكثر شعبية" : "Most Popular"}
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-8">
                    <div className="flex justify-center mb-4">
                      <div className={`p-4 rounded-full bg-gradient-to-r ${plan.color} bg-opacity-20`}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-gray-300 mb-6">{plan.description}</p>

                    <div className="space-y-2">
                      <div className="text-4xl font-bold text-white">
                        ${Math.round(monthlyPrice)}
                        <span className="text-lg text-gray-300 font-normal">
                          /{language === "ar" ? "شهر" : "month"}
                        </span>
                      </div>
                      {isAnnual && (
                        <div className="text-sm text-gray-400">
                          {language === "ar" ? "يُدفع سنوياً" : "Billed annually"} (${price})
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Features */}
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-gray-300">
                          <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <Button
                      className={`w-full py-3 text-lg font-semibold rounded-xl transition-all duration-300 btn-3d ${
                        plan.popular
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/25"
                          : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                      }`}
                    >
                      {language === "ar" ? "ابدأ الآن" : "Get Started"}
                      {language === "ar" ? (
                        <ArrowLeft className="ml-2 w-5 h-5" />
                      ) : (
                        <ArrowRight className="ml-2 w-5 h-5" />
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Enterprise Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="section-overlay rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              {language === "ar" ? "تحتاج حلول مخصصة؟" : "Need Custom Solutions?"}
            </h3>
            <p className="text-gray-300 mb-6">
              {language === "ar"
                ? "تواصل معنا لمناقشة احتياجاتك الخاصة والحصول على عرض مخصص"
                : "Contact us to discuss your specific needs and get a custom quote"}
            </p>
            <Button
              variant="outline"
              className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-3 text-lg font-semibold rounded-xl backdrop-blur-sm transition-all duration-300 btn-3d bg-transparent"
            >
              {language === "ar" ? "تواصل معنا" : "Contact Us"}
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/6 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl floating-element" />
        <div className="absolute bottom-1/4 left-1/6 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl floating-element" />
      </div>
    </section>
  )
}
