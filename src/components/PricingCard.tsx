
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface PricingCardProps {
  tierName: string;
  price: string;
  priceFrequency?: string;
  description: string;
  features: string[];
  isFeatured?: boolean;
  ctaText?: string;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  tierName,
  price,
  priceFrequency = "/month",
  description,
  features,
  isFeatured = false,
  ctaText = "Get Started"
}) => {
  return (
    <Card className={`flex flex-col h-full p-6 transition-transform duration-300 hover-scale ${isFeatured ? 'border-primary ring-2 ring-primary shadow-xl bg-primary/5 glassmorphism-card' : 'glassmorphism-card'}`}>
      <CardHeader className="pb-4">
        <CardTitle className={`text-2xl font-heading mb-2 ${isFeatured ? 'text-primary' : 'text-foreground'}`}>{tierName}</CardTitle>
        <p className="text-4xl font-bold">
          {price}
          <span className="text-sm font-normal text-muted-foreground">{priceFrequency}</span>
        </p>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className={`w-5 h-5 mr-2 mt-0.5 ${isFeatured ? 'text-primary' : 'text-green-500'}`} />
              <span className="text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="mt-auto pt-6">
        <Button size="lg" className={`w-full ${isFeatured ? 'gradient-button' : 'bg-primary hover:bg-primary/90 text-primary-foreground'}`}>
          {ctaText}
        </Button>
      </CardFooter>
    </Card>
  );
};
