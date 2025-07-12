"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { useLanguage } from "@/contexts/LanguageContext"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bot, Brain, Zap, Shield, TrendingUp, Users, Clock, Target, Sparkles, ArrowRight } from "lucide-react"

export default function Features() {
  const { language } = useLanguage()

  const features = [
    {
      icon: Bot,
      title: language === "ar" ? "مساعد ذكي متقدم" : "Advanced AI Assistant",
      description:
        language === "ar"
          ? "مساعد ذكي يفهم احتياجاتك ويقدم حلولاً مخصصة لأعمالك"
          : "Intelligent assistant that understands your needs and provides customized business solutions",
      image: "/images/ai-assistant.png",
      badge: language === "ar" ? "جديد" : "New",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Brain,
      title: language === "ar" ? "تحليل البيانات الذكي" : "Smart Data Analysis",
      description:
        language === "ar"
          ? "تحليل متقدم للبيانات لاستخراج رؤى قيمة تساعد في اتخاذ القرارات"
          : "Advanced data analysis to extract valuable insights for decision making",
      image: "/images/smart-dashboard.png",
      badge: language === "ar" ? "محدث" : "Updated",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Zap,
      title: language === "ar" ? "أتمتة العمليات" : "Process Automation",
      description:
        language === "ar"
          ? "أتمتة المهام المتكررة لزيادة الكفاءة وتوفير الوقت والجهد"
          : "Automate repetitive tasks to increase efficiency and save time and effort",
      image: "/images/business-management-team.png",
      badge: language === "ar" ? "شائع" : "Popular",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Shield,
      title: language === "ar" ? "أمان متقدم" : "Advanced Security",
      description:
        language === "ar"
          ? "حماية متقدمة لبياناتك مع أعلى معايير الأمان والخصوصية"
          : "Advanced protection for your data with the highest security and privacy standards",
      image: "/images/specialized-agent.png",
      badge: language === "ar" ? "آمن" : "Secure",
      color: "from-red-500 to-orange-500",
    },
    {
      icon: TrendingUp,
      title: language === "ar" ? "تحليل الاستثمار" : "Investment Analysis",
      description:
        language === "ar"
          ? "تحليل متقدم للفرص الاستثمارية مع توصيات مدعومة بالذكاء الاصطناعي"
          : "Advanced analysis of investment opportunities with AI-powered recommendations",
      image: "/images/investment-solutions.png",
      badge: language === "ar" ? "ذكي" : "Smart",
      color: "from-yellow-500 to-amber-500",
    },
    {
      icon: Users,
      title: language === "ar" ? "إدارة العملاء" : "Customer Management",
      description:
        language === "ar"
          ? "نظام متقدم لإدارة العملاء وتحسين تجربة الخدمة"
          : "Advanced system for customer management and service experience improvement",
      image: "/images/customer-service-agent.png",
      badge: language === "ar" ? "فعال" : "Effective",
      color: "from-indigo-500 to-purple-500",
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
            <div className="p-3 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-white/10">
              <Sparkles className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-shadow-lg">
            {language === "ar" ? "ميزاتنا المتقدمة" : "Our Advanced Features"}
          </h2>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto text-shadow">
            {language === "ar"
              ? "اكتشف مجموعة شاملة من الحلول الذكية المصممة لتحويل أعمالك وزيادة كفاءتها"
              : "Discover a comprehensive suite of intelligent solutions designed to transform and enhance your business efficiency"}
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <motion.div key={index} variants={itemVariants}>
                <Card className="content-card h-full group hover:scale-105 transition-all duration-300 cursor-pointer floating-card">
                  <CardContent className="p-6 h-full flex flex-col">
                    {/* Image */}
                    <div className="relative mb-6 overflow-hidden rounded-lg">
                      <Image
                        src={feature.image || "/placeholder.svg"}
                        alt={feature.title}
                        width={400}
                        height={250}
                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <Badge className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm text-white border-white/30">
                        {feature.badge}
                      </Badge>
                    </div>

                    {/* Icon */}
                    <div className="flex items-center mb-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${feature.color} bg-opacity-20 mr-4`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                    </div>

                    {/* Description */}
                    <p className="text-gray-300 leading-relaxed flex-grow mb-4">{feature.description}</p>

                    {/* Learn More */}
                    <div className="flex items-center text-cyan-400 group-hover:text-cyan-300 transition-colors duration-300">
                      <span className="text-sm font-medium">{language === "ar" ? "اعرف المزيد" : "Learn More"}</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { number: "500+", label: language === "ar" ? "عميل راضٍ" : "Happy Clients", icon: Users },
            { number: "99.9%", label: language === "ar" ? "وقت التشغيل" : "Uptime", icon: Clock },
            { number: "24/7", label: language === "ar" ? "دعم فني" : "Support", icon: Shield },
            { number: "150%", label: language === "ar" ? "نمو الكفاءة" : "Efficiency Growth", icon: Target },
          ].map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <div key={index} className="text-center section-overlay rounded-lg p-6">
                <div className="flex justify-center mb-3">
                  <IconComponent className="w-8 h-8 text-cyan-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-gray-300 text-sm">{stat.label}</div>
              </div>
            )
          })}
        </motion.div>
      </div>

      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/6 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl floating-element" />
        <div className="absolute bottom-1/3 right-1/6 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl floating-element" />
      </div>
    </section>
  )
}
