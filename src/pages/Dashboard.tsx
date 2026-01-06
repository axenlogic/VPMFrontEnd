import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Download, RefreshCw } from "lucide-react";
import { DashboardService, DashboardSummary, TrendData } from "@/services/dashboardService";
import { toast } from "sonner";
import HighchartsWrapper from "@/components/charts/HighchartsWrapper";
import Highcharts from "highcharts";

const Dashboard = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
    district_id: "",
    school_id: "",
  });

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [summaryData, trendsData] = await Promise.all([
        DashboardService.getDashboardSummary(filters),
        DashboardService.getTrendData(filters),
      ]);
      setSummary(summaryData);
      setTrendData(trendsData);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    fetchDashboardData();
  };

  const handleExport = (format: "csv" | "pdf") => {
    toast.info(`Export to ${format.toUpperCase()} functionality will be implemented`);
  };

  // Prepare chart data
  const optInsChartOptions: Highcharts.Options = {
    chart: {
      type: "line",
      height: 300,
    },
    title: {
      text: "Opt-ins Over Time",
    },
    xAxis: {
      categories: trendData.map((d) => new Date(d.date).toLocaleDateString()),
    },
    yAxis: {
      title: {
        text: "Count",
      },
    },
    series: [
      {
        name: "Opt-ins",
        type: "line",
        data: trendData.map((d) => d.opt_ins),
        color: "#10B981",
      },
    ],
    tooltip: {
      shared: true,
    },
  };

  const referralsChartOptions: Highcharts.Options = {
    chart: {
      type: "column",
      height: 300,
    },
    title: {
      text: "Referrals Over Time",
    },
    xAxis: {
      categories: trendData.map((d) => new Date(d.date).toLocaleDateString()),
    },
    yAxis: {
      title: {
        text: "Count",
      },
    },
    series: [
      {
        name: "Referrals",
        type: "column",
        data: trendData.map((d) => d.referrals),
        color: "#2563EB",
      },
    ],
  };

  const sessionsChartOptions: Highcharts.Options = {
    chart: {
      type: "column",
      height: 300,
    },
    title: {
      text: "Sessions by Month",
    },
    xAxis: {
      categories: trendData.map((d) => new Date(d.date).toLocaleDateString()),
    },
    yAxis: {
      title: {
        text: "Sessions",
      },
    },
    series: [
      {
        name: "Sessions",
        type: "column",
        data: trendData.map((d) => d.sessions),
        color: "#F59E0B",
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">View aggregated data and trends</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport("csv")}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport("pdf")}>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={fetchDashboardData} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={filters.start_date}
                onChange={(e) => handleFilterChange("start_date", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={filters.end_date}
                onChange={(e) => handleFilterChange("end_date", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="district">District</Label>
              <Select
                value={filters.district_id}
                onValueChange={(value) => handleFilterChange("district_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Districts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Districts</SelectItem>
                  {/* Districts would be populated from API */}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="school">School</Label>
              <Select
                value={filters.school_id}
                onValueChange={(value) => handleFilterChange("school_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Schools" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Schools</SelectItem>
                  {/* Schools would be populated from API */}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleApplyFilters} className="mt-4">
            Apply Filters
          </Button>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : summary ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Opt-ins</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.total_opt_ins}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Referrals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.total_referrals}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Active Students</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.active_students}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Pending Intakes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.pending_intakes}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Completed Sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.completed_sessions}</div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Opt-ins Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <HighchartsWrapper options={optInsChartOptions} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Referrals Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <HighchartsWrapper options={referralsChartOptions} />
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Sessions by Month</CardTitle>
              </CardHeader>
              <CardContent>
                <HighchartsWrapper options={sessionsChartOptions} />
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No data available
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;

