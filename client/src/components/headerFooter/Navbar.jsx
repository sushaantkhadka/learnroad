import { GraduationCap } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link className="flex items-center justify-center" to={"/"}>
          <GraduationCap className="h-6 w-6 text-blue-600" />
          <span className="ml-2 text-2xl font-bold text-gray-900">LearnRoad</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:underline underline-offset-4" to={"/"}>
            Features
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" to={"/"}>
            How It Works
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" to={"/"}>
            Testimonials
          </Link>
          <Link
          className="ml-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          to={"/auth"}
        >
          Join Now
        </Link>
        </nav>
      </header>
  )
}
