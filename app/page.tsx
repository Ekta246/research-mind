import { HeroSection } from "@/components/landing/hero-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { DemoSection } from "@/components/landing/demo-section"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { PricingSection } from "@/components/landing/pricing-section"
import { FooterSection } from "@/components/landing/footer-section"
import { LandingNavbar } from "@/components/landing/landing-navbar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

export default function Home() {
  // Check if environment variables are set
  const isMissingEnvVars = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return (
    <div className="flex min-h-screen flex-col">
      <LandingNavbar />

      {isMissingEnvVars && (
        <Alert variant="destructive" className="mx-auto mt-4 max-w-4xl">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Configuration Error</AlertTitle>
          <AlertDescription>
            Supabase environment variables are missing or invalid. Please check your environment configuration.
          </AlertDescription>
        </Alert>
      )}

      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <DemoSection />
        <TestimonialsSection />
        <PricingSection />
      </main>
      <FooterSection />
    </div>
  )
}
