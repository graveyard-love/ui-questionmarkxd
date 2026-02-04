import React from "react"
import type { Metadata } from 'next'

import { Analytics } from '@vercel/analytics/next'
import './globals.css'

import { Geist_Mono, Fira_Sans as V0_Font_Fira_Sans, Geist_Mono as V0_Font_Geist_Mono, Slabo_27px as V0_Font_Slabo_27px } from 'next/font/google'

// Initialize fonts
const _firaSans = V0_Font_Fira_Sans({ subsets: ['latin'], weight: ["100","200","300","400","500","600","700","800","900"] })
const _geistMono = V0_Font_Geist_Mono({ subsets: ['latin'], weight: ["100","200","300","400","500","600","700","800","900"] })
const _slabo_27px = V0_Font_Slabo_27px({ subsets: ['latin'], weight: ["400"] })

export const metadata: Metadata = {
  title: 'Claude Chat',
  description: 'Chat with Claude AI models',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
