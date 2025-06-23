
import React from 'react';
import { LandingNavbar } from '@/components/LandingNavbar';
import { Footer } from '@/components/ui/footer-section';
import { GridBackground } from '@/components/ui/grid-background';
import WaitlistSignupForm from '@/components/waitlist/WaitlistSignupForm';
import { CheckCircle, Zap, Users, Star } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';

const WaitlistPage = () => {
  return (
    <div className="relative min-h-screen">
      <GridBackground />
      <LandingNavbar />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-xl mx-auto p-8 space-y-12 pt-32">
          <div className="space-y-6 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-white">Early Access • Limited Spots</span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-br from-gray-200 to-gray-600">
              Join Our Product Launch Waitlist
            </h2>
            <p className="text-xl text-gray-400 max-w-lg mx-auto">
              Be part of something truly extraordinary. Join thousands of others
              already gaining early access to our revolutionary new product.
            </p>
          </div>

          {/* Signup Form */}
          <div className="mb-16">
            <WaitlistSignupForm />
          </div>

          <div className="flex flex-col items-center gap-8">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                <Avatar className="border-2 w-12 h-12 border-white/20">
                  <AvatarFallback className="text-sm font-semibold bg-purple-600 text-white">JD</AvatarFallback>
                </Avatar>
                <Avatar className="border-2 w-12 h-12 border-white/20">
                  <AvatarFallback className="text-sm font-semibold bg-blue-600 text-white">AS</AvatarFallback>
                </Avatar>
                <Avatar className="border-2 w-12 h-12 border-white/20">
                  <AvatarFallback className="text-sm font-semibold bg-blue-700 text-white">MK</AvatarFallback>
                </Avatar>
              </div>
              <span className="font-bold text-white">2,847+ people on the waitlist</span>
            </div>

            <div className="flex gap-6 justify-center">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-gray-300"
              >
                <Icons.twitter className="w-5 h-5 fill-current" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-gray-300"
              >
                <Icons.gitHub className="w-5 h-5 fill-current" />
              </Button>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 mb-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2 text-white">Instant Validation</h3>
              <p className="text-sm text-gray-400">
                Get comprehensive market analysis and validation reports in minutes, not weeks
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 mb-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2 text-white">Expert Insights</h3>
              <p className="text-sm text-gray-400">
                AI-powered analysis backed by real market data and startup expertise
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 mb-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-3 text-white">Early Access Benefits</h3>
              <p className="text-sm text-gray-400">
                Lifetime discount, exclusive features, and direct feedback line to our team
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default WaitlistPage;
