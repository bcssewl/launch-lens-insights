
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./icons";
import { useAuth } from "@/contexts/AuthContext";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";

export function LandingNavbar() {
  const { user, signOut } = useAuth();
  const isScrolled = useScrollPosition(100);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 px-6 md:px-10 transition-all duration-300 ${
          isScrolled 
            ? 'py-2 bg-surface/95 backdrop-blur-md shadow-md border-b border-border-subtle' 
            : 'py-4 bg-transparent backdrop-blur-sm'
        }`}
      >
        <div className="container mx-auto flex justify-between items-center">
          <Logo />
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Button variant="ghost" asChild className="text-text-secondary hover:text-text-primary">
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
                <Button variant="outline" onClick={handleSignOut} className="border-border-subtle hover:bg-surface-elevated">
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild className="text-text-secondary hover:text-text-primary">
                  <Link to="/login">Login</Link>
                </Button>
                <Button className="bg-primary text-primary-foreground hover:bg-primary-hover" asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </>
            )}
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-text-primary"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <Drawer open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <DrawerContent className="h-full max-h-[100vh] w-[60%] ml-auto bg-surface-elevated border-l border-border-subtle rounded-none">
          <DrawerHeader className="border-b border-border-subtle">
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-lg font-semibold text-text-primary">Menu</DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-5 w-5" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>
          
          <div className="flex flex-col p-6 space-y-4 flex-1">
            {user ? (
              <>
                <Button variant="ghost" asChild className="justify-start text-text-secondary hover:text-text-primary">
                  <Link to="/dashboard" onClick={closeMobileMenu}>
                    Dashboard
                  </Link>
                </Button>
                <Button variant="outline" onClick={handleSignOut} className="justify-start border-border-subtle hover:bg-surface-elevated-2">
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild className="justify-start text-text-secondary hover:text-text-primary">
                  <Link to="/login" onClick={closeMobileMenu}>
                    Login
                  </Link>
                </Button>
                <Button className="justify-start bg-primary text-primary-foreground hover:bg-primary-hover" asChild>
                  <Link to="/signup" onClick={closeMobileMenu}>
                    Sign Up
                  </Link>
                </Button>
              </>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
