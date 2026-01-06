import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/user";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallbackPath?: string;
}

const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  fallbackPath = "/dashboard",
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

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

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Get user role from profile (assuming it's stored in user object or needs to be fetched)
  const userRole = (user as any)?.role || "public";

  if (!allowedRoles.includes(userRole as UserRole)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;

