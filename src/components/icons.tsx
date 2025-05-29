
import { Lightbulb } from "lucide-react"; // Or Brain
import { useSidebar } from "@/components/ui/sidebar";

export const Logo = ({ className }: { className?: string }) => {
  // Safely handle the case where useSidebar might not be available
  let isCollapsed = false;
  try {
    const { state } = useSidebar();
    isCollapsed = state === "collapsed";
  } catch (error) {
    // If useSidebar is not available, default to expanded state
    console.log("useSidebar not available, defaulting to expanded state");
  }

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
