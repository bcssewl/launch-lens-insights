import { TrendingUp, BarChart3, Award, Brain } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const DashboardPreview = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.3, // Trigger when 30% of the element is visible
        rootMargin: '-100px 0px', // Start animation 100px before element comes into view
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={sectionRef}
      className={`max-w-5xl mx-auto apple-card p-8 transition-all duration-1000 ease-out ${
        isVisible 
          ? 'transform scale-100 opacity-100' 
          : 'transform scale-110 opacity-80'
      }`}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="apple-metric-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Validation Score</span>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-3xl font-semibold text-green-500 mb-1">87%</div>
          <div className="text-xs text-gray-500">High potential</div>
        </div>
        <div className="apple-metric-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Market Size</span>
            <BarChart3 className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-semibold text-blue-500 mb-1">$2.4B</div>
          <div className="text-xs text-gray-500">TAM identified</div>
        </div>
        <div className="apple-metric-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Competition</span>
            <Award className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="text-3xl font-semibold text-yellow-500 mb-1">Medium</div>
          <div className="text-xs text-gray-500">Opportunity exists</div>
        </div>
      </div>
      <div className="apple-metric-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <span className="font-semibold">AI Insights</span>
        </div>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          Your SaaS idea shows strong market validation potential. The identified target market of small businesses seeking automation tools represents a $2.4B opportunity with moderate competition density.
        </p>
      </div>
    </div>
  );
};
