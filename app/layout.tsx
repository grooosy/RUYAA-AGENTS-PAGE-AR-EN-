import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/contexts/LanguageContext"
import { AuthProvider } from "@/lib/auth/auth-context"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "Ruyaa Capital - AI Solutions for Business Growth",
  description:
    "Transform your business with advanced AI solutions. Automated customer service, intelligent analytics, and personalized business strategies.",
  keywords: "AI, artificial intelligence, business automation, customer service, analytics, Ruyaa Capital",
  authors: [{ name: "Ruyaa Capital" }],
  creator: "Ruyaa Capital",
  publisher: "Ruyaa Capital",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://ruyaa-capital.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Ruyaa Capital - AI Solutions for Business Growth",
    description:
      "Transform your business with advanced AI solutions. Automated customer service, intelligent analytics, and personalized business strategies.",
    url: "https://ruyaa-capital.vercel.app",
    siteName: "Ruyaa Capital",
    images: [
      {
        url: "/images/ruyaa-ai-logo.png",
        width: 1200,
        height: 630,
        alt: "Ruyaa Capital AI Solutions",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ruyaa Capital - AI Solutions for Business Growth",
    description:
      "Transform your business with advanced AI solutions. Automated customer service, intelligent analytics, and personalized business strategies.",
    images: ["/images/ruyaa-ai-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <AuthProvider>
            <LanguageProvider>
              <div className="relative min-h-screen">{children}</div>
              <Toaster />
            </LanguageProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
