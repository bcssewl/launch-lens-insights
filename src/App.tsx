
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage"; // Changed from Index
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "./components/ThemeProvider";
// Placeholder pages for login/signup to avoid errors for now
const LoginPage = () => <div className="h-screen flex items-center justify-center">Login Page Placeholder - Coming Soon!</div>;
const SignUpPage = () => <div className="h-screen flex items-center justify-center">Sign Up Page Placeholder - Coming Soon!</div>;
const DashboardPage = () => <div className="h-screen flex items-center justify-center">Dashboard Page Placeholder - Coming Soon!</div>;


const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
