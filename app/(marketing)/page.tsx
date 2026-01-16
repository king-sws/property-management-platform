// app/page.tsx

import { CTASection, FAQSection } from "@/components/landing/FAQSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import { HeroSection } from "@/components/landing/HeroSection";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import PricingSection from "@/components/landing/PricingSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";


export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <LandingNavbar />
      
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>
      
      <LandingFooter />
    </div>
  );
}