import { createFileRoute, redirect } from '@tanstack/react-router'
import { loadAuth } from '@/lib/auth-loader'
import { ShuffleGrid } from '@/components/ui/shuffle-grid'
import {
  Cloud,
  HardDrive,
  Lock,
  Zap,
  Globe,
  Shield,
  ArrowRight,
  Database,
  Server,
} from 'lucide-react'

const features = [
  {
    icon: Cloud,
    title: 'Multi-Cloud Orchestration',
    description:
      'Seamlessly manage files across AWS S3, Google Drive, and any S3-compatible provider from a single interface.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast Sync',
    description:
      'Intelligent caching and sync ensure your files are always available, even when offline. Automatic synchronization when back online.',
  },
  {
    icon: Lock,
    title: 'End-to-End Encryption',
    description:
      'Your data stays private with client-side encryption. We never store your raw files or credentials.',
  },
  {
    icon: Globe,
    title: 'Universal Access',
    description:
      'Access your storage from anywhere in the world with any device. Web-native experience built for the cloud.',
  },
  {
    icon: Shield,
    title: 'Enterprise-Grade Security',
    description:
      'SOC 2 compliant infrastructure with granular access controls and audit logging.',
  },
  {
    icon: Database,
    title: 'Smart Organization',
    description:
      'AI-powered file organization, tagging, and search to find anything instantly.',
  },
]

const providers = [
  {
    name: 'AWS S3',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
  },
  {
    name: 'Google Drive',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Google_Drive_icon_%282020%29.svg',
  },
  {
    name: 'Backblaze',
    logo: 'https://www.backblaze.com/wp-content/uploads/2021/12/backblaze-b2-logo-sans-tagline.svg',
  },
  {
    name: 'Wasabi',
    logo: 'https://www.wasabi.com/wp-content/uploads/2024/03/wasabi-logo.svg',
  },
  {
    name: 'Cloudflare R2',
    logo: 'https://www.cloudflare.com/img/logo-cloudflare-dark.svg',
  },
  { name: 'MinIO', logo: 'https://min.io/resources/img/logo.svg' },
]

const stats = [
  { value: '50+', label: 'Storage Providers' },
  { value: '99.99%', label: 'Uptime SLA' },
  { value: '0ms', label: 'Latency Added' },
  { value: '256-bit', label: 'Encryption' },
]

export const Route = createFileRoute('/')({
  component: LandingPage,
  server: {
    loader: async ({ redirect }) => {
      const auth = await loadAuth()
      const session = await auth.api.getSession({ headers: {} })
      if (!session?.user) {
        throw redirect({ to: '/auth' })
      }
    },
  },
})

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="w-full px-4 md:px-8 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 items-center gap-8 lg:gap-16 max-w-7xl mx-auto">
        <div className="order-2 lg:order-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            <span>The Future of Storage</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6">
            One Storage,
            <span className="text-primary block">Infinite Providers</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg">
            The ultimate storage orchestrator that unifies AWS S3, Google Drive,
            and any S3-compatible backend into a single, powerful interface.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="/auth"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="#features"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-border bg-background font-semibold hover:bg-muted transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <ShuffleGrid />
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full py-16 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-24 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything you need to manage your data
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed for developers and teams who demand the
              best in storage infrastructure.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group p-6 rounded-xl border border-border bg-card hover:bg-accent hover:border-primary/50 transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Providers Section */}
      <section className="w-full py-24 px-4 md:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Connect any storage provider
            </h2>
            <p className="text-lg text-muted-foreground">
              Works with all major S3-compatible storage backends
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {providers.map((provider, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity"
              >
                <div className="w-8 h-8 bg-current rounded flex items-center justify-center">
                  <Server className="w-4 h-4 text-background" />
                </div>
                <span className="font-medium text-foreground">
                  {provider.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-24 px-4 md:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Ready to unify your storage?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of developers who already use our platform to manage
            their data infrastructure.
          </p>
          <a
            href="/auth"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/90 transition-colors"
          >
            Start Free Today
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-12 px-4 md:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <HardDrive className="w-6 h-6 text-primary" />
            <span className="font-semibold text-foreground">StorageHub</span>
          </div>
          <div className="text-sm text-muted-foreground">
            © 2024 StorageHub. Built with ❤️ for developers.
          </div>
        </div>
      </footer>
    </div>
  )
}
