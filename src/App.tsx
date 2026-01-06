import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "./contexts/AuthContext";
import { UserProvider } from "./contexts/UserContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleGuard from "./components/RoleGuard";
import AppLayout from "./components/layout/AppLayout";
import RootRedirect from "./components/RootRedirect";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Main from "./pages/Main";
import NotFound from "./pages/NotFound";
import IntakeForm from "./pages/IntakeForm";
import IntakeStatus from "./pages/IntakeStatus";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import IntakeProcessing from "./pages/admin/IntakeProcessing";
import { UserRole } from "./types/user";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
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

                {/* Public auth routes - No layout */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Public intake routes - With layout */}
                <Route 
                  path="/intake" 
                  element={
                    <AppLayout>
                      <IntakeForm />
                    </AppLayout>
                  } 
                />
                <Route 
                  path="/intake/status" 
                  element={
                    <AppLayout>
                      <IntakeStatus />
                    </AppLayout>
                  } 
                />

                {/* Protected routes with layout */}
                <Route
                  path="/main"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Main />
                      </AppLayout>
                    </ProtectedRoute>
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
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute>
                      <RoleGuard allowedRoles={["vpm_admin"]}>
                        <AppLayout>
                          <AdminDashboard />
                        </AppLayout>
                      </RoleGuard>
                    </ProtectedRoute>
                  }
                />
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
);

export default App;
