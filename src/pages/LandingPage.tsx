
import { LandingNavbar } from "@/components/LandingNavbar";
import { TestimonialsSectionDemo } from "@/components/ui/testimonials-with-marquee";
import { HeroSection } from "@/components/landing/HeroSection";
import { WhyNowSection } from "@/components/landing/WhyNowSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { FloatingElements } from "@/components/landing/FloatingElements";
import { Footer } from "@/components/ui/footer-section";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen apple-hero">
      <FloatingElements />
      <LandingNavbar />
      <main className="flex-grow">
        <HeroSection />
        <WhyNowSection />
        <FeaturesSection />
        <TestimonialsSectionDemo />
        <HowItWorksSection />
        <PricingSection />
      </main>

      <Footer />
    </div>
  );
}
