
import { LandingNavbar } from "@/components/LandingNavbar";
import { TestimonialsSectionDemo } from "@/components/ui/testimonials-with-marquee";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { PricingSection } from "@/components/landing/PricingSection";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <LandingNavbar />
      <main className="flex-grow">
        <HeroSection />
        <TestimonialsSectionDemo />
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection />
      </main>

      <footer className="apple-section bg-gray-50/50 border-t border-gray-200/50">
        <div className="apple-container text-center">
          <p className="text-gray-600 dark:text-gray-400">&copy; {new Date().getFullYear()} Launch Lens. All rights reserved.</p>
          <p className="text-sm text-gray-500 mt-2">Built with love by Lovable AI</p>
        </div>
      </footer>
    </div>
  );
}
