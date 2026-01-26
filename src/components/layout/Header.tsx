import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const Header = () => {
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

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

        {/* Right Side - Logout for authenticated */}
        <div className="flex items-center gap-4">
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
    </>
  );
};

export default Header;

