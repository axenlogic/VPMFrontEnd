import { useEffect, useState, useMemo } from "react";
import { Loader2, Users, FileText, Activity, Calendar } from "lucide-react";
import { DashboardService, DashboardSummary, TrendData, DistrictBreakdown, SchoolBreakdown, District } from "@/services/dashboardService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import SummaryCard from "@/components/dashboard/SummaryCard";
import CSVDataChart from "@/components/dashboard/CSVDataChart";
import BreakdownDonutChart from "@/components/dashboard/BreakdownDonutChart";
import DistrictsList from "@/components/dashboard/DistrictsList";

const Dashboard = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [districtBreakdown, setDistrictBreakdown] = useState<DistrictBreakdown[]>([]);
  const [schoolBreakdown, setSchoolBreakdown] = useState<SchoolBreakdown[]>([]);
  const [districts, setDistricts] = useState<District[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isSchoolUser = user?.role === "school-user";
  const [sessionPeriod, setSessionPeriod] = useState("week");
  const [breakdownPeriod, setBreakdownPeriod] = useState("week");
  const [districtFilter, setDistrictFilter] = useState<string>("all");
  const [schoolFilter, setSchoolFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const summaryData = await DashboardService.getDashboardSummary();
      setSummary(summaryData);
    } catch (error: any) {
      setSummary(null);
      toast.error(error.message || "Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDistrictsSchoolsData = async () => {
    try {
      const districtsData = await DashboardService.getDistrictsSchools({
        page: 1,
        limit: 50,
        include_forms: true,
        forms_limit: 50,
        sort_by: "name",
        sort_order: "asc",
        district_id: districtFilter !== "all" ? districtFilter : undefined,
        school_id: schoolFilter !== "all" ? schoolFilter : undefined,
        status: statusFilter !== "all" ? (statusFilter as "pending" | "processed" | "active") : undefined,
        search: searchTerm.trim() || undefined,
      });

      if (districtsData && districtsData.districts) {
        setDistricts(districtsData.districts);
      } else {
        setDistricts(null);
      }
    } catch (error: any) {
      setDistricts(null);
    }
  };

  const fetchTrendData = async () => {
    try {
      const trendsData = await DashboardService.getTrendData({ period: sessionPeriod });
      setTrendData(trendsData);
    } catch (error: any) {
      setTrendData([]);
    }
  };

  const fetchSchoolBreakdownData = async () => {
    try {
      const schoolData = await DashboardService.getSchoolBreakdown({ period: breakdownPeriod });
      setSchoolBreakdown(schoolData);
    } catch (error: any) {
      setSchoolBreakdown([]);
    }
  };

  const fetchDistrictBreakdownData = async () => {
    try {
      const districtData = await DashboardService.getDistrictBreakdown({ period: breakdownPeriod });
      setDistrictBreakdown(districtData);
    } catch (error: any) {
      setDistrictBreakdown([]);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchTrendData();
  }, [sessionPeriod]);

  useEffect(() => {
    if (!isSchoolUser) {
      fetchSchoolBreakdownData();
    } else {
      setSchoolBreakdown([]);
    }

    if (isAdmin) {
      fetchDistrictBreakdownData();
    } else {
      setDistrictBreakdown([]);
    }
  }, [breakdownPeriod, isSchoolUser, isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      fetchDistrictsSchoolsData();
    } else {
      setDistricts(null);
    }
  }, [districtFilter, schoolFilter, statusFilter, searchTerm, isAdmin]);

  const districtOptions = useMemo(() => {
    if (!districts) return [];
    return districts.map((district) => ({
      id: district.id,
      name: district.name,
    }));
  }, [districts]);

  const schoolOptions = useMemo(() => {
    if (!districts) return [];
    const filteredDistricts =
      districtFilter === "all"
        ? districts
        : districts.filter((district) => district.id === districtFilter);
    const schools = filteredDistricts.flatMap((district) => district.schools || []);
    return schools.map((school) => ({
      id: school.id,
      name: school.name,
    }));
  }, [districts, districtFilter]);

  const handleDistrictsFiltersChange = (next: {
    districtId?: string;
    schoolId?: string;
    status?: string;
    search?: string;
  }) => {
    if (next.districtId !== undefined) {
      setDistrictFilter(next.districtId);
    }
    if (next.schoolId !== undefined) {
      setSchoolFilter(next.schoolId);
    }
    if (next.status !== undefined) {
      setStatusFilter(next.status);
    }
    if (next.search !== undefined) {
      setSearchTerm(next.search);
    }
  };

  // Stable dummy data for active students (to prevent random regeneration on re-renders)
  // Prepare trend data for summary cards (last 7 days) - memoized to prevent unnecessary recalculations
  const getTrendDataForCard = (key: 'opt_ins' | 'referrals' | 'sessions' | 'active_students') => {
    if (trendData.length === 0) {
      return Array(7).fill(0);
    }
    
    const last7Days = trendData.slice(-7);
    return last7Days.map((d, index) => {
      switch (key) {
        case 'opt_ins':
          return d.opt_ins;
        case 'referrals':
          return d.referrals;
        case 'sessions':
          return d.sessions;
        case 'active_students':
          return d.active_students ?? 0;
        default:
          return 0;
      }
    });
  };
  
  // Memoize the trend data for each card to prevent unnecessary recalculations
  const optInsTrendData = useMemo(() => getTrendDataForCard('opt_ins'), [trendData]);
  const referralsTrendData = useMemo(() => getTrendDataForCard('referrals'), [trendData]);
  const activeStudentsTrendData = useMemo(() => getTrendDataForCard('active_students'), [trendData]);

  const sessionSeriesData = useMemo(() => {
    return {
      categories: trendData.map((d) => d.date),
      data: trendData.map((d) => d.sessions),
    };
  }, [trendData]);

  // Prepare school breakdown data for donut chart based on selected period - memoized to prevent unnecessary recalculations
  const schoolBreakdownData = useMemo(() => {
    if (schoolBreakdown.length === 0) return [];

    // Filter data based on period (for now, return all data - can be enhanced with actual filtering)
    // In a real implementation, you would filter based on the period
    const totalOptIns = schoolBreakdown.reduce((sum, s) => sum + s.opt_ins, 0);
    const totalReferrals = schoolBreakdown.reduce((sum, s) => sum + s.referrals, 0);
    const totalActive = schoolBreakdown.reduce((sum, s) => sum + s.active_students, 0);
    const totalValue = totalOptIns + totalReferrals + totalActive;

    return schoolBreakdown.map((school) => {
      const schoolValue = school.opt_ins + school.referrals + school.active_students;

      return {
        name: school.school_name,
        value: schoolValue,
        percentage: totalValue > 0 ? (schoolValue / totalValue) * 100 : 0,
        count: schoolValue,
        total: schoolValue,
      };
    });
  }, [schoolBreakdown, breakdownPeriod]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Always show components, even if summary is null (will use defaults)
  const displaySummary = summary || {
    total_opt_ins: 0,
    total_referrals: 0,
    active_students: 0,
    pending_intakes: 0,
    completed_sessions: 0,
  };

  return (
    <div className="space-y-6">
      {/* First Row - 3 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard
          title="Parent Opt-ins"
          value={displaySummary.total_opt_ins}
          change={displaySummary.opt_ins_change ? {
            value: displaySummary.opt_ins_change.value,
            isPositive: displaySummary.opt_ins_change.is_positive,
            label: "vs yesterday"
          } : { value: "+12", isPositive: true, label: "vs yesterday" }}
          trendData={optInsTrendData}
          icon={<FileText className="h-5 w-5" />}
          color="#294a4a"
        />
        <SummaryCard
          title="Total Referrals"
          value={displaySummary.total_referrals}
          change={displaySummary.referrals_change ? {
            value: displaySummary.referrals_change.value,
            isPositive: displaySummary.referrals_change.is_positive,
            label: "vs yesterday"
          } : { value: "+4", isPositive: true, label: "vs yesterday" }}
          trendData={referralsTrendData}
          icon={<Users className="h-5 w-5" />}
          color="#294a4a"
        />
        <SummaryCard
          title="Active Students Served"
          value={displaySummary.active_students}
          change={displaySummary.active_students_change ? {
            value: displaySummary.active_students_change.value,
            isPositive: displaySummary.active_students_change.is_positive,
            label: "vs yesterday"
          } : { value: "+8", isPositive: true, label: "vs yesterday" }}
          trendData={activeStudentsTrendData}
          icon={<Activity className="h-5 w-5" />}
          color="#294a4a"
        />
      </div>

      {/* Second Row - Charts */}
      <div className={`grid grid-cols-1 ${isSchoolUser ? "" : "lg:grid-cols-2"} gap-6`}>
        {/* Session Counts Analytics - CSV Data Chart */}
        <CSVDataChart
          title="Session Counts Analytics"
          seriesData={sessionSeriesData}
          period={sessionPeriod}
          onPeriodChange={setSessionPeriod}
        />

        {!isSchoolUser && (
          <BreakdownDonutChart
            title="School Breakdown"
            data={schoolBreakdownData.length > 0 ? schoolBreakdownData : [
              {
                name: "Sample School 1",
                value: 36.04,
                percentage: 36.04,
                count: 9874,
                total: 1897,
              },
              {
                name: "Sample School 2",
                value: 28.63,
                percentage: 28.63,
                count: 7845,
                total: 2955,
              },
              {
                name: "Sample School 3",
                value: 17.79,
                percentage: 17.79,
                count: 4874,
                total: 4854,
              },
              {
                name: "Sample School 4",
                value: 12.62,
                percentage: 12.62,
                count: 3459,
                total: 6700,
              },
              {
                name: "Sample School 5",
                value: 4.92,
                percentage: 4.92,
                count: 1348,
                total: 3020,
              },
            ]}
            period={breakdownPeriod}
            onPeriodChange={setBreakdownPeriod}
            totalLabel="Total Schools"
          />
        )}
      </div>

      {/* Third Row - Districts & Schools List */}
      {isAdmin && (
        <div className="mt-6">
          <DistrictsList
            districts={districts || undefined}
            districtOptions={districtOptions}
            schoolOptions={schoolOptions}
            filters={{
              districtId: districtFilter,
              schoolId: schoolFilter,
              status: statusFilter,
              search: searchTerm,
            }}
            onFiltersChange={handleDistrictsFiltersChange}
            onFormClick={(form) => {
              // Handle form click - can navigate to form details or open modal
              // Example: navigate(`/admin/intake/${form.id}`);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
