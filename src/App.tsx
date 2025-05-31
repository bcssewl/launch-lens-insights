
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
const ForgotPasswordPage = () => (
  <div className="min-h-screen page-background flex items-center justify-center">
    <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/50 to-background">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
    </div>
    <div className="relative z-10 glassmorphism-card p-8 text-center">
      <h1 className="text-2xl font-bold text-foreground">Forgot Password Page</h1>
      <p className="text-muted-foreground">Coming Soon!</p>
    </div>
  </div>
);

const TermsPage = () => (
  <div className="min-h-screen page-background flex items-center justify-center">
    <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/50 to-background">
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
    </div>
    <div className="relative z-10 glassmorphism-card p-8 text-center">
      <h1 className="text-2xl font-bold text-foreground">Terms of Service</h1>
      <p className="text-muted-foreground">Coming Soon!</p>
    </div>
  </div>
);

const PrivacyPage = () => (
  <div className="min-h-screen page-background flex items-center justify-center">
    <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/50 to-background">
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
    </div>
    <div className="relative z-10 glassmorphism-card p-8 text-center">
      <h1 className="text-2xl font-bold text-foreground">Privacy Policy</h1>
      <p className="text-muted-foreground">Coming Soon!</p>
    </div>
  </div>
);

// Placeholder for other dashboard sub-pages if needed
const ExperimentsPage = () => (
  <div className="min-h-screen page-background flex items-center justify-center">
    <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/50 to-background">
      <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-accent/20 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
    </div>
    <div className="relative z-10 glassmorphism-card p-8 text-center">
      <h1 className="text-2xl font-bold text-foreground">Experiments Page</h1>
      <p className="text-muted-foreground">Coming Soon!</p>
    </div>
  </div>
);

const BillingPage = () => (
  <div className="min-h-screen page-background flex items-center justify-center">
    <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/50 to-background">
      <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-primary/20 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
    </div>
    <div className="relative z-10 glassmorphism-card p-8 text-center">
      <h1 className="text-2xl font-bold text-foreground">Billing Page</h1>
      <p className="text-muted-foreground">Coming Soon!</p>
    </div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
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
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
