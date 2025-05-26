
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "./components/ThemeProvider";
import SignUpPage from "./pages/SignUpPage"; // Added import
import LoginPage from "./pages/LoginPage";   // Added import

// Placeholder pages for now
const DashboardPage = () => <div className="h-screen flex items-center justify-center">Dashboard Page Placeholder - Coming Soon!</div>;
const ForgotPasswordPage = () => <div className="h-screen flex items-center justify-center">Forgot Password Page Placeholder - Coming Soon!</div>;
const TermsPage = () => <div className="h-screen flex items-center justify-center">Terms of Service - Coming Soon!</div>;
const PrivacyPage = () => <div className="h-screen flex items-center justify-center">Privacy Policy - Coming Soon!</div>;


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
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
