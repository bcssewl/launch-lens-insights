
import { Button } from "@/components/ui/button";
import { Star, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { FloatingElements } from "./FloatingElements";
import { DashboardPreview } from "./DashboardPreview";
import { useAuth } from "@/contexts/AuthContext";

export const HeroSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSeeHowItWorks = () => {
    try {
      if (user) {
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error('Navigation error:', error);
      navigate('/login');
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center text-white overflow-hidden pt-20" style={{
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%)'
    }}>
      <FloatingElements />
      
      <div className="container mx-auto px-6 relative z-10 text-center">
        {/* Badge */}
        <div className="hero-badge mb-8 inline-flex items-center gap-2">
          <Star className="w-3 h-3" />
          <span>Build for the future</span>
        </div>
        
        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl font-bold font-heading mb-8 text-shadow">
          Don't Build What
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">
            Nobody Wants
          </span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
          AI-powered validation that separates winning ideas from expensive mistakes. 
          Validate any business idea in days, not months, with evidence.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Button size="lg" className="gradient-button px-8 py-4 text-lg font-semibold min-w-[200px]" asChild>
            <Link to="/signup">
              Validate My Idea
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="px-8 py-4 text-lg border-2 border-white/20 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm min-w-[200px]" 
            onClick={handleSeeHowItWorks}
          >
            See How It Works
          </Button>
        </div>
        
        {/* Dashboard Preview */}
        <DashboardPreview />
      </div>
    </section>
  );
};
