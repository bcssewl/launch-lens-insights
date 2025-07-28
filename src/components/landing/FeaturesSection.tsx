
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, BarChart3, FlaskConical, Clock, Target, Shield } from "lucide-react";

const FeatureCard = ({ icon: Icon, title, description, metrics }: { 
  icon: React.ElementType, 
  title: string, 
  description: string,
  metrics?: { label: string; value: string }[]
}) => (
  <Card className="apple-card p-8 text-center hover:scale-105 transition-all duration-500 h-full flex flex-col border-0 group">
    <CardHeader className="items-center pb-6">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-8 h-8 text-primary" />
      </div>
      <CardTitle className="text-xl font-semibold mb-4">{title}</CardTitle>
    </CardHeader>
    <CardContent className="flex-grow space-y-4">
      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{description}</p>
      
      {metrics && (
        <div className="pt-4 border-t border-border-subtle/30">
          <div className="flex flex-wrap justify-center gap-4">
            {metrics.map((metric, index) => (
              <div key={index} className="text-center">
                <div className="text-lg font-bold text-primary">{metric.value}</div>
                <div className="text-xs text-muted-foreground">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
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
        <p className="apple-subheading max-w-2xl mx-auto">
          Everything you need to validate your next big idea
        </p>
      </div>

      {/* Main Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <FeatureCard
          icon={Zap}
          title="Lightning Fast Analysis"
          description="Get comprehensive validation in minutes, not months. Our AI cuts through the noise to give you actionable insights."
          metrics={[
            { label: "Analysis time", value: "5 min" },
            { label: "Accuracy rate", value: "94%" }
          ]}
        />
        <FeatureCard
          icon={BarChart3}
          title="Data-Driven Insights"
          description="TAM analysis, competitor research, and market scoring powered by real-time data and advanced algorithms."
          metrics={[
            { label: "Data sources", value: "50+" },
            { label: "Market coverage", value: "Global" }
          ]}
        />
        <FeatureCard
          icon={FlaskConical}
          title="Actionable Experiments"
          description="Specific tests to validate your riskiest assumptions and find product-market fit faster than ever."
          metrics={[
            { label: "Success rate", value: "78%" },
            { label: "Time to PMF", value: "-60%" }
          ]}
        />
      </div>

      {/* Additional Benefits */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="flex items-center gap-4 p-6 rounded-xl bg-surface/30 border border-border-subtle/50">
          <Clock className="w-8 h-8 text-primary flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-foreground">Save 6+ Months</h3>
            <p className="text-sm text-muted-foreground">Skip traditional research cycles</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-6 rounded-xl bg-surface/30 border border-border-subtle/50">
          <Target className="w-8 h-8 text-accent flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-foreground">Precision Targeting</h3>
            <p className="text-sm text-muted-foreground">Find your ideal customer segment</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-6 rounded-xl bg-surface/30 border border-border-subtle/50">
          <Shield className="w-8 h-8 text-green-500 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-foreground">Risk Reduction</h3>
            <p className="text-sm text-muted-foreground">Validate before you invest</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);
