import { TrendingUp, Clock, DollarSign, Users } from "lucide-react";

export const WhyNowSection = () => {
  return (
    <section className="apple-section">
      <div className="apple-container">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-semibold mb-8 text-foreground">
              The way founders access strategic guidance has{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                fundamentally changed
              </span>
            </h2>
          </div>

          {/* Visual Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            <div className="text-center p-6 rounded-2xl bg-surface/50 border border-border-subtle">
              <DollarSign className="w-8 h-8 text-primary mx-auto mb-3" />
              <div className="text-2xl font-bold text-foreground">$100K+</div>
              <div className="text-sm text-muted-foreground">Traditional consulting cost</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-surface/50 border border-border-subtle">
              <Clock className="w-8 h-8 text-accent mx-auto mb-3" />
              <div className="text-2xl font-bold text-foreground">6+ months</div>
              <div className="text-sm text-muted-foreground">Typical waiting time</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-surface/50 border border-border-subtle">
              <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-foreground">5 minutes</div>
              <div className="text-sm text-muted-foreground">Our analysis time</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-surface/50 border border-border-subtle">
              <Users className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-foreground">10K+</div>
              <div className="text-sm text-muted-foreground">Founders helped</div>
            </div>
          </div>
          
          {/* Content with better spacing */}
          <div className="space-y-12">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                While traditional consulting remains locked behind six-figure fees and months of waiting, 
                breakthrough AI has made world-class strategic analysis instant and accessible.
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                This isn't just an improvement. It's a complete transformation in how founders 
                can access the intelligence they need to build successful companies.
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto text-center p-8 rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20">
              <p className="text-xl md:text-2xl text-foreground font-medium">
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
