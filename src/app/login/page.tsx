import type { Metadata } from "next"
import Link from "next/link"

import { LoginForm } from "@/components/login-form"

export const metadata: Metadata = {
  title: "Login | TutorMatch",
  description: "Login to your TutorMatch account",
}

export default function LoginPage() {
  return (
    <div className="container mx-auto max-w-md py-12">
      <h1 className="text-2xl font-bold mb-6">Log in</h1>
      <LoginForm />
      <p className="px-8 text-center text-sm text-muted-foreground">
        <Link href="/signup" className="hover:text-brand underline underline-offset-4">
          Don&apos;t have an account? Sign Up
        </Link>
      </p>
    </div>
  )
}

