import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as ReduxProvider } from "react-redux";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "./contexts/AuthContext";
import { UserProvider } from "./contexts/UserContext";
import { store } from "./store";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleGuard from "./components/RoleGuard";
import AppLayout from "./components/layout/AppLayout";
import RootRedirect from "./components/RootRedirect";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import IntakeForm from "./pages/IntakeForm";
import IntakeStatus from "./pages/IntakeStatus";
import Dashboard from "./pages/Dashboard";
import IntakeProcessing from "./pages/admin/IntakeProcessing";
import { UserRole } from "./types/user";

const queryClient = new QueryClient();

const App = () => (
  <ReduxProvider store={store}>
    <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <UserProvider>
              <Routes>
                {/* Default route with smart redirect */}
                <Route path="/" element={<RootRedirect />} />

                {/* Public auth routes - No layout, but redirect if already authenticated */}
                <Route 
                  path="/login" 
                  element={
                    <ProtectedRoute redirectIfAuthenticated={true} redirectTo="/dashboard">
                      <Login />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/signup" 
                  element={
                    <ProtectedRoute redirectIfAuthenticated={true} redirectTo="/dashboard">
                      <Signup />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/verify-email" 
                  element={
                    <ProtectedRoute redirectIfAuthenticated={true} redirectTo="/dashboard">
                      <VerifyEmail />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/forgot-password" 
                  element={
                    <ProtectedRoute redirectIfAuthenticated={true} redirectTo="/dashboard">
                      <ForgotPassword />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/reset-password" 
                  element={
                    <ProtectedRoute redirectIfAuthenticated={true} redirectTo="/dashboard">
                      <ResetPassword />
                    </ProtectedRoute>
                  } 
                />

                {/* Public intake routes - With layout (public access only) */}
                <Route 
                  path="/intake" 
                  element={
                    <AppLayout publicRoute={true}>
                      <IntakeForm />
                    </AppLayout>
                  } 
                />
                <Route 
                  path="/intake/status" 
                  element={
                    <AppLayout publicRoute={true}>
                      <IntakeStatus />
                    </AppLayout>
                  } 
                />

                {/* Dashboard - accessible to all authenticated users */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Dashboard />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Admin routes - VPM Admin only */}
                <Route
                  path="/admin/intake/:id"
                  element={
                    <ProtectedRoute>
                      <RoleGuard allowedRoles={["vpm_admin"]}>
                        <AppLayout>
                          <IntakeProcessing />
                        </AppLayout>
                      </RoleGuard>
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              </UserProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </ReduxProvider>
);

export default App;
