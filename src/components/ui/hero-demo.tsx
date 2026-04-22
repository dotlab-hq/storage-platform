import { NavbarHero } from '@/components/ui/hero-with-video'

const HeroDemo = () => {
  return (
    <NavbarHero
      brandName="DOT"
      heroTitle="Storage for Gods"
      heroSubtitle="Early Access Available"
      heroDescription="Your files, anywhere. Secure cloud storage powered by S3-compatible providers."
      emailPlaceholder="enter@email.com"
    />
  )
}

export { HeroDemo }
