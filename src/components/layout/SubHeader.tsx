import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import NavigationDrawer from "./NavigationDrawer";

const SubHeader = () => {
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
    if (path.startsWith("/admin/dashboard")) return "Admin Dashboard";
    if (path.startsWith("/dashboard")) return "Dashboard";
    if (path.startsWith("/main")) return "Main";
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
        <div className="flex items-center gap-3">
          {/* User Profile - Only show if authenticated */}
          {isAuthenticated && profile && (
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-white/30">
                <AvatarFallback className="bg-gradient-to-br from-[#294a4a] to-[#375b59] text-white font-semibold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col">
                <p className="text-sm font-semibold text-foreground leading-tight">
                  {getDisplayName()}
                </p>
                <p className="text-xs text-muted-foreground leading-tight truncate max-w-[200px]">
                  {getEmail()}
                </p>
              </div>
            </div>
          )}

          {/* Hamburger Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDrawerOpen(true)}
            className="h-10 w-10 hover:bg-[#375b59] hover:text-white transition-colors rounded-lg"
            aria-label="Open navigation menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Navigation Drawer */}
      <NavigationDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </>
  );
};

export default SubHeader;

