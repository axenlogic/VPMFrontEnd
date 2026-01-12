import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import NavigationDrawer from "./NavigationDrawer";

interface SubHeaderProps {
  publicRoute?: boolean; // For public routes like intake
}

const SubHeader = ({ publicRoute = false }: SubHeaderProps) => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { profile, getDisplayName, getEmail } = useUserProfile();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Get page title based on route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith("/intake/status")) return "Check Status";
    if (path.startsWith("/intake")) return "Intake Form";
    if (path.startsWith("/admin/intake")) return "Intake Processing";
    if (path.startsWith("/dashboard")) return "Dashboard";
    return "Dashboard";
  };

  const userInitials = profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <>
      <div 
        className="h-16 border-b border-white/20 flex items-center justify-between px-6"
        style={{ backgroundColor: 'var(--brand-color)' }}
      >
        {/* Left Side - Page Title */}
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-foreground">{getPageTitle()}</h1>
        </div>

        {/* Right Side - User Profile + Hamburger */}
        <div className="flex items-center gap-4">
          {/* User Profile - Only show if authenticated (not on public routes) */}
          {!publicRoute && isAuthenticated && profile && (
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 shadow-sm">
              <Avatar className="h-10 w-10 border-2 border-white/40 shadow-md">
                <AvatarFallback className="bg-gradient-to-br from-[#294a4a] to-[#375b59] text-white font-semibold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col">
                <p className="text-sm font-semibold text-[#294a4a] leading-tight">
                  {getDisplayName()}
                </p>
                <p className="text-xs text-[#375b59] leading-tight truncate max-w-[200px]">
                  {getEmail()}
                </p>
              </div>
            </div>
          )}

          {/* Hamburger Menu Button - Only show for authenticated users */}
          {isAuthenticated && (
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
        </div>
      </div>

      {/* Navigation Drawer - Only render for authenticated users */}
      {isAuthenticated && (
        <NavigationDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
      )}
    </>
  );
};

export default SubHeader;

