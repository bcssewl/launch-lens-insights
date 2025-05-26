
import { Lightbulb } from "lucide-react"; // Or Brain

export const Logo = ({ className }: { className?: string }) => (
  <div className={`flex items-center space-x-2 ${className}`}>
    <Lightbulb className="h-7 w-7 text-primary" />
    <span className="font-heading text-2xl font-bold text-foreground">
      Launch Lens
    </span>
  </div>
);
