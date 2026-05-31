import { Link } from '@tanstack/react-router'

export function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/50 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/landing" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/15">
            <span className="text-sm font-semibold">D</span>
          </div>
          <div className="leading-tight">
            <span className="block text-sm font-semibold tracking-[0.24em] text-slate-900 uppercase">
              Dot Storage
            </span>
            <span className="block text-xs text-slate-500">
              Secure cloud storage
            </span>
          </div>
        </Link>

        <div className="hidden items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 shadow-sm md:flex">
          <a href="#features" className="rounded-full px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-900 hover:text-white">
            Features
          </a>
          <a href="#use-cases" className="rounded-full px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-900 hover:text-white">
            Use cases
          </a>
          <a href="#benefits" className="rounded-full px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-900 hover:text-white">
            Benefits
          </a>
        </div>

        <div className="flex items-center gap-3">
          <button className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
            Sign in
          </button>
          <button className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-slate-800">
            Get Started
          </button>
        </div>
      </div>
    </nav>
  )
}
