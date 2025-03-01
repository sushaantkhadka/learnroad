import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search, BookOpen, Calendar, MessageSquare, Star } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <BookOpen className="h-6 w-6" />
            <span>TutorMatch</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/tutors" className="text-sm font-medium hover:underline underline-offset-4">
              Find Tutors
            </Link>
            <Link href="/subjects" className="text-sm font-medium hover:underline underline-offset-4">
              Subjects
            </Link>
            <Link href="/how-it-works" className="text-sm font-medium hover:underline underline-offset-4">
              How It Works
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="secondary" size="sm">
                Log In
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-blue-50 to-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Find the Perfect Tutor for Your Learning Journey
                </h1>
                <p className="text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Connect with qualified tutors who match your learning style, schedule, and subject needs. Experience
                  personalized education that helps you achieve your academic goals.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/tutors">
                    <Button size="lg" className="w-full min-[400px]:w-auto">
                      Find a Tutor
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="lg" variant="secondary" className="w-full min-[400px]:w-auto">
                      Become a Tutor
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="relative w-full max-w-md">
                  <div className="absolute -top-4 -left-4 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-2xl opacity-70"></div>
                  <div className="absolute -bottom-4 -right-4 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-2xl opacity-70"></div>
                  <div className="relative bg-white border rounded-lg shadow-lg p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <Search className="h-6 w-6 text-gray-500" />
                      </div>
                      <div>
                        <h3 className="font-medium">Smart Matching</h3>
                        <p className="text-sm text-gray-500">Find tutors that match your needs</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-gray-500" />
                      </div>
                      <div>
                        <h3 className="font-medium">Flexible Scheduling</h3>
                        <p className="text-sm text-gray-500">Book sessions that fit your schedule</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <MessageSquare className="h-6 w-6 text-gray-500" />
                      </div>
                      <div>
                        <h3 className="font-medium">Interactive Learning</h3>
                        <p className="text-sm text-gray-500">Collaborate with tools that enhance learning</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <Star className="h-6 w-6 text-gray-500" />
                      </div>
                      <div>
                        <h3 className="font-medium">Verified Reviews</h3>
                        <p className="text-sm text-gray-500">Choose tutors based on student feedback</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8">
              Explore Our Services
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Link href="/tutors" className="group">
                <div className="border rounded-lg p-6 transition-all group-hover:shadow-md">
                  <h3 className="text-xl font-semibold mb-2">Find a Tutor</h3>
                  <p className="text-gray-500">
                    Browse our extensive list of qualified tutors across various subjects.
                  </p>
                </div>
              </Link>
              <Link href="/subjects" className="group">
                <div className="border rounded-lg p-6 transition-all group-hover:shadow-md">
                  <h3 className="text-xl font-semibold mb-2">Explore Subjects</h3>
                  <p className="text-gray-500">Discover the wide range of subjects we offer tutoring in.</p>
                </div>
              </Link>
              <Link href="/how-it-works" className="group">
                <div className="border rounded-lg p-6 transition-all group-hover:shadow-md">
                  <h3 className="text-xl font-semibold mb-2">How It Works</h3>
                  <p className="text-gray-500">Learn about our tutoring process and how to get started.</p>
                </div>
              </Link>
              <Link href="/pricing" className="group">
                <div className="border rounded-lg p-6 transition-all group-hover:shadow-md">
                  <h3 className="text-xl font-semibold mb-2">Pricing</h3>
                  <p className="text-gray-500">View our competitive pricing options for tutoring services.</p>
                </div>
              </Link>
              <Link href="/resources" className="group">
                <div className="border rounded-lg p-6 transition-all group-hover:shadow-md">
                  <h3 className="text-xl font-semibold mb-2">Learning Resources</h3>
                  <p className="text-gray-500">Access free study materials and learning tips.</p>
                </div>
              </Link>
              <Link href="/contact" className="group">
                <div className="border rounded-lg p-6 transition-all group-hover:shadow-md">
                  <h3 className="text-xl font-semibold mb-2">Contact Us</h3>
                  <p className="text-gray-500">Get in touch with our support team for any questions or concerns.</p>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center gap-4 md:flex-row md:justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              <span className="text-sm font-medium">TutorMatch</span>
            </div>
            <nav className="flex gap-4 text-sm">
              <Link href="/about" className="hover:underline underline-offset-4">
                About
              </Link>
              <Link href="/terms" className="hover:underline underline-offset-4">
                Terms
              </Link>
              <Link href="/privacy" className="hover:underline underline-offset-4">
                Privacy Policy
              </Link>
              <Link href="/contact" className="hover:underline underline-offset-4">
                Contact
              </Link>
            </nav>
            <p className="text-sm text-gray-500">© 2024 TutorMatch. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

