import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import WaitlistPage from "./pages/WaitlistPage";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider } from "./contexts/AuthContext";
import { ReasoningProvider } from "./contexts/ReasoningContext";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import EmailConfirmationPage from "./pages/EmailConfirmationPage";
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
import ChatPage from "./pages/ChatPage";

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
          <ReasoningProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/waitlist" element={<WaitlistPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/auth/confirm" element={<EmailConfirmationPage />} />
                
                {/* Redirect dashboard to AI Assistant since dashboard is removed */}
                <Route path="/dashboard" element={<Navigate to="/dashboard/assistant" replace />} />
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
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TooltipProvider>
          </ReasoningProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
