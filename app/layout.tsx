import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Ruyaa Capital - AI-Powered Financial Solutions",
  description: "Advanced AI-powered financial solutions to enhance your business efficiency and growth",
  keywords: "AI, financial services, automation, investment, Arabic, fintech",
  authors: [{ name: "Ruyaa Capital" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "Ruyaa Capital - AI-Powered Financial Solutions",
    description: "Advanced AI-powered financial solutions to enhance your business efficiency and growth",
    type: "website",
    locale: "ar_SA",
    alternateLocale: "en_US",
  },
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
          media="print"
          onLoad={(e) => {
            const target = e.target as HTMLLinkElement
            target.media = "all"
          }}
        />
        <noscript>
          <link
            href="https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&display=swap"
            rel="stylesheet"
          />
        </noscript>
      </head>
      <body className="min-h-screen text-white antialiased">
        <div className="full-screen-bg" />
        <div className="content-overlay">{children}</div>
      </body>
    </html>
  )
}
