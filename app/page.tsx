import Header from "@/components/Header"
import Hero from "@/components/Hero"
import Features from "@/components/Features"
import Pricing from "@/components/Pricing"
import Footer from "@/components/Footer"
import VoiceflowChat from "@/components/VoiceflowChat"
import { LanguageProvider } from "@/contexts/LanguageContext"

export default function Home() {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-black text-white relative overflow-x-hidden">
        {/* Optimized Background */}
        <div className="fixed inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('/images/network-bg.png')`,
              backgroundAttachment: "fixed",
            }}
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <div className="relative z-10">
          <Header />
          <main>
            <Hero />
            <Features />
            <Pricing />
          </main>
          <Footer />
        </div>

        {/* Voiceflow Chat Widget */}
        <VoiceflowChat />
      </div>
    </LanguageProvider>
  )
}
