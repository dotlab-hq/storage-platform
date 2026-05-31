import { Link } from '@tanstack/react-router'

export function Footer() {
  return (
    <footer className="border-t border-white/60 bg-[#f6f7fb] text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <span className="text-xs font-semibold">D</span>
              </div>
              <span className="text-base font-semibold tracking-wide">Dot Storage</span>
            </div>
            <p className="max-w-xs text-sm leading-6 text-slate-500">
              Your files, your infrastructure, your control.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-900">Product</h3>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#features" className="transition hover:text-slate-900">Features</a></li>
              <li><a href="#benefits" className="transition hover:text-slate-900">Benefits</a></li>
              <li><a href="#use-cases" className="transition hover:text-slate-900">Use cases</a></li>
              <li><a href="#" className="transition hover:text-slate-900">API docs</a></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-900">Company</h3>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#" className="transition hover:text-slate-900">About</a></li>
              <li><a href="#" className="transition hover:text-slate-900">Security</a></li>
              <li><a href="#" className="transition hover:text-slate-900">Status</a></li>
              <li><a href="#" className="transition hover:text-slate-900">Contact</a></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-900">Legal</h3>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#" className="transition hover:text-slate-900">Privacy</a></li>
              <li><a href="#" className="transition hover:text-slate-900">Terms</a></li>
              <li><a href="#" className="transition hover:text-slate-900">Compliance</a></li>
              <li><a href="#" className="transition hover:text-slate-900">Cookies</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-200 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-slate-500">
              Copyright 2025 Dot Storage. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-slate-500 transition hover:text-slate-900">Twitter</a>
              <a href="#" className="text-slate-500 transition hover:text-slate-900">GitHub</a>
              <a href="#" className="text-slate-500 transition hover:text-slate-900">Discord</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
