
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
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
    <section className="relative min-h-screen apple-hero flex items-center justify-center overflow-hidden">
      <FloatingElements />
      
      <div className="apple-container relative z-10 text-center">
        {/* Badge */}
        <div className="apple-badge mb-8 inline-flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>Trusted by 10,000+ founders</span>
        </div>
        
        {/* Main Headline */}
        <h1 className="apple-heading">
          Don't Build What
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">
            Nobody Wants
          </span>
        </h1>
        
        {/* Subtitle */}
        <p className="apple-subheading">
          AI-powered validation that separates winning ideas from expensive mistakes. 
          Validate any business idea in days, not months, with evidence.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
          <Button size="lg" className="apple-button text-lg min-w-[220px]" asChild>
            <Link to="/signup">
              Validate My Idea
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="apple-button-outline text-lg min-w-[220px]" 
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
