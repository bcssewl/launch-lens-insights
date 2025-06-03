
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, BarChart3, FlaskConical } from "lucide-react";

const FeatureCard = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
  <Card className="apple-card p-8 text-center hover:scale-105 transition-all duration-500 h-full flex flex-col border-0">
    <CardHeader className="items-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6">
        <Icon className="w-8 h-8 text-primary" />
      </div>
      <CardTitle className="text-xl font-semibold mb-4">{title}</CardTitle>
    </CardHeader>
    <CardContent className="flex-grow">
      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{description}</p>
    </CardContent>
  </Card>
);

export const FeaturesSection = () => (
  <section className="apple-section">
    <div className="apple-container">
      <div className="text-center mb-16">
        <h2 className="apple-heading">
          Validate Ideas, Build with Confidence
        </h2>
        <p className="apple-subheading">
          Everything you need to validate your next big idea
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        <FeatureCard
          icon={Zap}
          title="Lightning Fast Analysis"
          description="Get comprehensive validation in minutes, not months. Our AI cuts through the noise to give you actionable insights."
        />
        <FeatureCard
          icon={BarChart3}
          title="Data-Driven Insights"
          description="TAM analysis, competitor research, and market scoring powered by real-time data and advanced algorithms."
        />
        <FeatureCard
          icon={FlaskConical}
          title="Actionable Experiments"
          description="Specific tests to validate your riskiest assumptions and find product-market fit faster than ever."
        />
      </div>
    </div>
  </section>
);
