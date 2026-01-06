import { ReactNode } from "react";
import Header from "./Header";
import SubHeader from "./SubHeader";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen flex-col overflow-hidden" style={{ backgroundColor: 'var(--brand-color)' }}>
      {/* Header - Logo and Logout */}
      <Header />
      
      {/* SubHeader - Dashboard Title and User Profile */}
      <SubHeader />
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: 'var(--brand-color)' }}>
        {children}
      </main>
    </div>
  );
};

export default AppLayout;

