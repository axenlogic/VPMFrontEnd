import { useUserProfile } from "@/hooks/useUserProfile";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const Main = () => {
  const {
    profile,
    isLoading,
    error,
    refreshProfile,
  } = useUserProfile();

  return (
    <div className="space-y-6">
      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <p className="text-sm text-destructive">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshProfile}
                className="ml-auto"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && !profile && (
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading profile...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      {!isLoading && profile && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-2">
              Virtual Peace of Mind Dashboard
            </h3>
            <p className="text-sm text-muted-foreground">
              Welcome to your Virtual Peace of Mind management system. Here
              you can manage your health records, appointments, and medical
              information securely.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Main;
