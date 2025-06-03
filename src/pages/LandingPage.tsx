
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, TrendingUp, Zap, Brain, BarChart3, Rocket, FlaskConical, FileText, Users, Award, DollarSign } from "lucide-react";
import { LandingNavbar } from "@/components/LandingNavbar";
import { Link, useNavigate } from "react-router-dom";
import { TestimonialsSectionDemo } from "@/components/ui/testimonials-with-marquee";
import { PricingCard } from "@/components/PricingCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";

const FeatureCard = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
  <div className="glass-card-3d p-8 hover-lift-premium floating h-full flex flex-col">
    <div className="flex flex-col items-center text-center">
      <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/30 text-primary mb-6 inline-block backdrop-blur-sm border border-white/20">
        <Icon className="w-10 h-10" />
      </div>
      <h3 className="text-2xl font-bold font-heading mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        {title}
      </h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  </div>
);

const HowItWorksStep = ({ icon: Icon, step, title, description }: { icon: React.ElementType, step: number, title: string, description: string }) => (
  <div className="glass-card-3d p-8 text-center hover-lift-premium floating-delayed">
    <div className="relative mb-6">
      <div className="p-6 rounded-3xl bg-gradient-to-br from-primary/20 via-accent/20 to-primary/10 text-primary ring-2 ring-primary/30 backdrop-blur-sm mx-auto w-fit">
        <Icon className="w-12 h-12" />
      </div>
      <span className="absolute -top-3 -right-3 bg-gradient-to-r from-accent to-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg">
        {step}
      </span>
    </div>
    <h3 className="text-xl font-bold font-heading mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
      {title}
    </h3>
    <p className="text-muted-foreground leading-relaxed">{description}</p>
  </div>
);

// Data for new sections
const testimonials = [
  {
    imageInitials: "AC",
    name: "Alex Chen",
    title: "Solo Founder",
    quote: "Saved me 6 months and $50K on a doomed SaaS idea. Launch Lens gave me the clarity I desperately needed.",
  },
  {
    imageInitials: "SK",
    name: "Sarah Kim",
    title: "YC Alum",
    quote: "Better than hiring a $300/hour consultant. The AI insights are scarily accurate and incredibly actionable.",
  },
  {
    imageInitials: "MR",
    name: "Marcus Rodriguez",
    title: "Serial Entrepreneur",
    quote: "Wish I had this before my first failed startup. It's like having a seasoned co-founder for idea validation.",
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
    <div className="flex flex-col min-h-screen geometric-bg">
      <LandingNavbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="pt-32 pb-20 md:pt-40 md:pb-28 text-center relative hero-bg">
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-5xl mx-auto">
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold font-heading mb-8 leading-tight">
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                  Don't Build What
                </span>
                <br />
                <span className="text-foreground">Nobody Wants</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
                AI-powered validation that separates winning ideas from expensive mistakes. Validate any business idea in days, not months, with evidence — before writing a single line of code.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
                <Button size="lg" className="premium-gradient px-10 py-4 text-lg font-semibold rounded-2xl shadow-2xl" asChild>
                  <Link to="/signup">Validate My Idea</Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="px-10 py-4 text-lg font-semibold rounded-2xl border-2 border-primary/30 bg-white/10 backdrop-blur-sm hover:bg-primary/10 hover:border-primary/50 transition-all duration-300" 
                  onClick={handleSeeHowItWorks}
                >
                  See How It Works
                </Button>
              </div>
              <div className="relative max-w-4xl mx-auto">
                <div className="glass-card-3d p-8 floating">
                  <p className="text-muted-foreground mb-6 text-lg">
                    Experience the power of AI-driven validation
                  </p>
                  <div className="h-64 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 rounded-2xl"></div>
                    <Brain className="w-32 h-32 text-primary opacity-80 relative z-10 floating" />
                    <div className="absolute top-4 right-4 w-4 h-4 bg-gradient-to-r from-primary to-accent rounded-full floating-delayed"></div>
                    <div className="absolute bottom-6 left-6 w-3 h-3 bg-gradient-to-r from-accent to-primary rounded-full floating"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <TestimonialsSectionDemo />

        {/* Features Grid Section */}
        <section className="py-20 md:py-32 relative">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold font-heading mb-6">
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Validate Ideas,
                </span>
                <br />
                <span className="text-foreground">Build with Confidence</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Powerful AI tools designed to de-risk your startup journey
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              <FeatureCard
                icon={Zap}
                title="Lightning Fast Analysis"
                description="Get comprehensive validation in minutes, not months. Our AI cuts through the noise to deliver actionable insights."
              />
              <FeatureCard
                icon={BarChart3}
                title="Data-Driven Insights"
                description="TAM analysis, competitor research, and market scoring powered by real-time data and advanced algorithms."
              />
              <FeatureCard
                icon={FlaskConical}
                title="Actionable Experiments"
                description="Specific tests to validate your riskiest assumptions and find product-market fit faster than ever."
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 md:py-32 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5">
          <div className="container mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold font-heading mb-6">
                From Idea to Validation in 
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> 4 Simple Steps</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Our streamlined process transforms uncertainty into confidence
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
              <HowItWorksStep
                icon={FileText}
                step={1}
                title="Describe Your Idea"
                description="Tell us about your startup concept, target market, and the problem you're solving."
              />
              <HowItWorksStep
                icon={Brain}
                step={2}
                title="AI Analyzes"
                description="Our algorithms assess market viability, competition, and potential challenges in real-time."
              />
              <HowItWorksStep
                icon={BarChart3}
                step={3}
                title="Get Score & Insights"
                description="Receive a validation score, detailed report, and comprehensive SWOT analysis."
              />
              <HowItWorksStep
                icon={Rocket}
                step={4}
                title="Launch Experiments"
                description="Follow tailored recommendations to test assumptions and refine your idea systematically."
              />
            </div>
          </div>
        </section>

        {/* Pricing Preview Section */}
        <section className="py-20 md:py-32 relative">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold font-heading mb-6">
                Simple, 
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Transparent Pricing</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
                Choose the plan that's right for your journey. No hidden fees, upgrade or cancel anytime.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
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
            <p className="text-center text-muted-foreground mt-16 text-lg">
              All plans come with a 7-day money-back guarantee.
            </p>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-border/20 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 backdrop-blur-sm">
        <div className="container mx-auto px-6 text-center text-muted-foreground">
          <p className="text-lg">&copy; {new Date().getFullYear()} Launch Lens. All rights reserved.</p>
          <p className="text-sm mt-2 opacity-75">Built with love by Lovable AI</p>
        </div>
      </footer>
    </div>
  );
}
