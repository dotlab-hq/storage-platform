import { motion } from 'framer-motion'
import { Cloud, PackageSearch, ShieldCheck, Boxes, SlidersHorizontal, HeartHandshake } from 'lucide-react'

const featureCards = [
  {
    icon: Cloud,
    title: 'Multi-provider cloud',
    text: 'Plug in different compatible storage providers and route data with one consistent interface.',
  },
  {
    icon: ShieldCheck,
    title: 'Safe deletion workflow',
    text: 'Trash, queue, and permanent removal are explicit so you never silently lose data.',
  },
  {
    icon: SlidersHorizontal,
    title: 'Developer-ready controls',
    text: 'Type-safe server functions, validation, and optimistic UI make the platform pleasant to extend.',
  },
]

const useCases = [
  'Storage dashboard for teams and clients',
  'S3-compatible backend for apps and tools',
  'Offline-first file manager with sync',
  'Provider abstraction layer for migration',
]

const benefits = [
  {
    icon: Boxes,
    title: 'Great for large file libraries',
    text: 'Pagination and background sync keep the UI fast even when the dataset grows.',
  },
  {
    icon: PackageSearch,
    title: 'Simple discovery',
    text: 'A clear visual hierarchy helps users understand files, buckets, and actions quickly.',
  },
  {
    icon: HeartHandshake,
    title: 'Trust and clarity',
    text: 'The experience feels deliberate, so the product reads as premium and reliable.',
  },
]

export function LandingHighlights() {
  return (
    <main className="relative">
      <section id="features" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.55 }}>
          <div className="mb-8 flex items-end justify-between gap-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-slate-500">Features</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">A storage platform with a sharper visual identity</h2>
            </div>
            <p className="hidden max-w-xl text-sm leading-7 text-slate-500 lg:block">
              The UI is tuned to feel more like a product launch page than a generic SaaS template, while still explaining the platform clearly.
            </p>
          </div>
        </motion.div>

        <div className="grid gap-4 lg:grid-cols-3">
          {featureCards.map((card, index) => {
            const Icon = card.icon
            return (
              <motion.article
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                whileHover={{ y: -6, rotateX: 4, rotateY: -4 }}
                className="group rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl"
              >
                <Icon className="h-5 w-5 text-indigo-600 transition group-hover:scale-110" />
                <h3 className="mt-5 text-xl font-semibold text-slate-950">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-500">{card.text}</p>
              </motion.article>
            )
          })}
        </div>
      </section>

      <section id="use-cases" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-[0_30px_100px_rgba(15,23,42,0.25)]">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-slate-400">Use cases</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">Built for real storage workflows</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
              Use it as a polished landing surface, a storage control plane, or the front door for S3-compatible APIs and provider orchestration.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {useCases.map((useCase) => (
                <div key={useCase} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                  {useCase}
                </div>
              ))}
            </div>
          </div>

          <div id="benefits" className="grid gap-4">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <motion.article
                  key={benefit.title}
                  initial={{ opacity: 0, x: 14 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  className="flex gap-4 rounded-[1.75rem] border border-white/70 bg-white/80 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.06)] backdrop-blur-xl"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-950">{benefit.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-500">{benefit.text}</p>
                  </div>
                </motion.article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <div className="rounded-[2.25rem] border border-white/70 bg-[linear-gradient(135deg,rgba(17,24,39,0.96),rgba(15,23,42,0.92),rgba(88,28,135,0.88))] px-8 py-12 text-white shadow-[0_30px_120px_rgba(15,23,42,0.24)]">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-slate-300">Why it works</p>
          <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
            The combination of 3D motion, glass surfaces, and careful spacing makes the platform feel premium instead of generic.
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300">
            That visual tone matches the product story: storage should feel calm, trustworthy, and highly controlled.
          </p>
        </div>
      </section>
    </main>
  )
}

export default LandingHighlights