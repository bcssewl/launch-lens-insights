
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./icons";

export function LandingNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 py-4 px-6 md:px-10 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto flex justify-between items-center">
        <Logo />
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link to="/login">Login</Link>
          </Button>
          <Button className="gradient-button" asChild>
            <Link to="/signup">Sign Up</Link>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
