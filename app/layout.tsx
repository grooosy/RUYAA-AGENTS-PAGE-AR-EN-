import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "رؤيا كابيتال - الوكلاء الأذكياء",
  description: "نطور وكلاء ذكيين مخصصين لشركتك باستخدام أحدث تقنيات الذكاء الاصطناعي",
  keywords: "وكيل ذكي, ذكاء اصطناعي, أتمتة, خدمة عملاء, رؤيا كابيتال",
  authors: [{ name: "رؤيا كابيتال" }],
  openGraph: {
    title: "رؤيا كابيتال - الوكلاء الأذكياء",
    description: "نطور وكلاء ذكيين مخصصين لشركتك باستخدام أحدث تقنيات الذكاء الاصطناعي",
    type: "website",
    locale: "ar_SA",
  },
  twitter: {
    card: "summary_large_image",
    title: "رؤيا كابيتال - الوكلاء الأذكياء",
    description: "نطور وكلاء ذكيين مخصصين لشركتك باستخدام أحدث تقنيات الذكاء الاصطناعي",
  },
  robots: {
    index: true,
    follow: true,
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
        {/* Botpress Chat Widget */}
        <script src="https://cdn.botpress.cloud/webchat/v3.2/inject.js" defer></script>
        <script src="https://files.bpcontent.cloud/2025/07/12/04/20250712041757-PYMKN5OE.js" defer></script>
      </body>
    </html>
  )
}
