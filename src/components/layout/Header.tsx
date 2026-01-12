import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Menu } from "lucide-react";
import NavigationDrawer from "./NavigationDrawer";

const Header = () => {
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <header 
        className="h-16 border-b border-white/20 flex items-center justify-between px-6"
        style={{ backgroundColor: 'var(--brand-color)' }}
      >
        {/* Logo */}
        <div className="flex items-center">
          <img 
            src="/vpm-logo.png" 
            alt="VPM Logo" 
            className="h-10 w-auto object-contain cursor-pointer"
            onClick={() => navigate(isAuthenticated ? "/dashboard" : "/")}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>

        {/* Right Side - Hamburger for non-authenticated, Logout for authenticated */}
        <div className="flex items-center gap-4">
          {/* Hamburger Menu Button - Only show for non-authenticated users */}
          {!isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDrawerOpen(true)}
              className="h-12 w-12 bg-[#294a4a] text-white hover:bg-[#375b59] hover:scale-105 transition-all duration-200 rounded-xl shadow-lg hover:shadow-xl border-2 border-white/20"
              aria-label="Open navigation menu"
            >
              <Menu className="h-6 w-6" />
            </Button>
          )}

          {/* Logout Button - Only show if authenticated */}
          {isAuthenticated && (
            <Button
              onClick={logout}
              variant="default"
              className="flex items-center gap-2"
              style={{ backgroundColor: '#294a4a', color: 'white' }}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          )}
        </div>
      </header>

      {/* Navigation Drawer - Only render for non-authenticated users */}
      {!isAuthenticated && (
        <NavigationDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
      )}
    </>
  );
};

export default Header;

