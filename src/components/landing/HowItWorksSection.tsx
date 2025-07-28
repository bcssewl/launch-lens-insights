
import React from "react";
import { FileText, Brain, BarChart3, Rocket, ArrowDown } from "lucide-react";
import { HowItWorksStep } from "./HowItWorksStep";
export const HowItWorksSection = () => <section className="apple-section">
    <div className="apple-container">
      <div className="text-center mb-16">
        <h2 className="apple-heading">
          From Idea to Validation in 4 Simple Steps
        </h2>
        <p className="apple-subheading max-w-2xl mx-auto">
          Our streamlined process gets you answers fast
        </p>
      </div>

      {/* Desktop Grid with Visual Connections */}
      <div className="hidden md:block">
        <div className="grid md:grid-cols-4 gap-8 relative">
          {/* Connecting Lines */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 z-0">
            <div className="w-full h-full flex justify-between items-center px-16">
              
            </div>
          </div>

          <HowItWorksStep icon={FileText} step={1} title="Describe Your Idea" description="Tell us about your startup concept, target market, and problem you're solving." />
          <HowItWorksStep icon={Brain} step={2} title="AI Analyzes" description="Our algorithms assess market viability, competition, and potential challenges." />
          <HowItWorksStep icon={BarChart3} step={3} title="Get Score & Insights" description="Receive a validation score, detailed report, and SWOT analysis." />
          <HowItWorksStep icon={Rocket} step={4} title="Launch Experiments" description="Follow tailored recommendations to test assumptions and refine your idea." />
        </div>
      </div>

      {/* Mobile Vertical Layout */}
      <div className="md:hidden space-y-8">
        <HowItWorksStep icon={FileText} step={1} title="Describe Your Idea" description="Tell us about your startup concept, target market, and problem you're solving." />
        <div className="flex justify-center">
          <ArrowDown className="w-6 h-6 text-primary/50" />
        </div>
        <HowItWorksStep icon={Brain} step={2} title="AI Analyzes" description="Our algorithms assess market viability, competition, and potential challenges." />
        <div className="flex justify-center">
          <ArrowDown className="w-6 h-6 text-primary/50" />
        </div>
        <HowItWorksStep icon={BarChart3} step={3} title="Get Score & Insights" description="Receive a validation score, detailed report, and SWOT analysis." />
        <div className="flex justify-center">
          <ArrowDown className="w-6 h-6 text-primary/50" />
        </div>
        <HowItWorksStep icon={Rocket} step={4} title="Launch Experiments" description="Follow tailored recommendations to test assumptions and refine your idea." />
      </div>

      {/* Call to Action */}
      <div className="text-center mt-16 p-8 rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20">
        <h3 className="text-xl font-semibold text-foreground mb-4">
          Ready to validate your idea?
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Join thousands of founders who've accelerated their journey with Optivise
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <div className="px-4 py-2 bg-surface/50 rounded-lg border border-border-subtle">
            <div className="text-sm font-medium text-foreground">Average completion time</div>
            <div className="text-lg font-bold text-primary">5 minutes</div>
          </div>
          <div className="px-4 py-2 bg-surface/50 rounded-lg border border-border-subtle">
            <div className="text-sm font-medium text-foreground">Success rate</div>
            <div className="text-lg font-bold text-green-500">94%</div>
          </div>
        </div>
      </div>
    </div>
  </section>;
