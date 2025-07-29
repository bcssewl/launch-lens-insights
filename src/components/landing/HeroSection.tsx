
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Users, Star, Zap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { FloatingElements } from "./FloatingElements";
import { DashboardPreview } from "./DashboardPreview";
import { useAuth } from "@/contexts/AuthContext";
import React, { useState } from "react";
import TutorialVideoDialog from "@/components/tutorial/TutorialVideoDialog";

export const HeroSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tutorialOpen, setTutorialOpen] = useState(false);

  const handleSeeHowItWorks = () => {
    try {
      if (user) {
        setTutorialOpen(true);
      } else {
        setTutorialOpen(true);
      }
    } catch (error) {
      console.error('Tutorial error:', error);
      setTutorialOpen(true);
    }
  };

  return (
    <>
      <section className="relative min-h-screen apple-hero flex items-center justify-center overflow-hidden pt-24 md:pt-32">
        <FloatingElements />
        
        <div className="apple-container relative z-10 text-center">
          {/* Social Proof Bar */}
          

          {/* Badge */}
          <div className="apple-badge mb-8 inline-flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>Trusted by 10,000+ founders</span>
          </div>
          
          {/* Main Headline */}
          <h1 className="apple-heading max-w-4xl mx-auto">
            Presenting The Future Of
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">
              Business Guidance
            </span>
          </h1>
          
          {/* Subtitle with better line length */}
          <div className="max-w-2xl mx-auto mb-12">
            <p className="apple-subheading mb-6">
              Deep market insights. Strategic roadmaps. Intelligence that empowers better decisions
            </p>
            
            {/* Key Benefits List */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Instant validation</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Market analysis</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Strategic roadmap</span>
              </div>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
            <Button size="lg" className="apple-button text-lg min-w-[220px]" asChild>
              <Link to="/signup">
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="apple-button-outline text-lg min-w-[220px]" onClick={handleSeeHowItWorks}>
              See How It Works
            </Button>
          </div>
          
          {/* Dashboard Preview */}
          <DashboardPreview />
        </div>
      </section>

      <TutorialVideoDialog 
        open={tutorialOpen}
        onOpenChange={setTutorialOpen}
      />
    </>
  );
};
