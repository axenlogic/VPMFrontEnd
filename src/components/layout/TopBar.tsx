import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TopBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const {
    profile,
    getDisplayName,
    getEmail,
    isVerified,
  } = useUserProfile();

  const userInitials = user?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <div className="border-b border-border" style={{ backgroundColor: 'var(--brand-color)' }}>
      {/* Top Row - Logo and Icons */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-white/20">
        {/* Left Side - Empty or can add title */}
        <div className="flex items-center gap-3">
        </div>

        {/* Right Side - Action Icons */}
        <div className="flex items-center gap-2">
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-[#375b59] transition-colors">
                <Avatar>
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.full_name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            onClick={logout}
            variant="default"
            className="flex items-center gap-2 ml-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Bottom Row - User Information */}
      {profile && (
        <div className="flex items-center justify-between px-6 py-3 bg-white/30">
          {/* Left Side - User Info */}
          <div className="flex items-center gap-6 flex-1">
            <div>
              <p className="text-sm text-muted-foreground">
                Welcome back, {getDisplayName()}!
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {getEmail()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  isVerified()
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                }`}
              >
                {isVerified()
                  ? "✓ Verified Account"
                  : "⚠ Pending Verification"}
              </span>
              {profile?.id && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  ID: {profile.id}
                </span>
              )}
            </div>
            
            {/* Info Cards */}
            <div className="hidden lg:flex items-center gap-4 ml-4">
              <div className="bg-white/80 rounded-lg p-3 border border-white/30 shadow-sm">
                <h3 className="text-xs font-semibold text-foreground mb-1">
                  Account Status
                </h3>
                <p className="text-xs text-muted-foreground">
                  Active & Verified
                </p>
              </div>
              <div className="bg-white/80 rounded-lg p-3 border border-white/30 shadow-sm">
                <h3 className="text-xs font-semibold text-foreground mb-1">
                  Member Since
                </h3>
                <p className="text-xs text-muted-foreground">
                  {new Date().toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="bg-white/80 rounded-lg p-3 border border-white/30 shadow-sm">
                <h3 className="text-xs font-semibold text-foreground mb-1">
                  Access Level
                </h3>
                <p className="text-xs text-muted-foreground">Standard User</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopBar;

