"use client"

import { useLanguage } from "@/contexts/LanguageContext"

export function Features() {
  const { language, translations } = useLanguage()

  const features = [
    {
      title: translations.features.aiAssistant.title,
      description: translations.features.aiAssistant.description,
      benefits: [
        "24/7 automated customer support",
        "Intelligent conversation handling",
        "Multi-language support",
        "Seamless integration with existing systems",
      ],
    },
    {
      title: translations.features.smartAnalytics.title,
      description: translations.features.smartAnalytics.description,
      benefits: [
        "Real-time business insights",
        "Predictive analytics and forecasting",
        "Custom dashboard creation",
        "Data-driven decision making",
      ],
    },
    {
      title: translations.features.automation.title,
      description: translations.features.automation.description,
      benefits: [
        "Workflow automation",
        "Task scheduling and management",
        "Process optimization",
        "Reduced manual workload",
      ],
    },
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 text-shadow-lg">
            {translations.features.title}
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto text-shadow">{translations.features.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="content-card rounded-xl p-8 floating-card"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white text-shadow">{feature.title}</h3>
                <p className="text-gray-300 text-shadow">{feature.description}</p>
                <ul className="space-y-3">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-start space-x-3">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-gray-300 text-shadow">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
