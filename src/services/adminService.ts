import api from '@/lib/api';

export interface IntakeQueueItem {
  id: number;
  student_uuid: string;
  district: string;
  school: string;
  submitted_date: string;
  has_insurance: boolean;
  status: 'pending' | 'processed' | 'active';
}

export interface IntakeDetails extends IntakeQueueItem {
  student_information: {
    full_name: string;
    student_id?: string;
    date_of_birth: string;
    grade_level: string;
  };
  parent_guardian_contact: {
    name: string;
    email: string;
    phone: string;
  };
  service_request_type: string;
  insurance_information: {
    has_insurance: boolean;
    insurance_company?: string;
    policyholder_name?: string;
    relationship_to_student?: string;
    member_id?: string;
    group_number?: string;
    insurance_card_front_url?: string;
    insurance_card_back_url?: string;
  };
  demographics?: any;
  immediate_safety_concern: boolean;
  authorization_consent: boolean;
}

export interface ProcessIntakeRequest {
  simplepractice_record_id?: string;
  notes?: string;
}

/**
 * Admin Service
 * Handles all admin-related API calls (requires VPM Admin role)
 */
export class AdminService {
  /**
   * Get intake queue (pending intakes)
   */
  static async getIntakeQueue(): Promise<IntakeQueueItem[]> {
    try {
      const response = await api.get('/admin/intake-queue');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      if (error.response?.status === 403) {
        throw new Error('You do not have permission to access this resource.');
      }
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('Failed to fetch intake queue.');
    }
  }

  /**
   * Get intake details by ID (includes PHI)
   */
  static async getIntakeDetails(id: number): Promise<IntakeDetails> {
    try {
      const response = await api.get(`/admin/intake-queue/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      if (error.response?.status === 403) {
        throw new Error('You do not have permission to access this resource.');
      }
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('Failed to fetch intake details.');
    }
  }

  /**
   * Process an intake (mark as processed)
   */
  static async processIntake(id: number, data: ProcessIntakeRequest): Promise<void> {
    try {
      await api.post(`/admin/intake-queue/${id}/process`, data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      if (error.response?.status === 403) {
        throw new Error('You do not have permission to access this resource.');
      }
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('Failed to process intake.');
    }
  }
}

