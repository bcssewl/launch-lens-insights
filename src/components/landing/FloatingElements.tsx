
export const FloatingElements = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="floating-element absolute top-20 left-10 w-4 h-4 bg-primary/20 rounded-full blur-sm"></div>
    <div className="floating-element absolute top-40 right-20 w-6 h-6 bg-accent/30 rounded-square rotate-45"></div>
    <div className="floating-element absolute bottom-40 left-20 w-3 h-3 bg-primary/25 rounded-full"></div>
    <div className="floating-element absolute top-60 right-10 w-8 h-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full"></div>
  </div>
);
