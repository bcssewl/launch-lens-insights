
import { FileText, Brain, BarChart3, Rocket } from "lucide-react";
import { HowItWorksStep } from "./HowItWorksStep";

export const HowItWorksSection = () => (
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
          icon={FileText}
          step={1}
          title="Describe Your Idea"
          description="Tell us about your startup concept, target market, and problem you're solving."
        />
        <HowItWorksStep
          icon={Brain}
          step={2}
          title="AI Analyzes"
          description="Our algorithms assess market viability, competition, and potential challenges."
        />
        <HowItWorksStep
          icon={BarChart3}
          step={3}
          title="Get Score & Insights"
          description="Receive a validation score, detailed report, and SWOT analysis."
        />
        <HowItWorksStep
          icon={Rocket}
          step={4}
          title="Launch Experiments"
          description="Follow tailored recommendations to test assumptions and refine your idea."
        />
      </div>
    </div>
  </section>
);
