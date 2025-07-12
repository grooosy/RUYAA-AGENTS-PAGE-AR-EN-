"use client"

import { useLanguage } from "@/contexts/LanguageContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Features() {
  const { t, isRTL } = useLanguage()

  const features = [
    {
      title: t("features.aiAssistant.title"),
      description: t("features.aiAssistant.description"),
      details: [
        "24/7 automated customer support",
        "Multi-language conversation handling",
        "Intelligent response generation",
        "Customer inquiry routing",
      ],
    },
    {
      title: t("features.appointmentScheduling.title"),
      description: t("features.appointmentScheduling.description"),
      details: [
        "Automated appointment booking",
        "Calendar integration",
        "Reminder notifications",
        "Rescheduling management",
      ],
    },
    {
      title: t("features.salesAutomation.title"),
      description: t("features.salesAutomation.description"),
      details: [
        "Lead qualification and scoring",
        "Automated follow-up sequences",
        "Sales pipeline management",
        "Performance analytics",
      ],
    },
    {
      title: t("features.analytics.title"),
      description: t("features.analytics.description"),
      details: [
        "Real-time performance metrics",
        "Customer interaction insights",
        "Conversion rate tracking",
        "Custom reporting dashboards",
      ],
    },
    {
      title: t("features.integration.title"),
      description: t("features.integration.description"),
      details: [
        "CRM system integration",
        "Email marketing platforms",
        "Social media management",
        "Third-party API connections",
      ],
    },
    {
      title: t("features.customization.title"),
      description: t("features.customization.description"),
      details: [
        "Tailored AI responses",
        "Brand voice customization",
        "Workflow automation",
        "Custom feature development",
      ],
    },
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className={`text-3xl sm:text-4xl font-bold text-white mb-4 text-shadow-lg ${isRTL ? "font-arabic" : ""}`}>
            {t("features.title")}
          </h2>
          <p className={`text-xl text-gray-300 text-shadow max-w-3xl mx-auto ${isRTL ? "font-arabic" : ""}`}>
            {t("features.subtitle")}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300"
            >
              <CardHeader>
                <CardTitle className={`text-white text-xl ${isRTL ? "font-arabic text-right" : ""}`}>
                  {feature.title}
                </CardTitle>
                <CardDescription className={`text-gray-300 ${isRTL ? "font-arabic text-right" : ""}`}>
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className={`space-y-2 ${isRTL ? "text-right" : ""}`}>
                  {feature.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="text-gray-300 text-sm flex items-start">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
