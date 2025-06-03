
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, BarChart3, FlaskConical } from "lucide-react";

const FeatureCard = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
  <Card className="text-center glassmorphism-card p-6 hover-scale transition-transform duration-300 h-full flex flex-col">
    <CardHeader className="items-center">
      <div className="p-3 rounded-full bg-accent/20 text-primary mb-4 inline-block">
        <Icon className="w-8 h-8" />
      </div>
      <CardTitle className="text-xl font-heading">{title}</CardTitle>
    </CardHeader>
    <CardContent className="flex-grow">
      <p className="text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export const FeaturesSection = () => (
  <section className="py-16 md:py-24 bg-surface">
    <div className="container mx-auto px-6">
      <h2 className="text-3xl md:text-4xl font-bold font-heading text-center mb-12">
        Validate Ideas, Build with Confidence
      </h2>
      <div className="grid md:grid-cols-3 gap-8">
        <FeatureCard
          icon={Zap}
          title="Lightning Fast Analysis"
          description="Get comprehensive validation in minutes, not months. Our AI cuts through the noise."
        />
        <FeatureCard
          icon={BarChart3}
          title="Data-Driven Insights"
          description="TAM analysis, competitor research, and market scoring powered by real-time data."
        />
        <FeatureCard
          icon={FlaskConical}
          title="Actionable Experiments"
          description="Specific tests to validate your riskiest assumptions and find product-market fit faster."
        />
      </div>
    </div>
  </section>
);
