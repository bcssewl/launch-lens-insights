
import React from "react";
import { PricingCard } from "@/components/PricingCard";
import { CheckCircle, Star } from "lucide-react";

const pricingTiers = [
  {
    tierName: "Starter",
    price: "$19",
    description: "For individuals validating a few ideas.",
    features: ["5 validations per month", "Basic validation reports", "Email support", "Dashboard access"],
    ctaText: "Choose Starter",
  },
  {
    tierName: "Founder",
    price: "$49",
    description: "Perfect for serious founders and early-stage startups.",
    features: ["Unlimited validations", "Detailed reports & insights", "AI chat assistant access", "Priority email support", "Advanced analytics"],
    isFeatured: true,
    ctaText: "Choose Founder",
  },
  {
    tierName: "Team",
    price: "$99",
    description: "Collaborate with your team and scale your efforts.",
    features: ["All Founder features", "Multi-user access (up to 5)", "Collaboration features", "Dedicated support channel", "Custom integrations"],
    ctaText: "Choose Team",
  },
];

export const PricingSection = () => (
  <section className="apple-section">
    <div className="apple-container">
      <div className="text-center mb-16">
        <h2 className="apple-heading">
          Simple, Transparent Pricing
        </h2>
        <p className="apple-subheading max-w-2xl mx-auto">
          Choose the plan that's right for your journey. No hidden fees, upgrade or cancel anytime.
        </p>
        
        {/* Popular Choice Indicator */}
        <div className="flex items-center justify-center gap-2 mt-6 mb-8">
          <Star className="w-4 h-4 text-yellow-500 fill-current" />
          <span className="text-sm text-muted-foreground">
            <strong>89% of customers</strong> choose the Founder plan
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 items-stretch mb-16">
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

      {/* Additional Benefits */}
      <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-8 border border-primary/20">
        <div className="text-center mb-8">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            All plans include
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3 text-center md:text-left">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span className="text-sm text-muted-foreground">7-day money-back guarantee</span>
          </div>
          <div className="flex items-center gap-3 text-center md:text-left">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span className="text-sm text-muted-foreground">Cancel anytime, no commitments</span>
          </div>
          <div className="flex items-center gap-3 text-center md:text-left">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span className="text-sm text-muted-foreground">Free migration assistance</span>
          </div>
        </div>
      </div>

      <p className="text-center text-gray-600 dark:text-gray-400 mt-8 text-sm">
        Need a custom plan? <a href="#" className="text-primary hover:underline">Contact our sales team</a>
      </p>
    </div>
  </section>
);
