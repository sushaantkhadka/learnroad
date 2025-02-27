import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Calendar, ChevronRight, Search, Star, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
    <main className="flex-1">
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-blue-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Find Your Perfect Tutor with LearnRoad
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Connect with expert tutors in any subject, anytime, anywhere. Boost your learning journey today!
              </p>
            </div>
            <div className="w-full max-w-sm space-y-2">
              <form className="flex space-x-2">
                <Input className="max-w-lg flex-1" placeholder="Enter a subject..." type="text" />
                <Button type="submit">
                  <Search className="mr-2 h-4 w-4" />
                  Find Tutors
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
      <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">Why Choose LearnRoad?</h2>
          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <Users className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">Expert Tutors</h3>
              <p className="text-gray-500">Connect with qualified and experienced tutors in various subjects.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Calendar className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">Flexible Scheduling</h3>
              <p className="text-gray-500">Book sessions that fit your schedule, 24/7.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <BookOpen className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">Personalized Learning</h3>
              <p className="text-gray-500">Get tailored lessons that match your learning style and goals.</p>
            </div>
          </div>
        </div>
      </section>
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">How It Works</h2>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white mb-4">
                1
              </div>
              <h3 className="text-xl font-bold mb-2">Search for a Tutor</h3>
              <p className="text-gray-500">Enter your subject and browse through our qualified tutors.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white mb-4">
                2
              </div>
              <h3 className="text-xl font-bold mb-2">Book a Session</h3>
              <p className="text-gray-500">Choose a time that works for you and book your session.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white mb-4">
                3
              </div>
              <h3 className="text-xl font-bold mb-2">Start Learning</h3>
              <p className="text-gray-500">Connect with your tutor and begin your personalized learning journey.</p>
            </div>
          </div>
        </div>
      </section>
      <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">What Our Students Say</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col gap-4 p-6 bg-gray-100 rounded-lg">
              <Star className="h-5 w-5 text-yellow-400" />
              <p className="text-gray-500">
                &quot;LearnRoad helped me ace my calculus exam. My tutor was patient and knowledgeable!&quot;
              </p>
              <p className="font-semibold">- Sarah K.</p>
            </div>
            <div className="flex flex-col gap-4 p-6 bg-gray-100 rounded-lg">
              <Star className="h-5 w-5 text-yellow-400" />
              <p className="text-gray-500">
                &quot;I love how easy it is to find a tutor for any subject. Great platform!&quot;
              </p>
              <p className="font-semibold">- Mike T.</p>
            </div>
            <div className="flex flex-col gap-4 p-6 bg-gray-100 rounded-lg">
              <Star className="h-5 w-5 text-yellow-400" />
              <p className="text-gray-500">
                &quot;The flexible scheduling is a game-changer. I can learn whenever it suits me best.&quot;
              </p>
              <p className="font-semibold">- Emily R.</p>
            </div>
          </div>
        </div>
      </section>
      <section className="w-full py-12 md:py-24 lg:py-32 bg-blue-600 text-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Start Learning?
              </h2>
              <p className="mx-auto max-w-[600px] text-blue-100 md:text-xl">
                Join LearnRoad today and connect with expert tutors to achieve your learning goals.
              </p>
            </div>
            <div className="w-full max-w-sm space-y-2">
              <Button className="w-full bg-white text-blue-600 hover:bg-blue-50" size="lg">
                Sign Up Now
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <p className="text-sm text-blue-100">No credit card required</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
  )
}
