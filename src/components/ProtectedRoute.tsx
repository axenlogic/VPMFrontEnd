import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectIfAuthenticated?: boolean; // If true, redirect authenticated users away
  redirectTo?: string; // Where to redirect (default: /login for unauthenticated, /dashboard for authenticated)
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectIfAuthenticated = false,
  redirectTo = "/login"
}) => {
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

  // If this route should redirect authenticated users (e.g., login/signup pages)
  if (redirectIfAuthenticated && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // If this route requires authentication and user is not authenticated
  if (!redirectIfAuthenticated && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
