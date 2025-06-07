
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, ArrowRight, Lightbulb } from 'lucide-react';
import ComingSoonModal from './ComingSoonModal';

interface ComingSoonTabProps {
  title: string;
  description: string;
  features: string[];
}

const ComingSoonTab: React.FC<ComingSoonTabProps> = ({ title, description, features }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Card className="enhanced-card border-dashed border-2 hover-lift cursor-pointer" onClick={() => setIsModalOpen(true)}>
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center">
            <Clock className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">{title}</CardTitle>
          <Badge variant="outline" className="mx-auto w-fit bg-primary/10 text-primary border-primary/20">
            Coming Soon
          </Badge>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <p className="text-muted-foreground text-center leading-relaxed">
            {description}
          </p>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              What's included:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-4 border-t border-border text-center">
            <Button className="w-full sm:w-auto" onClick={() => setIsModalOpen(true)}>
              Learn More
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <ComingSoonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={title}
        description={description}
        features={features}
      />
    </>
  );
};

export default ComingSoonTab;
