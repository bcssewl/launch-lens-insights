
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export const WhyNowSection = () => {
  const paragraphs = [
    "While traditional consulting remains locked behind six-figure fees and months of waiting, breakthrough AI has made world-class strategic analysis instant and accessible.",
    "This isn't just an improvement. It's a complete transformation in how founders can access the intelligence they need to build successful companies.",
    "Simply powerful. Powerfully simple. Welcome to the future."
  ];

  const { activeStep, sectionRef } = useScrollAnimation(paragraphs.length);

  return (
    <section ref={sectionRef} className="apple-section bg-white/50 dark:bg-gray-900/50 min-h-screen flex items-center">
      <div className="apple-container">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-semibold mb-8 text-foreground">
            The way founders access strategic guidance has{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              fundamentally changed
            </span>
          </h2>
          
          <div className="relative min-h-[200px] flex items-center justify-center">
            {paragraphs.map((paragraph, index) => (
              <div
                key={index}
                className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ease-in-out ${
                  activeStep === index
                    ? 'opacity-100 transform translate-y-0'
                    : 'opacity-0 transform translate-y-4'
                }`}
              >
                <p className={`text-xl md:text-2xl leading-relaxed max-w-3xl mx-auto px-4 ${
                  index === paragraphs.length - 1
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground'
                }`}>
                  {index === paragraphs.length - 1 ? (
                    <>
                      Simply powerful. Powerfully simple.{" "}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                        Welcome to the future.
                      </span>
                    </>
                  ) : (
                    paragraph
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
