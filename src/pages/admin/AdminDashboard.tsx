import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Eye, RefreshCw } from "lucide-react";
import { AdminService, IntakeQueueItem } from "@/services/adminService";
import { toast } from "sonner";
import { format } from "date-fns";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [intakes, setIntakes] = useState<IntakeQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalPending: 0,
    processedToday: 0,
    activeStudents: 0,
    totalSessions: 0,
  });

  const fetchIntakeQueue = async () => {
    setIsLoading(true);
    try {
      const data = await AdminService.getIntakeQueue();
      setIntakes(data);
      
      // Calculate summary
      const pending = data.filter((i) => i.status === "pending").length;
      const today = new Date().toISOString().split("T")[0];
      const processedToday = data.filter(
        (i) => i.status === "processed" && i.submitted_date.startsWith(today)
      ).length;
      
      setSummary({
        totalPending: pending,
        processedToday,
        activeStudents: data.filter((i) => i.status === "active").length,
        totalSessions: 0, // This would come from a separate API call
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch intake queue");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIntakeQueue();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Pending</Badge>;
      case "processed":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Processed</Badge>;
      case "active":
        return <Badge variant="outline" className="bg-green-50 text-green-700">Active</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage intake queue and process student applications</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Pending</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalPending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Processed Today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.processedToday}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.activeStudents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Sessions (Month)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalSessions}</div>
          </CardContent>
        </Card>
      </div>

      {/* Intake Queue */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Pending Intakes</CardTitle>
              <CardDescription>List of intake forms awaiting processing</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchIntakeQueue}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : intakes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No pending intakes found
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student UUID</TableHead>
                    <TableHead>District</TableHead>
                    <TableHead>School</TableHead>
                    <TableHead>Submitted Date</TableHead>
                    <TableHead>Has Insurance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {intakes.map((intake) => (
                    <TableRow key={intake.id}>
                      <TableCell className="font-mono text-sm">
                        {intake.student_uuid.substring(0, 8)}...
                      </TableCell>
                      <TableCell>{intake.district}</TableCell>
                      <TableCell>{intake.school}</TableCell>
                      <TableCell>
                        {format(new Date(intake.submitted_date), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        {intake.has_insurance ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            Yes
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-700">
                            No
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(intake.status)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/admin/intake/${intake.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;

