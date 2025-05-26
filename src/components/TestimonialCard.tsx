
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Assuming shadcn avatar

interface TestimonialCardProps {
  imageInitials: string;
  name: string;
  title: string;
  quote: string;
  imageSrc?: string; // Optional image source
}

export const TestimonialCard: React.FC<TestimonialCardProps> = ({ imageInitials, name, title, quote, imageSrc }) => {
  return (
    <Card className="glassmorphism-card p-6 hover-scale transition-transform duration-300 flex flex-col h-full">
      <CardHeader className="items-center pt-4 pb-2">
        <Avatar className="w-20 h-20 mb-4 border-2 border-primary/50">
          {imageSrc && <AvatarImage src={imageSrc} alt={name} />}
          <AvatarFallback className="text-2xl bg-primary/20 text-primary font-semibold">
            {imageInitials}
          </AvatarFallback>
        </Avatar>
        <h3 className="text-lg font-semibold font-heading text-foreground">{name}</h3>
        <p className="text-sm text-primary">{title}</p>
      </CardHeader>
      <CardContent className="text-center flex-grow">
        <p className="text-muted-foreground italic">"{quote}"</p>
      </CardContent>
    </Card>
  );
};
