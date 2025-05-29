
import { Lightbulb } from "lucide-react"; // Or Brain
import { useSidebar } from "@/components/ui/sidebar";

export const Logo = ({ className }: { className?: string }) => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Lightbulb className="h-7 w-7 text-primary flex-shrink-0" />
      {!isCollapsed && (
        <span className="font-heading text-2xl font-bold text-foreground">
          Launch Lens
        </span>
      )}
    </div>
  );
};
