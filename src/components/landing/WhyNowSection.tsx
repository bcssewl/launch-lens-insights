
export const WhyNowSection = () => {
  return (
    <section className="apple-section bg-white/50 dark:bg-gray-900/50">
      <div className="apple-container">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-semibold mb-8 text-foreground">
            The way founders access strategic guidance has{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              fundamentally changed
            </span>
          </h2>
          
          <div className="space-y-6 text-xl md:text-2xl text-muted-foreground leading-relaxed">
            <p>
              While traditional consulting remains locked behind six-figure fees and months of waiting, 
              breakthrough AI has made world-class strategic analysis instant and accessible.
            </p>
            
            <p>
              This isn't just an improvement. It's a complete transformation in how founders 
              can access the intelligence they need to build successful companies.
            </p>
            
            <p className="text-foreground font-medium">
              Simply powerful. Powerfully simple.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                Welcome to the future.
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
