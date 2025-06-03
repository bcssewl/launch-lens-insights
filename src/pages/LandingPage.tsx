
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

      <footer className="py-8 border-t border-border bg-surface">
        <div className="container mx-auto px-6 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Launch Lens. All rights reserved.</p>
          <p className="text-sm">Built with love by Lovable AI</p>
        </div>
      </footer>
    </div>
  );
}
