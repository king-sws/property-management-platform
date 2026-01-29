// app/page.tsx

import CTASection from "@/components/landing/CTASection";
import FAQSection from "@/components/landing/FAQSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import  HeroSection  from "@/components/landing/HeroSection";
import PricingSection from "@/components/landing/PricingSection";
import TechStackSection from "@/components/landing/TechStackSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";


export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      {/* <Navbar /> */}
      
      <main className="flex-1">
        <HeroSection />
        <TechStackSection />
        <FeaturesSection />
        <PricingSection />
        <FAQSection />
        <TestimonialsSection />
        {/* <CTASection /> */}
      </main>
      
    </div>
  );
}