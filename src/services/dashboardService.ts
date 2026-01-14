import api from '@/lib/api';

export interface DashboardSummary {
  total_opt_ins: number;
  total_referrals: number;
  active_students: number;
  pending_intakes: number;
  completed_sessions: number;
  // Change indicators
  opt_ins_change?: {
    value: string;
    is_positive: boolean;
  };
  referrals_change?: {
    value: string;
    is_positive: boolean;
  };
  active_students_change?: {
    value: string;
    is_positive: boolean;
  };
  sessions_change?: {
    value: string;
    is_positive: boolean;
  };
}

export interface DashboardFilters {
  district_id?: number;
  school_id?: number;
  start_date?: string;
  end_date?: string;
  service_status?: string[];
  fiscal_period?: string;
}

export interface DistrictBreakdown {
  district_id: number;
  district_name: string;
  opt_ins: number;
  referrals: number;
  active_students: number;
}

export interface SchoolBreakdown {
  school_id: number;
  school_name: string;
  district_id: number;
  opt_ins: number;
  referrals: number;
  active_students: number;
}

export interface TrendData {
  date: string;
  opt_ins: number;
  referrals: number;
  sessions: number;
}

// API Response Types (snake_case from backend)
export interface IntakeFormResponse {
  id: string;
  student_name: string | null;
  submitted_date: string;
  status: "pending" | "processed" | "active" | "submitted";
  student_uuid: string;
}

export interface SchoolResponse {
  id: string;
  name: string;
  total_students: number;
  active_students: number;
  forms: IntakeFormResponse[];
}

export interface DistrictResponse {
  id: string;
  name: string;
  total_schools: number;
  total_students: number;
  active_students: number;
  schools: SchoolResponse[];
}

// Frontend Types (camelCase for DistrictsList component)
export interface IntakeForm {
  id: string;
  studentName: string | null;
  submittedDate: string;
  status: "pending" | "processed" | "active" | "submitted";
  studentUuid: string;
}

export interface School {
  id: string;
  name: string;
  totalStudents: number;
  activeStudents: number;
  forms: IntakeForm[];
}

export interface District {
  id: string;
  name: string;
  totalSchools: number;
  totalStudents: number;
  activeStudents: number;
  schools: School[];
}

export interface DistrictsSchoolsResponse {
  districts: DistrictResponse[];
  pagination?: {
    current_page: number;
    total_pages: number;
    total_districts: number;
    per_page: number;
    has_next: boolean;
    has_previous: boolean;
  };
  summary?: {
    total_districts: number;
    total_schools: number;
    total_students: number;
    total_active_students: number;
    total_forms: number;
  };
}

/**
 * Dashboard Service
 * Handles all dashboard-related API calls
 */
export class DashboardService {
  /**
   * Get dashboard summary
   */
  static async getDashboardSummary(filters?: DashboardFilters): Promise<DashboardSummary> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach((v) => params.append(key, v));
            } else {
              params.append(key, String(value));
            }
          }
        });
      }
      const response = await api.get(`/dashboard/summary?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      // Don't throw error for 404s - let component handle with dummy data
      if (error.response?.status === 404) {
        throw new Error('NOT_FOUND');
      }
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('Failed to fetch dashboard summary.');
    }
  }

  /**
   * Get district breakdown
   */
  static async getDistrictBreakdown(filters?: DashboardFilters): Promise<DistrictBreakdown[]> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach((v) => params.append(key, v));
            } else {
              params.append(key, String(value));
            }
          }
        });
      }
      const response = await api.get(`/dashboard/district-breakdown?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      // Don't throw error for 404s - let component handle with dummy data
      if (error.response?.status === 404) {
        throw new Error('NOT_FOUND');
      }
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('Failed to fetch district breakdown.');
    }
  }

  /**
   * Get school breakdown
   */
  static async getSchoolBreakdown(filters?: DashboardFilters): Promise<SchoolBreakdown[]> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach((v) => params.append(key, v));
            } else {
              params.append(key, String(value));
            }
          }
        });
      }
      const response = await api.get(`/dashboard/school-breakdown?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      // Don't throw error for 404s - let component handle with dummy data
      if (error.response?.status === 404) {
        throw new Error('NOT_FOUND');
      }
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('Failed to fetch school breakdown.');
    }
  }

  /**
   * Get trend data
   */
  static async getTrendData(filters?: DashboardFilters): Promise<TrendData[]> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach((v) => params.append(key, v));
            } else {
              params.append(key, String(value));
            }
          }
        });
      }
      const response = await api.get(`/dashboard/trends?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      // Don't throw error for 404s - let component handle with dummy data
      if (error.response?.status === 404) {
        throw new Error('NOT_FOUND');
      }
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('Failed to fetch trend data.');
    }
  }

  /**
   * Get districts and schools overview
   * 
   * @param filters - Optional filters for districts/schools/forms
   * @returns Promise with districts, schools, and forms data (transformed to camelCase)
   */
  static async getDistrictsSchools(filters?: {
    page?: number;
    limit?: number;
    district_id?: number;
    school_id?: number;
    status?: "pending" | "processed" | "active";
    date_from?: string;
    date_to?: string;
    include_forms?: boolean;
    forms_limit?: number;
    sort_by?: string;
    sort_order?: "asc" | "desc";
  }): Promise<{ districts: District[]; pagination?: DistrictsSchoolsResponse['pagination']; summary?: DistrictsSchoolsResponse['summary'] }> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach((v) => params.append(key, v));
            } else {
              params.append(key, String(value));
            }
          }
        });
      }
      const response = await api.get(`/api/v1/dashboard/districts-schools?${params.toString()}`);

      // Get response data
      let responseData: DistrictsSchoolsResponse;
      if (response.data && response.data.data) {
        responseData = response.data.data;
      } else if (response.data && response.data.districts) {
        responseData = response.data;
      } else {
        responseData = response.data;
      }

      // Transform snake_case API response to camelCase for frontend
      const transformedDistricts: District[] = responseData.districts.map((district) => ({
        id: district.id,
        name: district.name,
        totalSchools: district.total_schools,
        totalStudents: district.total_students,
        activeStudents: district.active_students,
        schools: district.schools.map((school) => ({
          id: school.id,
          name: school.name,
          totalStudents: school.total_students,
          activeStudents: school.active_students,
          forms: school.forms.map((form) => ({
            id: form.id,
            studentName: form.student_name,
            submittedDate: form.submitted_date,
            status: form.status,
            studentUuid: form.student_uuid,
          })),
        })),
      }));

      return {
        districts: transformedDistricts,
        pagination: responseData.pagination,
        summary: responseData.summary,
      };
    } catch (error: any) {
      // Don't throw error for 404s - let component handle with dummy data
      if (error.response?.status === 404) {
        throw new Error('NOT_FOUND');
      }
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('Failed to fetch districts and schools data.');
    }
  }
}

