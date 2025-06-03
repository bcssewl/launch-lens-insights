import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, TrendingUp, Zap, Brain, BarChart3, Rocket, FlaskConical, FileText, Users, Award, DollarSign, ArrowRight, Star } from "lucide-react";
import { LandingNavbar } from "@/components/LandingNavbar";
import { Link, useNavigate } from "react-router-dom";
import { TestimonialsSectionDemo } from "@/components/ui/testimonials-with-marquee";
import { PricingCard } from "@/components/PricingCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";

const FeatureCard = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
  <Card className="text-center glassmorphism-card p-6 hover-scale transition-transform duration-300 h-full flex flex-col">
    <CardHeader className="items-center">
      <div className="p-3 rounded-full bg-accent/20 text-primary mb-4 inline-block">
        <Icon className="w-8 h-8" />
      </div>
      <CardTitle className="text-xl font-heading">{title}</CardTitle>
    </CardHeader>
    <CardContent className="flex-grow">
      <p className="text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const HowItWorksStep = ({ icon: Icon, step, title, description }: { icon: React.ElementType, step: number, title: string, description: string }) => (
  <div className="flex flex-col items-center text-center p-4">
    <div className="relative mb-4">
      <div className="p-4 rounded-full bg-primary/10 text-primary ring-2 ring-primary/30">
        <Icon className="w-10 h-10" />
      </div>
      <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
        {step}
      </span>
    </div>
    <h3 className="text-lg font-semibold font-heading mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

// Floating geometric elements component
const FloatingElements = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="floating-element absolute top-20 left-10 w-4 h-4 bg-primary/20 rounded-full blur-sm"></div>
    <div className="floating-element absolute top-40 right-20 w-6 h-6 bg-accent/30 rounded-square rotate-45"></div>
    <div className="floating-element absolute bottom-40 left-20 w-3 h-3 bg-primary/25 rounded-full"></div>
    <div className="floating-element absolute top-60 right-10 w-8 h-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full"></div>
  </div>
);

// Dashboard Preview Component
const DashboardPreview = () => (
  <div className="dashboard-preview max-w-4xl mx-auto">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="metric-card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Validation Score</span>
          <TrendingUp className="w-4 h-4 text-green-400" />
        </div>
        <div className="text-2xl font-bold text-green-400">87%</div>
        <div className="text-xs text-muted-foreground">High potential</div>
      </div>
      <div className="metric-card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Market Size</span>
          <BarChart3 className="w-4 h-4 text-blue-400" />
        </div>
        <div className="text-2xl font-bold text-blue-400">$2.4B</div>
        <div className="text-xs text-muted-foreground">TAM identified</div>
      </div>
      <div className="metric-card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Competition</span>
          <Award className="w-4 h-4 text-yellow-400" />
        </div>
        <div className="text-2xl font-bold text-yellow-400">Medium</div>
        <div className="text-xs text-muted-foreground">Opportunity exists</div>
      </div>
    </div>
    <div className="bg-white/5 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-5 h-5 text-primary" />
        <span className="text-sm font-medium">AI Insights</span>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Your SaaS idea shows strong market validation potential. The identified target market of small businesses seeking automation tools represents a $2.4B opportunity with moderate competition density.
      </p>
    </div>
  </div>
);

// Data for new sections
const testimonials = [
  {
    imageInitials: "AC",
    name: "Alex Chen",
    title: "Solo Founder",
    quote: "Saved me 6 months and $50K on a doomed SaaS idea. Launch Lens gave me the clarity I desperately needed.",
    // imageSrc: "/placeholder-alex.jpg"
  },
  {
    imageInitials: "SK",
    name: "Sarah Kim",
    title: "YC Alum",
    quote: "Better than hiring a $300/hour consultant. The AI insights are scarily accurate and incredibly actionable.",
    // imageSrc: "/placeholder-sarah.jpg"
  },
  {
    imageInitials: "MR",
    name: "Marcus Rodriguez",
    title: "Serial Entrepreneur",
    quote: "Wish I had this before my first failed startup. It's like having a seasoned co-founder for idea validation.",
    // imageSrc: "/placeholder-marcus.jpg"
  },
];

