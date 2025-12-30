import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Button } from "@/components/ui/button";
import { LogOut, User, Home, Settings, Bell, RefreshCw } from "lucide-react";

const Main = () => {
  const { logout } = useAuth();
  const {
    profile,
    isLoading,
    error,
    refreshProfile,
    getDisplayName,
    getEmail,
    isVerified,
  } = useUserProfile();

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <nav className="bg-card border-b border-border shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Home className="w-6 h-6 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Virtual peace of mind
                </h1>
                <p className="text-sm text-muted-foreground">
                  Welcome, {getDisplayName()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={refreshProfile}
                disabled={isLoading}
                title="Refresh Profile"
              >
                <RefreshCw
                  className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
                />
              </Button>
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
              <Button
                onClick={logout}
                variant="outline"
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <p className="text-sm text-red-800">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshProfile}
                className="ml-auto"
              >
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && !profile && (
          <div className="bg-card rounded-2xl shadow-medium p-8 border border-border">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading profile...</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!isLoading && profile && (
          <div className="bg-card rounded-2xl shadow-medium p-8 border border-border">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Welcome back, {getDisplayName()}!
                </h2>
                <p className="text-muted-foreground">{getEmail()}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      isVerified()
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {isVerified()
                      ? "✓ Verified Account"
                      : "⚠ Pending Verification"}
                  </span>
                  {profile?.id && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      ID: {profile.id}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-primary-light rounded-xl p-6 border border-primary/20">
                <h3 className="font-semibold text-foreground mb-2">
                  Account Status
                </h3>
                <p className="text-sm text-muted-foreground">
                  Active & Verified
                </p>
              </div>
              <div className="bg-primary-light rounded-xl p-6 border border-primary/20">
                <h3 className="font-semibold text-foreground mb-2">
                  Member Since
                </h3>
                <p className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="bg-primary-light rounded-xl p-6 border border-primary/20">
                <h3 className="font-semibold text-foreground mb-2">
                  Access Level
                </h3>
                <p className="text-sm text-muted-foreground">Standard User</p>
              </div>
            </div>

            <div className="mt-8 p-6 bg-accent/50 rounded-xl border border-border">
              <h3 className="font-semibold text-foreground mb-2">
                Virtual peace of mind Dashboard
              </h3>
              <p className="text-sm text-muted-foreground">
                Welcome to your Virtual peace of mind management system. Here
                you can manage your health records, appointments, and medical
                information securely.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Main;
