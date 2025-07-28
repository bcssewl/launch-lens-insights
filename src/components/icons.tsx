
import { Lightbulb } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

// Logo component for use only within SidebarProvider context
export const Logo = ({ className }: { className?: string }) => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Lightbulb className="h-7 w-7 text-primary flex-shrink-0" />
      {!isCollapsed && (
        <span className="font-heading text-2xl font-bold text-foreground">
          Optivise
        </span>
      )}
    </div>
  );
};

// Logo component for use outside of sidebar context (e.g., footer, landing page)
export const LogoOnly = ({ className }: { className?: string }) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Lightbulb className="h-7 w-7 text-primary flex-shrink-0" />
      <span className="font-heading text-2xl font-bold text-foreground">
        Optivise
      </span>
    </div>
  );
};
