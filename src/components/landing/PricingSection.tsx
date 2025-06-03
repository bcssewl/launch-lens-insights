
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
  <section className="apple-section">
    <div className="apple-container">
      <div className="text-center mb-16">
        <h2 className="apple-heading">
          Simple, Transparent Pricing
        </h2>
        <p className="apple-subheading">
          Choose the plan that's right for your journey. No hidden fees, upgrade or cancel anytime.
        </p>
      </div>
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
      <p className="text-center text-gray-600 dark:text-gray-400 mt-12 text-sm">
        All plans come with a 7-day money-back guarantee.
      </p>
    </div>
  </section>
);
