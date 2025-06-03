
import { PricingCard } from "@/components/PricingCard";

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

export const PricingSection = () => (
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
);
