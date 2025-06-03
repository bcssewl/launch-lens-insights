
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./icons";
import { useAuth } from "@/contexts/AuthContext";

export function LandingNavbar() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 py-4 px-6 md:px-10 bg-gradient-to-r from-[#0a0a0a]/40 to-[#1a1a2e]/40 backdrop-blur-md border-b border-white/10">
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
