import { Link } from '@tanstack/react-router'

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg" />
          <span className="text-lg font-semibold text-gray-900">Dot Storage</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition">
            Features
          </a>
          <a href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900 transition">
            How It Works
          </a>
          <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 transition">
            Pricing
          </a>
          <a href="#about" className="text-sm text-gray-600 hover:text-gray-900 transition">
            About
          </a>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition">
            Sign in
          </button>
          <button className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition">
            Get Started
          </button>
        </div>
      </div>
    </nav>
  )
}
