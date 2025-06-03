
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./icons";
import { useAuth } from "@/contexts/AuthContext";
import { useScrollPosition } from "@/hooks/useScrollPosition";

export function LandingNavbar() {
  const { user, signOut } = useAuth();
  const isScrolled = useScrollPosition(100);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 px-6 md:px-10 transition-all duration-300 ${
        isScrolled 
          ? 'py-2 bg-background/95 backdrop-blur-md shadow-md border-b border-border' 
          : 'py-4 hero-gradient backdrop-blur-md'
      }`}
      style={!isScrolled ? {opacity: 0.9} : undefined}
    >
      <div className="container mx-auto flex justify-between items-center">
        <Logo />
        <div className="flex items-center space-x-4">
          {user ? (
            // User is logged in - show dashboard link and sign out
            <>
              <Button variant="ghost" asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </>
          ) : (
            // User is not logged in - show login and signup
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button className="gradient-button" asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
