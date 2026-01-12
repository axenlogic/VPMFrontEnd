import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Header from "./Header";
import SubHeader from "./SubHeader";

interface AppLayoutProps {
  children: ReactNode;
  publicRoute?: boolean; // For public routes like intake
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, publicRoute = false }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex h-screen flex-col overflow-hidden" style={{ backgroundColor: 'var(--brand-color)' }}>
      {/* Header - Logo and Logout/Hamburger */}
      <Header />
      
      {/* SubHeader - Only show for authenticated users */}
      {isAuthenticated && <SubHeader publicRoute={publicRoute} />}
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: 'var(--brand-color)' }}>
        {children}
      </main>
    </div>
  );
};

export default AppLayout;

