
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "./components/ThemeProvider";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage"; // Added import

// Placeholder pages for now
const ForgotPasswordPage = () => <div className="h-screen flex items-center justify-center">Forgot Password Page Placeholder - Coming Soon!</div>;
const TermsPage = () => <div className="h-screen flex items-center justify-center">Terms of Service - Coming Soon!</div>;
const PrivacyPage = () => <div className="h-screen flex items-center justify-center">Privacy Policy - Coming Soon!</div>;
// Placeholder for other dashboard sub-pages if needed
const ValidateIdeaPage = () => <div className="h-screen flex items-center justify-center">Validate Idea Page - Coming Soon!</div>;
const MyReportsPage = () => <div className="h-screen flex items-center justify-center">My Reports Page - Coming Soon!</div>;
const AIAssistantPage = () => <div className="h-screen flex items-center justify-center">AI Assistant Page - Coming Soon!</div>;
const ExperimentsPage = () => <div className="h-screen flex items-center justify-center">Experiments Page - Coming Soon!</div>;
const SettingsPage = () => <div className="h-screen flex items-center justify-center">Settings Page - Coming Soon!</div>;
const ProfilePage = () => <div className="h-screen flex items-center justify-center">Profile Page - Coming Soon!</div>;
const BillingPage = () => <div className="h-screen flex items-center justify-center">Billing Page - Coming Soon!</div>;


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
            
            {/* Dashboard Routes */}
            <Route path="/dashboard" element={<DashboardPage />} />
            {/* Example sub-routes for dashboard - can be expanded later */}
            <Route path="/dashboard/validate" element={<ValidateIdeaPage />} />
            <Route path="/dashboard/reports" element={<MyReportsPage />} />
            <Route path="/dashboard/assistant" element={<AIAssistantPage />} />
            <Route path="/dashboard/experiments" element={<ExperimentsPage />} />
            <Route path="/dashboard/settings" element={<SettingsPage />} />
            <Route path="/dashboard/profile" element={<ProfilePage />} />
            <Route path="/dashboard/billing" element={<BillingPage />} />


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
