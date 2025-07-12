"use client"
import { LanguageProvider } from "@/contexts/LanguageContext"
import { AuthProvider } from "@/lib/auth/auth-context"
import Header from "@/components/Header"
import Hero from "@/components/Hero"
import Features from "@/components/Features"
import Pricing from "@/components/Pricing"
import Footer from "@/components/Footer"

export default function Home() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <div className="min-h-screen">
          <Header />
          <main>
            <Hero />
            <Features />
            <Pricing />
          </main>
          <Footer />
        </div>
      </LanguageProvider>
    </AuthProvider>
  )
}
