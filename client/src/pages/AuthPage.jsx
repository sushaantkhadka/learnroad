import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  return (
    <div className="min-h-screen bg-[#EEE8FF] flex items-center justify-center p-4">
      <div className="w-full max-w-[460px] bg-white rounded-[32px] p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-8">Login Form</h1>

        {/* Toggle Switch */}
        <div className="flex bg-gray-100 rounded-full p-1 mb-8">
          <button
            className={`flex-1 py-3 px-6 rounded-full text-center transition-colors ${
              isLogin ? "bg-[#0052CC] text-white" : "text-gray-600"
            }`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={`flex-1 py-3 px-6 rounded-full text-center transition-colors ${
              !isLogin ? "bg-[#0052CC] text-white" : "text-gray-600"
            }`}
            onClick={() => setIsLogin(false)}
          >
            Signup
          </button>
        </div>

        {isLogin ? (
          <form className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email Address"
                className="w-full px-6 py-4 rounded-full border border-gray-200 text-lg"
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                className="w-full px-6 py-4 rounded-full border border-gray-200 text-lg"
              />
            </div>
            <div className="text-left">
              <Link href="/forgot-password" className="text-[#0052CC] hover:underline">
                Forgot password?
              </Link>
            </div>
            <button
              type="submit"
              className="w-full bg-[#0052CC] text-white py-4 rounded-full text-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Login
            </button>
          </form>
        ) : (
          <form className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Full Name"
                className="w-full px-6 py-4 rounded-full border border-gray-200 text-lg"
              />
            </div>
            <div>
              <Input
                type="email"
                placeholder="Email Address"
                className="w-full px-6 py-4 rounded-full border border-gray-200 text-lg"
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                className="w-full px-6 py-4 rounded-full border border-gray-200 text-lg"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#0052CC] text-white py-4 rounded-full text-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Sign up
            </button> 
          </form>
        )}
      </div>
    </div>
  )
}
