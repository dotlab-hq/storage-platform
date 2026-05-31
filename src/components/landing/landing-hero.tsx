import { Suspense } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, ShieldCheck, Sparkles, DatabaseZap } from 'lucide-react'

import { HeroRibbonScene } from '@/components/landing/hero-ribbon-scene'

const floatingStats = [
  { label: 'S3 compatible', value: 'Drop-in' },
  { label: 'Offline sync', value: 'Always-on' },
  { label: 'Trash safety', value: 'Queued' },
]

const heroBenefits = [
  { icon: ShieldCheck, title: 'Controlled storage', text: 'Own the lifecycle, the policies, and the deletion rules.' },
  { icon: DatabaseZap, title: 'Multi-provider ready', text: 'Route files across compatible providers without rewriting your app.' },
  { icon: Sparkles, title: 'Polished UX', text: 'Motion-led interactions feel premium, not template-driven.' },
]

export function LandingHero() {
  return (
    <section className="relative isolate overflow-hidden pt-28">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(199,210,254,0.5),_transparent_34%),radial-gradient(circle_at_80%_10%,_rgba(167,243,255,0.45),_transparent_24%),linear-gradient(180deg,_#f8f9fd_0%,_#f4f6fb_48%,_#eef1f7_100%)]" />
      <div className="absolute inset-x-0 top-0 -z-10 h-[38rem] bg-[linear-gradient(135deg,transparent_0%,rgba(255,255,255,0.5)_25%,transparent_60%)] opacity-60" />

      <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-16 sm:px-6 lg:grid-cols-[1fr_0.95fr] lg:items-center lg:px-8 lg:pb-24">
        <div className="relative z-10 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 text-xs font-medium uppercase tracking-[0.3em] text-slate-600 shadow-sm backdrop-blur"
          >
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            Crafted storage platform
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="mt-8 text-5xl font-semibold leading-[0.95] tracking-[-0.05em] text-slate-950 sm:text-6xl lg:text-7xl"
          >
            Enhance the pace of{' '}
            <span className="italic text-indigo-600">creating</span>
            <span className="block pt-3 text-2xl font-normal tracking-[-0.03em] text-slate-500 sm:text-3xl lg:text-4xl">
              with a secure, S3-compatible cloud that feels custom-built.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16 }}
            className="mt-8 max-w-xl text-base leading-8 text-slate-600 sm:text-lg"
          >
            Dot Storage gives teams a controlled place for files, buckets, sync, and sharing. It is built for product teams, storage-heavy workflows, and users who want a premium cloud surface without the generic look.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24 }}
            className="mt-10 flex flex-col gap-4 sm:flex-row"
          >
            <button className="group inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3.5 text-sm font-medium text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-slate-800">
              Launch platform
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </button>
            <button className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/80 px-6 py-3.5 text-sm font-medium text-slate-700 backdrop-blur transition hover:-translate-y-0.5 hover:border-slate-400 hover:text-slate-950">
              View architecture
            </button>
          </motion.div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {floatingStats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/70 bg-white/70 px-4 py-4 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.26em] text-slate-500">{stat.label}</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-6 rounded-[2.5rem] bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.9),_transparent_72%)] blur-2xl" />
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/70 bg-white/75 shadow-[0_30px_120px_rgba(15,23,42,0.16)] backdrop-blur-2xl">
            <div className="relative h-[30rem] sm:h-[34rem]">
              <Suspense
                fallback={
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-white to-slate-100">
                    <div className="grid w-[85%] gap-4">
                      <div className="h-4 w-1/2 rounded-full bg-slate-200" />
                      <div className="h-56 rounded-[2rem] bg-[linear-gradient(135deg,rgba(216,180,254,0.75),rgba(167,243,255,0.7))]" />
                      <div className="grid grid-cols-3 gap-3">
                        <div className="h-20 rounded-2xl bg-slate-100" />
                        <div className="h-20 rounded-2xl bg-slate-100" />
                        <div className="h-20 rounded-2xl bg-slate-100" />
                      </div>
                    </div>
                  </div>
                }
              >
                <HeroRibbonScene />
              </Suspense>

              <div className="absolute inset-x-4 bottom-4 grid gap-3 sm:grid-cols-3">
                {heroBenefits.map((benefit) => {
                  const Icon = benefit.icon
                  return (
                    <div key={benefit.title} className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-lg shadow-slate-900/5 backdrop-blur-xl">
                      <Icon className="h-5 w-5 text-indigo-600" />
                      <p className="mt-3 text-sm font-semibold text-slate-900">{benefit.title}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{benefit.text}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default LandingHero