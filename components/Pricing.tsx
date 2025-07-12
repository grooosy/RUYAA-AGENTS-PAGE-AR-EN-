"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/contexts/LanguageContext"
import { useAuth } from "@/lib/auth/auth-context"
import AuthModal from "@/components/auth/AuthModal"

export default function Pricing() {
  const { t, isRTL } = useLanguage()
  const { user } = useAuth()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  const plans = [
    {
      name: "Basic AI Assistant",
      price: "$249",
      period: "/month",
      description: "Essential AI-powered customer support and appointment management",
      features: [
        "AI Customer Support Agent",
        "Appointment Scheduling System",
        "Basic Follow-up Automation",
        "Email Integration",
        "Standard Analytics Dashboard",
        "Business Hours Support",
      ],
      popular: false,
    },
    {
      name: "Professional Suite",
      price: "$449",
      period: "/month",
      description: "Advanced sales automation with CRM integration and lead management",
      features: [
        "Everything in Basic Plan",
        "Advanced Sales Automation",
        "Lead Qualification & Scoring",
        "CRM Integration",
        "Multi-channel Communication",
        "Advanced Analytics & Reporting",
        "Priority Support",
      ],
      popular: true,
    },
    {
      name: "Premium Enterprise",
      price: "$749",
      period: "/month",
      description: "Complete AI solution with social media management and content generation",
      features: [
        "Everything in Professional Plan",
        "Social Media Management",
        "AI Content Generation",
        "Advanced Workflow Automation",
        "Custom Integrations",
        "Dedicated Account Manager",
        "24/7 Premium Support",
      ],
      popular: false,
    },
    {
      name: "Custom Enterprise",
      price: "Custom",
      period: "pricing",
      description: "Fully customized AI solutions tailored to your specific business needs",
      features: [
        "Fully Customized AI Solutions",
        "Unlimited Integrations",
        "Custom Feature Development",
        "Dedicated Development Team",
        "On-premise Deployment Options",
        "Enterprise-grade Security",
        "White-label Solutions",
      ],
      popular: false,
    },
  ]

  const handleGetStarted = () => {
    if (!user) {
      setIsAuthModalOpen(true)
    } else {
      // Redirect to dashboard or contact
      console.log("Redirect to dashboard")
    }
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className={`text-3xl sm:text-4xl font-bold text-white mb-4 text-shadow-lg ${isRTL ? "font-arabic" : ""}`}>
            {t("pricing.title")}
          </h2>
          <p className={`text-xl text-gray-300 text-shadow max-w-3xl mx-auto ${isRTL ? "font-arabic" : ""}`}>
            {t("pricing.subtitle")}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300 ${
                plan.popular ? "ring-2 ring-white/30 scale-105" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-white text-slate-900 px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className={`text-white text-xl ${isRTL ? "font-arabic" : ""}`}>{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-300 ml-1">{plan.period}</span>
                </div>
                <CardDescription className={`text-gray-300 mt-2 ${isRTL ? "font-arabic" : ""}`}>
                  {plan.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="text-gray-300 text-sm flex items-start">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button variant={plan.popular ? "primary" : "outline"} className="w-full" onClick={handleGetStarted}>
                  {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center mt-12">
          <p className="text-gray-300 mb-4">All plans include free setup, training, and 30-day money-back guarantee</p>
          <p className="text-sm text-gray-400">
            Prices are in USD and billed monthly. Custom enterprise solutions available upon request.
          </p>
        </div>
      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </section>
  )
}
