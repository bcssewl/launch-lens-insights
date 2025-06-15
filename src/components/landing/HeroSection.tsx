
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Users, Star, Zap } from "lucide-react";
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
    <section className="relative min-h-screen apple-hero flex items-center justify-center overflow-hidden pt-16 md:pt-20">
      <FloatingElements />
      
      <div className="apple-container relative z-10 text-center">
        {/* Social Proof Bar */}
        <div className="flex flex-wrap justify-center items-center gap-4 mb-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Users className="w-3 h-3" />
            <span>10,000+ founders</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Star className="w-3 h-3 text-yellow-500" />
            <span>4.9/5 rating</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-primary" />
            <span>5-minute setup</span>
          </div>
        </div>

        {/* Badge */}
        <div className="apple-badge mb-6 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs">
          <CheckCircle className="w-3 h-3" />
          <span>Trusted by 10,000+ founders</span>
        </div>
        
        {/* Main Headline */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-6 max-w-3xl mx-auto leading-tight">
          Presenting the future of
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">
            business guidance
          </span>
        </h1>
        
        {/* Subtitle with better line length */}
        <div className="max-w-xl mx-auto mb-8">
          <p className="text-base md:text-lg text-muted-foreground mb-4 leading-relaxed">
            Deep market insights. Strategic roadmaps. Intelligence that empowers better decisions
          </p>
          
          {/* Key Benefits List */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-muted-foreground">
            <div className="flex items-center justify-center gap-1.5">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>Instant validation</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>Market analysis</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>Strategic roadmap</span>
            </div>
          </div>
        </div>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-12">
          <Button size="default" className="apple-button min-w-[180px]" asChild>
            <Link to="/signup">
              Validate My Idea
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
          <Button size="default" variant="outline" className="apple-button-outline min-w-[180px]" onClick={handleSeeHowItWorks}>
            See How It Works
          </Button>
        </div>
        
        {/* Dashboard Preview */}
        <DashboardPreview />
      </div>
    </section>
  );
};
