import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const RootRedirect = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--brand-color)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect based on authentication status
  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
};

export default RootRedirect;
