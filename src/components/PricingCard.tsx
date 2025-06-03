
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
    <div className={`relative h-full ${isFeatured ? 'pricing-premium scale-105 z-10' : 'glass-card-3d'} hover-lift-premium floating`}>
      {isFeatured && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-6 py-2 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm border border-white/20">
            Most Popular
          </div>
        </div>
      )}
      
      <Card className="h-full bg-transparent border-none shadow-none">
        <CardHeader className="pb-6 pt-8">
          <CardTitle className={`text-3xl font-heading mb-3 ${isFeatured ? 'bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent' : 'text-foreground'}`}>
            {tierName}
          </CardTitle>
          <div className="mb-4">
            <span className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {price}
            </span>
            <span className="text-lg text-muted-foreground ml-1">{priceFrequency}</span>
          </div>
          <p className="text-muted-foreground leading-relaxed">{description}</p>
        </CardHeader>
        
        <CardContent className="flex-grow px-6">
          <ul className="space-y-4">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-center mt-0.5">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <span className="text-muted-foreground leading-relaxed">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        
        <CardFooter className="mt-auto pt-8 px-6 pb-8">
          <Button 
            size="lg" 
            className={`w-full py-3 text-lg font-semibold rounded-2xl transition-all duration-300 ${
              isFeatured 
                ? 'premium-gradient shadow-2xl' 
                : 'bg-gradient-to-r from-primary/80 to-accent/80 hover:from-primary hover:to-accent text-primary-foreground shadow-lg hover:shadow-xl'
            }`}
          >
            {ctaText}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
