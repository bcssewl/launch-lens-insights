
import React from 'react';
import { LandingNavbar } from '@/components/LandingNavbar';
import { Footer } from '@/components/ui/footer-section';
import { FloatingElements } from '@/components/landing/FloatingElements';
import WaitlistSignupForm from '@/components/waitlist/WaitlistSignupForm';
import { CheckCircle, Zap, Users, Star } from 'lucide-react';

const WaitlistPage = () => {
  return (
    <div className="flex flex-col min-h-screen apple-hero">
      <FloatingElements />
      <LandingNavbar />
      
      <main className="flex-grow pt-24 md:pt-32">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6">
          <div className="apple-container relative z-10 text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="apple-badge mb-8 inline-flex items-center gap-2">
              <Star className="w-4 h-4" />
              <span>Early Access • Limited Spots</span>
            </div>
            
            {/* Main Headline */}
            <h1 className="apple-heading mb-6">
              Get Early Access to
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">
                The Future of Business Validation
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="apple-subheading max-w-2xl mx-auto mb-12">
              Join thousands of entrepreneurs who are getting first access to Optivise — 
              the AI-powered platform that validates your business ideas before you build.
            </p>
            
            {/* Signup Form */}
            <div className="mb-16">
              <WaitlistSignupForm />
            </div>
            
            {/* Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 mb-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Instant Validation</h3>
                <p className="text-sm text-muted-foreground">
                  Get comprehensive market analysis and validation reports in minutes, not weeks
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 mb-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Expert Insights</h3>
                <p className="text-sm text-muted-foreground">
                  AI-powered analysis backed by real market data and startup expertise
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 mb-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-3">Early Access Benefits</h3>
                <p className="text-sm text-muted-foreground">
                  Lifetime discount, exclusive features, and direct feedback line to our team
                </p>
              </div>
            </div>
            
            {/* Social Proof */}
            <div className="border border-border-subtle rounded-2xl p-8 bg-surface-elevated/50 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="flex -space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent border-2 border-background"
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">2,847+ founders waiting</span>
              </div>
              <p className="text-sm text-muted-foreground">
                "Finally, a way to validate ideas without spending months building. 
                Can't wait to try this!" — Sarah M., YC Founder
              </p>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default WaitlistPage;
