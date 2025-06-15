
import { LandingNavbar } from "@/components/LandingNavbar";
import { TestimonialsSectionDemo } from "@/components/ui/testimonials-with-marquee";
import { HeroSection } from "@/components/landing/HeroSection";
import { WhyNowSection } from "@/components/landing/WhyNowSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { FloatingElements } from "@/components/landing/FloatingElements";

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

      <footer className="apple-section bg-gray-200/80 dark:bg-gray-900/95 border-t border-gray-200/50">
        <div className="apple-container text-center">
          <p className="text-gray-600 dark:text-gray-400">&copy; {new Date().getFullYear()} Launch Lens. All rights reserved.</p>
          <p className="text-sm text-gray-500 mt-2">Built with love by Lovable AI</p>
        </div>
      </footer>
    </div>
  );
}
