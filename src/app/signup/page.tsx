import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { SignupForm } from "@/components/signup-form"

export const metadata: Metadata = {
  title: "Sign Up | TutorMatch",
  description: "Create your TutorMatch account",
}

export default function SignupPage() {
  return (
    <div className="container mx-auto max-w-md py-12">
      <Link href="/" className="absolute left-4 top-4 md:left-8 md:top-8">
        <Image src="/placeholder.svg?height=40&width=40" alt="Logo" width={40} height={40} className="h-10 w-10" />
        <span className="sr-only">Home</span>
      </Link>
      <h1 className="text-2xl font-bold mb-6">Sign up</h1>
      <SignupForm />
      <p className="px-8 text-center text-sm text-muted-foreground">
        By clicking continue, you agree to our{" "}
        <Link href="/terms" className="hover:text-brand underline underline-offset-4">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="hover:text-brand underline underline-offset-4">
          Privacy Policy
        </Link>
        .
      </p>
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">Debugging Info</h2>
        <p>Check the browser console for signup data logs.</p>
      </div>
    </div>
  )
}

