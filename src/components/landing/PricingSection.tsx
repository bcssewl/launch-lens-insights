
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
  <section className="apple-section py-16">
    <div className="apple-container">
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-4 text-foreground">
          Simple, Transparent Pricing
        </h2>
        <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Choose the plan that's right for your journey. No hidden fees, upgrade or cancel anytime.
        </p>
        
        {/* Popular Choice Indicator */}
        <div className="flex items-center justify-center gap-2 mt-4 mb-6">
          <Star className="w-3 h-3 text-yellow-500 fill-current" />
          <span className="text-xs text-muted-foreground">
            <strong>89% of customers</strong> choose the Founder plan
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 items-stretch mb-12">
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
      <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl p-6 border border-primary/20">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-3">
            All plans include
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2 text-center md:text-left">
            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className="text-xs text-muted-foreground">7-day money-back guarantee</span>
          </div>
          <div className="flex items-center gap-2 text-center md:text-left">
            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className="text-xs text-muted-foreground">Cancel anytime, no commitments</span>
          </div>
          <div className="flex items-center gap-2 text-center md:text-left">
            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className="text-xs text-muted-foreground">Free migration assistance</span>
          </div>
        </div>
      </div>

      <p className="text-center text-gray-600 dark:text-gray-400 mt-6 text-xs">
        Need a custom plan? <a href="#" className="text-primary hover:underline">Contact our sales team</a>
      </p>
    </div>
  </section>
);
