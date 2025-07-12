"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/LanguageContext"
import { AuthModal } from "@/components/auth/AuthModal"

export function Pricing() {
  const { language, translations } = useLanguage()
  const [showAuthModal, setShowAuthModal] = useState(false)

  const plans = [
    {
      name: "Basic AI Assistant",
      price: "$249",
      period: "/month",
      description: "Essential AI-powered business automation",
      features: [
        "AI Assistant for customer inquiries",
        "Appointment scheduling and management",
        "Basic customer support automation",
        "Follow-up message automation",
        "Email integration",
        "Basic analytics dashboard",
        "Standard support (business hours)",
      ],
      popular: false,
    },
    {
      name: "Professional Suite",
      price: "$449",
      period: "/month",
      description: "Advanced AI solutions for growing businesses",
      features: [
        "Everything in Basic plan",
        "Advanced sales automation",
        "Lead qualification and scoring",
        "CRM integration (Salesforce, HubSpot)",
        "Multi-channel communication",
        "Advanced analytics and reporting",
        "Custom workflow automation",
        "Priority support",
      ],
      popular: true,
    },
    {
      name: "Premium Enterprise",
      price: "$749",
      period: "/month",
      description: "Complete AI transformation for enterprises",
      features: [
        "Everything in Professional plan",
        "Social media management automation",
        "AI content generation",
        "Advanced predictive analytics",
        "Custom AI model training",
        "White-label solutions",
        "Dedicated account manager",
        "24/7 premium support",
      ],
      popular: false,
    },
    {
      name: "Custom Enterprise",
      price: "Custom",
      period: "pricing",
      description: "Tailored AI solutions for unique business needs",
      features: [
        "Fully customized AI implementation",
        "Dedicated development team",
        "Custom integrations and APIs",
        "On-premise deployment options",
        "Advanced security and compliance",
        "Unlimited users and features",
        "Training and onboarding",
        "Enterprise-level SLA",
      ],
      popular: false,
    },
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 text-shadow-lg">
            {translations.pricing.title}
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto text-shadow">
            Choose the perfect AI solution for your business needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`content-card rounded-xl p-8 floating-card relative ${
                plan.popular ? "ring-2 ring-gray-400" : ""
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white text-shadow mb-2">{plan.name}</h3>
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-white text-shadow">{plan.price}</span>
                      <span className="text-gray-300 ml-2 text-shadow">{plan.period}</span>
                    </div>
                    <p className="text-gray-300 text-sm text-shadow">{plan.description}</p>
                  </div>
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-gray-300 text-sm text-shadow">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full btn-3d ${
                    plan.popular
                      ? "bg-gray-800 hover:bg-gray-700 text-white"
                      : "bg-slate-900 hover:bg-slate-800 text-white"
                  } shadow-xl`}
                  onClick={() => setShowAuthModal(true)}
                >
                  {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-300 text-shadow mb-4">
            All plans include free setup, training, and 30-day money-back guarantee
          </p>
          <p className="text-sm text-gray-400 text-shadow">
            Pricing scales based on usage and specific requirements. Contact us for custom solutions.
          </p>
        </div>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </section>
  )
}
