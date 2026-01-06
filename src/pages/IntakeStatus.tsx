import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Clock, XCircle, Search, Loader2 } from "lucide-react";
import { IntakeService } from "@/services/intakeService";
import { IntakeStatusResponse } from "@/types/intake";
import { toast } from "sonner";

const IntakeStatus = () => {
  const [studentUuid, setStudentUuid] = useState("");
  const [status, setStatus] = useState<IntakeStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckStatus = async () => {
    if (!studentUuid.trim()) {
      toast.error("Please enter a Student UUID");
      return;
    }

    setIsLoading(true);
    setError(null);
    setStatus(null);

    try {
      const result = await IntakeService.checkIntakeStatus(studentUuid.trim());
      setStatus(result);
      toast.success("Status retrieved successfully");
    } catch (err: any) {
      setError(err.message || "Failed to check status");
      toast.error(err.message || "Failed to check status");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (statusType: string) => {
    switch (statusType) {
      case "active":
        return <CheckCircle2 className="w-6 h-6 text-green-600" />;
      case "processed":
        return <CheckCircle2 className="w-6 h-6 text-blue-600" />;
      case "pending":
        return <Clock className="w-6 h-6 text-yellow-600" />;
      default:
        return <XCircle className="w-6 h-6 text-gray-600" />;
    }
  };

  const getStatusLabel = (statusType: string) => {
    switch (statusType) {
      case "active":
        return "Active";
      case "processed":
        return "Processed";
      case "pending":
        return "Pending";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="min-h-screen py-12 px-4" style={{ backgroundColor: 'var(--brand-color)' }}>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Check Intake Status</CardTitle>
            <CardDescription>
              Enter your Student UUID to check the status of your intake form submission.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="student_uuid">Student UUID</Label>
              <div className="flex gap-2">
                <Input
                  id="student_uuid"
                  value={studentUuid}
                  onChange={(e) => setStudentUuid(e.target.value)}
                  placeholder="Enter Student UUID"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleCheckStatus();
                    }
                  }}
                />
                <Button
                  onClick={handleCheckStatus}
                  disabled={isLoading || !studentUuid.trim()}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {status && (
              <div className="space-y-4">
                <Alert>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(status.status)}
                    <AlertDescription className="font-semibold">
                      Status: {getStatusLabel(status.status)}
                    </AlertDescription>
                  </div>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <Label className="text-sm text-muted-foreground">Student UUID</Label>
                    <p className="font-mono text-sm mt-1 break-all">{status.student_uuid}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <Label className="text-sm text-muted-foreground">Submitted Date</Label>
                    <p className="text-sm mt-1">
                      {new Date(status.submitted_date).toLocaleDateString()}
                    </p>
                  </div>
                  {status.processed_date && (
                    <div className="p-4 bg-muted rounded-lg md:col-span-2">
                      <Label className="text-sm text-muted-foreground">Processed Date</Label>
                      <p className="text-sm mt-1">
                        {new Date(status.processed_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IntakeStatus;

