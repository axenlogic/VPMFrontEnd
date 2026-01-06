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
}

