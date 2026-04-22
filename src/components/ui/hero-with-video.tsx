import React, { useState, useEffect } from 'react'
import { useTheme } from '@/hooks/use-theme'
import {
  Mail,
  ArrowRight,
  Menu,
  ChevronDown,
  Sun,
  Moon,
  Cloud,
  Shield,
  Zap,
} from 'lucide-react'

interface NavbarHeroProps {
  brandName?: string
  heroTitle?: string
  heroSubtitle?: string
  heroDescription?: string
  emailPlaceholder?: string
}

const NavbarHero: React.FC<NavbarHeroProps> = ({
  brandName = 'DOT',
  heroTitle = 'Storage for Gods',
  heroSubtitle = 'Join the community',
  heroDescription = 'Your files, anywhere. Secure cloud storage powered by S3-compatible providers.',
  emailPlaceholder = 'enter@email.com',
}) => {
  const [email, setEmail] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleEmailSubmit = () => {
    console.log('Email submitted:', email)
  }

  const toggleDropdown = (dropdownName: string) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName)
  }

  const ThemeToggleButton = () => {
    if (!mounted) return <div className="w-10 h-10" />
    return (
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="bg-muted hover:bg-border flex-shrink-0 p-2.5 rounded-full transition-colors"
        aria-label="Toggle theme"
      >
        {theme === 'light' ? (
          <Moon className="h-5 w-5 text-foreground" />
        ) : (
          <Sun className="h-5 w-5 text-foreground" />
        )}
      </button>
    )
  }

  return (
    <main className="absolute inset-0 bg-background overflow-y-auto">
      <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="py-2 relative z-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="font-bold text-2xl pb-1 text-foreground cursor-pointer flex-shrink-0"
            >
              {brandName}
            </a>
            <nav className="hidden lg:flex text-muted-foreground font-medium">
              <ul className="flex items-center space-x-2">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground px-3 py-2 text-sm transition-colors rounded-lg"
                  >
                    About
                  </a>
                </li>
                <li className="relative">
                  <button
                    onClick={() => toggleDropdown('desktop-resources')}
                    className="flex items-center hover:text-foreground px-3 py-2 text-sm transition-colors rounded-lg"
                  >
                    Resources
                    <ChevronDown
                      className={`h-4 w-4 ml-1 transition-transform ${openDropdown === 'desktop-resources' ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {openDropdown === 'desktop-resources' && (
                    <ul className="absolute top-full left-0 mt-2 p-2 bg-card border border-border shadow-lg rounded-xl z-20 w-48">
                      <li>
                        <a
                          href="#"
                          className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
                        >
                          Submenu 1
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
                        >
                          Submenu 2
                        </a>
                      </li>
                    </ul>
                  )}
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground px-3 py-2 text-sm transition-colors rounded-lg"
                  >
                    Blog
                  </a>
                </li>
                <li className="relative">
                  <button
                    onClick={() => toggleDropdown('desktop-pricing')}
                    className="flex items-center hover:text-foreground px-3 py-2 text-sm transition-colors rounded-lg"
                  >
                    Plans & Pricing
                    <ChevronDown
                      className={`h-4 w-4 ml-1 transition-transform ${openDropdown === 'desktop-pricing' ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {openDropdown === 'desktop-pricing' && (
                    <ul className="absolute top-full left-0 mt-2 p-2 bg-card border border-border shadow-lg rounded-xl z-20 w-48">
                      <li>
                        <a
                          href="#"
                          className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
                        >
                          Plan A
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
                        >
                          Plan B
                        </a>
                      </li>
                    </ul>
                  )}
                </li>
              </ul>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-3">
              <a
                href="#"
                className="text-foreground hover:text-muted-foreground cursor-pointer py-2 px-4 text-sm capitalize font-medium transition-colors rounded-xl"
              >
                Login
              </a>
              <button className="bg-foreground hover:bg-muted-foreground text-background py-2.5 px-5 text-sm rounded-xl capitalize font-medium transition-colors flex items-center gap-2">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <ThemeToggleButton />
            <div className="lg:hidden relative">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="bg-transparent hover:bg-muted border-none p-2 rounded-xl transition-colors"
              >
                <Menu className="h-6 w-6" />
              </button>
              {isMobileMenuOpen && (
                <ul className="absolute top-full right-0 mt-2 p-2 shadow-lg bg-card border border-border rounded-xl w-56 z-30">
                  <li>
                    <a
                      href="#"
                      className="block px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg"
                    >
                      About
                    </a>
                  </li>
                  <li>
                    <button
                      onClick={() => toggleDropdown('mobile-resources')}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg"
                    >
                      Resources
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${openDropdown === 'mobile-resources' ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {openDropdown === 'mobile-resources' && (
                      <ul className="ml-4 mt-1 border-l border-border pl-3">
                        <li>
                          <a
                            href="#"
                            className="block px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg"
                          >
                            Submenu 1
                          </a>
                        </li>
                        <li>
                          <a
                            href="#"
                            className="block px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg"
                          >
                            Submenu 2
                          </a>
                        </li>
                      </ul>
                    )}
                  </li>
                  <li>
                    <a
                      href="#"
                      className="block px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg"
                    >
                      Blog
                    </a>
                  </li>
                  <li>
                    <button
                      onClick={() => toggleDropdown('mobile-pricing')}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg"
                    >
                      Plans & Pricing
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${openDropdown === 'mobile-pricing' ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {openDropdown === 'mobile-pricing' && (
                      <ul className="ml-4 mt-1 border-l border-border pl-3">
                        <li>
                          <a
                            href="#"
                            className="block px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg"
                          >
                            Plan A
                          </a>
                        </li>
                        <li>
                          <a
                            href="#"
                            className="block px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg"
                          >
                            Plan B
                          </a>
                        </li>
                      </ul>
                    )}
                  </li>
                  <li className="border-t border-border mt-2 pt-2 space-y-2">
                    <a
                      href="#"
                      className="block w-full text-center px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg"
                    >
                      Login
                    </a>
                    <button className="w-full bg-foreground text-background hover:bg-muted-foreground px-3 py-2.5 text-sm rounded-lg flex items-center justify-center gap-2 font-medium">
                      Get Started
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="pt-4 pb-10 sm:pt-6 sm:pb-12 text-center">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-5xl md:text-5xl text-foreground font-bold tracking-tight">
              {heroTitle}
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              {heroDescription}
            </p>
            <div className="mt-8 flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                <input
                  type="email"
                  placeholder={emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full max-w-xs bg-muted border-border text-foreground placeholder-muted-foreground font-medium pl-10 pr-4 py-2 text-sm sm:pl-11 sm:py-3 sm:text-base rounded-full focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <button
                onClick={handleEmailSubmit}
                className="bg-foreground hover:bg-muted-foreground text-background px-5 py-2 text-sm sm:px-6 sm:py-3 sm:text-base rounded-full normal-case font-medium transition-colors flex items-center gap-2"
              >
                Join Now
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card/60 backdrop-blur-sm border border-border rounded-2xl p-6 text-center hover:bg-card/80 transition-colors">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
              <Cloud className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Cloud Native</h3>
            <p className="text-sm text-muted-foreground">
              Built on S3-compatible infrastructure for maximum compatibility
            </p>
          </div>
          <div className="bg-card/60 backdrop-blur-sm border border-border rounded-2xl p-6 text-center hover:bg-card/80 transition-colors">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">
              End-to-End Encrypted
            </h3>
            <p className="text-sm text-muted-foreground">
              Your files are encrypted before they leave your device
            </p>
          </div>
          <div className="bg-card/60 backdrop-blur-sm border border-border rounded-2xl p-6 text-center hover:bg-card/80 transition-colors">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">
              Lightning Fast
            </h3>
            <p className="text-sm text-muted-foreground">
              Global CDN ensures your files load instantly anywhere
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

export { NavbarHero }
