
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider } from "./contexts/AuthContext";

// Import all pages
import LandingPage from "./pages/LandingPage";
import WaitlistPage from "./pages/WaitlistPage";
import NotFound from "./pages/NotFound";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import EmailConfirmationPage from "./pages/EmailConfirmationPage";
import DashboardPage from "./pages/DashboardPage";
import ValidateIdeaPage from "./pages/ValidateIdeaPage";
import AnalyzingIdeaPage from "./pages/AnalyzingIdeaPage";
import ResultsPage from "./pages/ResultsPage";
import MyBusinessIdeasPage from "./pages/MyBusinessIdeasPage";
import MyReportsPage from "./pages/MyReportsPage";
import BusinessDashboardPage from "./pages/BusinessDashboardPage";
import AIAssistantPage from "./pages/AIAssistantPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import SharedReportPage from "./pages/SharedReportPage";
import ProjectsPage from "./pages/ProjectsPage";
import ClientWorkspacePage from "./pages/ClientWorkspacePage";

// Placeholder pages for now
const ForgotPasswordPage = () => <div className="h-screen flex items-center justify-center">Forgot Password Page Placeholder - Coming Soon!</div>;
const TermsPage = () => <div className="h-screen flex items-center justify-center">Terms of Service - Coming Soon!</div>;
const PrivacyPage = () => <div className="h-screen flex items-center justify-center">Privacy Policy - Coming Soon!</div>;
const ExperimentsPage = () => <div className="h-screen flex items-center justify-center">Experiments Page - Coming Soon!</div>;
const BillingPage = () => <div className="h-screen flex items-center justify-center">Billing Page - Coming Soon!</div>;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AuthProvider>
            <TooltipProvider>
              <div className="min-h-screen bg-background text-foreground">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/waitlist" element={<WaitlistPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignUpPage />} />
                  <Route path="/auth/confirm" element={<EmailConfirmationPage />} />
                  
                  {/* Dashboard Routes */}
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/dashboard/validate" element={<ValidateIdeaPage />} />
                  <Route path="/analyzing" element={<AnalyzingIdeaPage />} />
                  <Route path="/results" element={<ResultsPage />} />
                  <Route path="/results/:reportId" element={<ResultsPage />} />
                  <Route path="/dashboard/ideas" element={<MyBusinessIdeasPage />} />
                  <Route path="/dashboard/projects" element={<ProjectsPage />} />
                  <Route path="/dashboard/client/:clientId" element={<ClientWorkspacePage />} />
                  <Route path="/dashboard/reports" element={<MyReportsPage />} />
                  <Route path="/dashboard/business-idea/:ideaId" element={<BusinessDashboardPage />} />
                  <Route path="/dashboard/assistant" element={<AIAssistantPage />} />
                  <Route path="/dashboard/experiments" element={<ExperimentsPage />} />
                  <Route path="/dashboard/settings" element={<SettingsPage />} />
                  <Route path="/dashboard/profile" element={<ProfilePage />} />
                  <Route path="/dashboard/billing" element={<BillingPage />} />
                  
                  {/* Shared Report Route */}
                  <Route path="/shared-report/:shareToken" element={<SharedReportPage />} />
                  
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
              
              <Toaster />
              <Sonner />
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
