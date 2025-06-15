
import { TrendingUp, Clock, DollarSign, Users } from "lucide-react";

export const WhyNowSection = () => {
  return (
    <section className="apple-section py-16">
      <div className="apple-container">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-6 text-foreground leading-tight">
              The way founders access strategic guidance has{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                fundamentally changed
              </span>
            </h2>
          </div>

          {/* Visual Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="text-center p-4 rounded-xl bg-surface/50 border border-border-subtle">
              <DollarSign className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="text-lg font-bold text-foreground">$100K+</div>
              <div className="text-xs text-muted-foreground">Traditional consulting cost</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-surface/50 border border-border-subtle">
              <Clock className="w-6 h-6 text-accent mx-auto mb-2" />
              <div className="text-lg font-bold text-foreground">6+ months</div>
              <div className="text-xs text-muted-foreground">Typical waiting time</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-surface/50 border border-border-subtle">
              <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <div className="text-lg font-bold text-foreground">5 minutes</div>
              <div className="text-xs text-muted-foreground">Our analysis time</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-surface/50 border border-border-subtle">
              <Users className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <div className="text-lg font-bold text-foreground">10K+</div>
              <div className="text-xs text-muted-foreground">Founders helped</div>
            </div>
          </div>
          
          {/* Content with better spacing */}
          <div className="space-y-8">
            <div className="max-w-2xl mx-auto text-center">
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                While traditional consulting remains locked behind six-figure fees and months of waiting, 
                breakthrough AI has made world-class strategic analysis instant and accessible.
              </p>
            </div>
            
            <div className="max-w-2xl mx-auto text-center">
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                This isn't just an improvement. It's a complete transformation in how founders 
                can access the intelligence they need to build successful companies.
              </p>
            </div>
            
            <div className="max-w-2xl mx-auto text-center p-6 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20">
              <p className="text-base md:text-lg text-foreground font-medium">
                Simply powerful. Powerfully simple.{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                  Welcome to the future.
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
