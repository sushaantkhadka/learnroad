import type React from "react"
import { Inter } from "next/font/google"
import type { Metadata } from "next"

import { NextAuthProvider } from "@/components/providers/session-provider"
import { SonnerProvider } from "@/components/providers/sonner-provider"
import "@/styles/globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TutorMatch - Find the Perfect Tutor",
  description: "Connect with qualified tutors who match your learning style, schedule, and subject needs.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthProvider>
          {children}
          <SonnerProvider />
        </NextAuthProvider>
      </body>
    </html>
  )
}

