
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider } from "./contexts/AuthContext";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ValidateIdeaPage from "./pages/ValidateIdeaPage";
import AnalyzingIdeaPage from "./pages/AnalyzingIdeaPage";
import ResultsPage from "./pages/ResultsPage";
import MyReportsPage from "./pages/MyReportsPage";
import AIAssistantPage from "./pages/AIAssistantPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";

// Placeholder pages for now
const ForgotPasswordPage = () => <div className="h-screen flex items-center justify-center">Forgot Password Page Placeholder - Coming Soon!</div>;
const TermsPage = () => <div className="h-screen flex items-center justify-center">Terms of Service - Coming Soon!</div>;
const PrivacyPage = () => <div className="h-screen flex items-center justify-center">Privacy Policy - Coming Soon!</div>;
// Placeholder for other dashboard sub-pages if needed
const ExperimentsPage = () => <div className="h-screen flex items-center justify-center">Experiments Page - Coming Soon!</div>;
const BillingPage = () => <div className="h-screen flex items-center justify-center">Billing Page - Coming Soon!</div>;

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              
              {/* Dashboard Routes */}
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/dashboard/validate" element={<ValidateIdeaPage />} />
              <Route path="/analyzing" element={<AnalyzingIdeaPage />} />
              <Route path="/results" element={<ResultsPage />} />
              <Route path="/results/:reportId" element={<ResultsPage />} />
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
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