const pricingTiers = [
  {
    tierName: "Starter",
    price: "$19",
    description: "For individuals validating a few ideas.",
    features: ["5 validations per month", "Basic validation reports", "Email support"],
    ctaText: "Choose Starter",
  },
  {
    tierName: "Founder",
    price: "$49",
    description: "Perfect for serious founders and early-stage startups.",
    features: ["Unlimited validations", "Detailed reports & insights", "AI chat assistant access", "Priority email support"],
    isFeatured: true,
    ctaText: "Choose Founder",
  },
  {
    tierName: "Team",
    price: "$99",
    description: "Collaborate with your team and scale your efforts.",
    features: ["All Founder features", "Multi-user access (up to 5)", "Collaboration features", "Dedicated support channel"],
    ctaText: "Choose Team",
  },
];

export default function LandingPage() {
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
    <div className="flex flex-col min-h-screen">
      <LandingNavbar />
      <main className="flex-grow">
        {/* Hero Section - Luro Inspired */}
        <section className="relative min-h-screen hero-gradient flex items-center justify-center text-white overflow-hidden">
          <FloatingElements />
          
          <div className="container mx-auto px-6 relative z-10 text-center">
            {/* Badge */}
            <div className="hero-badge mb-8 inline-flex items-center gap-2">
              <Star className="w-3 h-3" />
              <span>Build for the future</span>
            </div>
            
            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold font-heading mb-8 text-shadow">
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

        {/* Social Proof Section - UPDATED with Marquee */}
        <TestimonialsSectionDemo />

        {/* Features Grid Section - UPDATED */}
        <section className="py-16 md:py-24 bg-surface">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-center mb-12">
              Validate Ideas, Build with Confidence
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={Zap} // Lightning bolt icon
                title="Lightning Fast Analysis"
                description="Get comprehensive validation in minutes, not months. Our AI cuts through the noise."
              />
              <FeatureCard
                icon={BarChart3} // Chart icon
                title="Data-Driven Insights"
                description="TAM analysis, competitor research, and market scoring powered by real-time data."
              />
              <FeatureCard
                icon={FlaskConical} // Flask icon
                title="Actionable Experiments"
                description="Specific tests to validate your riskiest assumptions and find product-market fit faster."
              />
            </div>
          </div>
        </section>

        {/* How It Works Section - UPDATED */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-center mb-16">
              From Idea to Validation in 4 Simple Steps
            </h2>
            <div className="grid md:grid-cols-4 gap-8 relative">
              <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2">
                <div className="w-full h-full flex justify-between items-center px-16">
                    <div className="flex-1 border-t-2 border-dashed border-border"></div>
                </div>
              </div>

              <HowItWorksStep
                icon={FileText} // Form icon
                step={1}
                title="Describe Your Idea"
                description="Tell us about your startup concept, target market, and problem you're solving."
              />
              <HowItWorksStep
                icon={Brain} // Brain icon
                step={2}
                title="AI Analyzes"
                description="Our algorithms assess market viability, competition, and potential challenges."
              />
              <HowItWorksStep
                icon={BarChart3} // Chart icon
                step={3}
                title="Get Score & Insights"
                description="Receive a validation score, detailed report, and SWOT analysis."
              />
              <HowItWorksStep
                icon={Rocket} // Rocket icon
                step={4}
                title="Launch Experiments"
                description="Follow tailored recommendations to test assumptions and refine your idea."
              />
            </div>
          </div>
        </section>

        {/* Pricing Preview Section - NEW */}
        <section className="py-16 md:py-24 bg-surface">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-center mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
              Choose the plan that's right for your journey. No hidden fees, upgrade or cancel anytime.
            </p>
            <div className="grid md:grid-cols-3 gap-8 items-stretch">
              {pricingTiers.map((tier, index) => (
                <PricingCard
                  key={index}
                  tierName={tier.tierName}
                  price={tier.price}
                  description={tier.description}
                  features={tier.features}
                  isFeatured={tier.isFeatured}
                  ctaText={tier.ctaText}
                />
              ))}
            </div>
             <p className="text-center text-muted-foreground mt-12 text-sm">
              All plans come with a 7-day money-back guarantee.
            </p>
          </div>
        </section>
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
