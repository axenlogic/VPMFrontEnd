import publicApi from '@/lib/publicApi';
import api from '@/lib/api';
import { IntakeFormData, IntakeSubmissionResponse, IntakeStatusResponse, IntakeFormDetailsResponse } from '@/types/intake';

/**
 * Intake Service
 * Handles all intake form related API calls
 * 
 * These are PUBLIC endpoints - no authentication required
 */
export class IntakeService {
  /**
   * Submit intake form
   * Public endpoint - no authentication required
   * 
   * @param formData - The intake form data
   * @param captchaToken - Optional CAPTCHA token for bot protection
   * @returns Promise with submission response including student UUID
   */
  static async submitIntakeForm(
    formData: IntakeFormData,
    captchaToken?: string
  ): Promise<IntakeSubmissionResponse> {
    try {
      const payload = new FormData();

      // Add student information
      Object.entries(formData.student_information).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          payload.append(`student_information.${key}`, String(value));
        }
      });

      // Add parent/guardian contact
      Object.entries(formData.parent_guardian_contact).forEach(([key, value]) => {
        if (value) {
          payload.append(`parent_guardian_contact.${key}`, String(value));
        }
      });

      // Add service request type
      payload.append('service_request_type', formData.service_request_type);

      // Add insurance information
      // Backend expects "yes" or "no" as string, not boolean
      payload.append('insurance_information.has_insurance', formData.insurance_information.has_insurance);

      // If has insurance, add all insurance fields
      if (formData.insurance_information.has_insurance === "yes") {
        if (formData.insurance_information.insurance_company) {
          payload.append('insurance_information.insurance_company', formData.insurance_information.insurance_company);
        }
        if (formData.insurance_information.policyholder_name) {
          payload.append('insurance_information.policyholder_name', formData.insurance_information.policyholder_name);
        }
        if (formData.insurance_information.relationship_to_student) {
          payload.append('insurance_information.relationship_to_student', formData.insurance_information.relationship_to_student);
        }
        if (formData.insurance_information.member_id) {
          payload.append('insurance_information.member_id', formData.insurance_information.member_id);
        }
        if (formData.insurance_information.group_number) {
          payload.append('insurance_information.group_number', formData.insurance_information.group_number);
        }
        // File uploads
        if (formData.insurance_information.insurance_card_front instanceof File) {
          payload.append('insurance_information.insurance_card_front', formData.insurance_information.insurance_card_front);
        }
        if (formData.insurance_information.insurance_card_back instanceof File) {
          payload.append('insurance_information.insurance_card_back', formData.insurance_information.insurance_card_back);
        }
      }

      // Add service needs (required field)
      if (formData.service_needs) {
        // Service category array
        if (formData.service_needs.service_category && formData.service_needs.service_category.length > 0) {
          formData.service_needs.service_category.forEach((item, index) => {
            payload.append(`service_needs.service_category[${index}]`, String(item));
          });
        }

        // Service category other (if "Other Service" is selected)
        if (formData.service_needs.service_category_other) {
          payload.append('service_needs.service_category_other', formData.service_needs.service_category_other);
        }

        // Severity of concern
        if (formData.service_needs.severity_of_concern) {
          payload.append('service_needs.severity_of_concern', formData.service_needs.severity_of_concern);
        }

        // Type of service needed array
        if (formData.service_needs.type_of_service_needed && formData.service_needs.type_of_service_needed.length > 0) {
          formData.service_needs.type_of_service_needed.forEach((item, index) => {
            payload.append(`service_needs.type_of_service_needed[${index}]`, String(item));
          });
        }

        // Family resources array (optional)
        if (formData.service_needs.family_resources && formData.service_needs.family_resources.length > 0) {
          formData.service_needs.family_resources.forEach((item, index) => {
            payload.append(`service_needs.family_resources[${index}]`, String(item));
          });
        }

        // Referral concern array (optional)
        if (formData.service_needs.referral_concern && formData.service_needs.referral_concern.length > 0) {
          formData.service_needs.referral_concern.forEach((item, index) => {
            payload.append(`service_needs.referral_concern[${index}]`, String(item));
          });
        }
      }

      // Add demographics if provided
      if (formData.demographics) {
        if (formData.demographics.sex_at_birth) {
          payload.append('demographics.sex_at_birth', formData.demographics.sex_at_birth);
        }
        if (formData.demographics.race && formData.demographics.race.length > 0) {
          formData.demographics.race.forEach((item, index) => {
            payload.append(`demographics.race[${index}]`, String(item));
          });
        }
        if (formData.demographics.race_other) {
          payload.append('demographics.race_other', formData.demographics.race_other);
        }
        if (formData.demographics.ethnicity && formData.demographics.ethnicity.length > 0) {
          formData.demographics.ethnicity.forEach((item, index) => {
            payload.append(`demographics.ethnicity[${index}]`, String(item));
          });
        }
      }

      // Backend expects "yes" or "no" as string for immediate_safety_concern
      payload.append('immediate_safety_concern', formData.immediate_safety_concern);
      payload.append('authorization_consent', String(formData.authorization_consent));

      // Add CAPTCHA token if provided
      if (captchaToken) {
        payload.append('captcha_token', captchaToken);
      }

      const response = await publicApi.post('/api/v1/intake/submit', payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error: any) {
      // Extract detailed error message from backend
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      // Handle network errors
      if (error.message === 'Network Error') {
        throw new Error('Network error. Please check your connection and try again.');
      }
      // Generic error
      throw new Error('Failed to submit intake form. Please try again.');
    }
  }

  /**
   * Check intake status by student UUID
   * Public endpoint - no authentication required
   * 
   * @param studentUuid - The student UUID received after form submission
   * @returns Promise with status information
   */
  static async checkIntakeStatus(studentUuid: string): Promise<IntakeStatusResponse> {
    try {
      const response = await publicApi.get(`/api/v1/intake/status/${studentUuid}`);
      return response.data;
    } catch (error: any) {
      // Extract detailed error message from backend
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      // Handle 404 - UUID not found
      if (error.response?.status === 404) {
        throw new Error('Intake form not found. Please verify the UUID and try again.');
      }
      // Handle network errors
      if (error.message === 'Network Error') {
        throw new Error('Network error. Please check your connection and try again.');
      }
      // Generic error
      throw new Error('Failed to check intake status. Please verify the UUID and try again.');
    }
  }

  /**
   * Get intake form details by student UUID or form ID
   * Authenticated endpoint - requires JWT token
   * 
   * @param identifier - Student UUID or form ID
   * @returns Promise with complete form details including PHI
   */
  static async getIntakeFormDetails(identifier: string): Promise<IntakeFormDetailsResponse> {
    try {
      const response = await api.get(`/api/v1/intake/details/${identifier}`);
      return response.data;
    } catch (error: any) {
      // Extract detailed error message from backend
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      // Handle 404 - Form not found
      if (error.response?.status === 404) {
        throw new Error('Intake form not found. Please verify the identifier and try again.');
      }
      // Handle 403 - Forbidden (no access to this form)
      if (error.response?.status === 403) {
        throw new Error('You do not have permission to access this intake form.');
      }
      // Handle network errors
      if (error.message === 'Network Error') {
        throw new Error('Network error. Please check your connection and try again.');
      }
      // Generic error
      throw new Error('Failed to fetch intake form details. Please try again.');
    }
  }

  /**
   * Update intake form status
   * Authenticated endpoint - requires JWT token
   *
   * @param identifier - Student UUID or form ID
   * @param status - New status value
   * @returns Promise with updated status payload
   */
  static async updateIntakeStatus(
    identifier: string,
    status: "pending" | "processed" | "active"
  ): Promise<{ status: "pending" | "processed" | "active" }> {
    try {
      const response = await api.put(`/api/v1/intake/status/${identifier}`, { status });
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      if (error.response?.status === 404) {
        throw new Error("Intake form not found. Please verify the identifier and try again.");
      }
      if (error.response?.status === 403) {
        throw new Error("You do not have permission to update this intake form status.");
      }
      if (error.message === "Network Error") {
        throw new Error("Network error. Please check your connection and try again.");
      }
      throw new Error("Failed to update intake form status. Please try again.");
    }
  }

  /**
   * Update intake form
   * Authenticated endpoint - requires JWT token
   * 
   * @param identifier - Student UUID or form ID
   * @param formData - The intake form data to update
   * @returns Promise with updated form details
   */
  static async updateIntakeForm(
    identifier: string,
    formData: IntakeFormData
  ): Promise<IntakeFormDetailsResponse> {
    try {
      const payload = new FormData();

      // Add student information
      Object.entries(formData.student_information).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          payload.append(`student_information.${key}`, String(value));
        }
      });

      // Add parent/guardian contact
      Object.entries(formData.parent_guardian_contact).forEach(([key, value]) => {
        if (value) {
          payload.append(`parent_guardian_contact.${key}`, String(value));
        }
      });

      // Add service request type
      payload.append('service_request_type', formData.service_request_type);

      // Add insurance information
      payload.append('insurance_information.has_insurance', formData.insurance_information.has_insurance);

      // If has insurance, add all insurance fields
      if (formData.insurance_information.has_insurance === "yes") {
        if (formData.insurance_information.insurance_company) {
          payload.append('insurance_information.insurance_company', formData.insurance_information.insurance_company);
        }
        if (formData.insurance_information.policyholder_name) {
          payload.append('insurance_information.policyholder_name', formData.insurance_information.policyholder_name);
        }
        if (formData.insurance_information.relationship_to_student) {
          payload.append('insurance_information.relationship_to_student', formData.insurance_information.relationship_to_student);
        }
        if (formData.insurance_information.member_id) {
          payload.append('insurance_information.member_id', formData.insurance_information.member_id);
        }
        if (formData.insurance_information.group_number) {
          payload.append('insurance_information.group_number', formData.insurance_information.group_number);
        }
        // File uploads (only if they are File objects, not URLs)
        if (formData.insurance_information.insurance_card_front instanceof File) {
          payload.append('insurance_information.insurance_card_front', formData.insurance_information.insurance_card_front);
        }
        if (formData.insurance_information.insurance_card_back instanceof File) {
          payload.append('insurance_information.insurance_card_back', formData.insurance_information.insurance_card_back);
        }
      }

      // Add service needs
      if (formData.service_needs) {
        // Service category array
        if (formData.service_needs.service_category && formData.service_needs.service_category.length > 0) {
          formData.service_needs.service_category.forEach((item, index) => {
            payload.append(`service_needs.service_category[${index}]`, String(item));
          });
        }

        // Service category other
        if (formData.service_needs.service_category_other) {
          payload.append('service_needs.service_category_other', formData.service_needs.service_category_other);
        }

        // Severity of concern
        if (formData.service_needs.severity_of_concern) {
          payload.append('service_needs.severity_of_concern', formData.service_needs.severity_of_concern);
        }

        // Type of service needed array
        if (formData.service_needs.type_of_service_needed && formData.service_needs.type_of_service_needed.length > 0) {
          formData.service_needs.type_of_service_needed.forEach((item, index) => {
            payload.append(`service_needs.type_of_service_needed[${index}]`, String(item));
          });
        }

        // Family resources array (optional)
        if (formData.service_needs.family_resources && formData.service_needs.family_resources.length > 0) {
          formData.service_needs.family_resources.forEach((item, index) => {
            payload.append(`service_needs.family_resources[${index}]`, String(item));
          });
        }

        // Referral concern array (optional)
        if (formData.service_needs.referral_concern && formData.service_needs.referral_concern.length > 0) {
          formData.service_needs.referral_concern.forEach((item, index) => {
            payload.append(`service_needs.referral_concern[${index}]`, String(item));
          });
        }
      }

      // Add demographics if provided
      if (formData.demographics) {
        if (formData.demographics.sex_at_birth) {
          payload.append('demographics.sex_at_birth', formData.demographics.sex_at_birth);
        }
        if (formData.demographics.race && formData.demographics.race.length > 0) {
          formData.demographics.race.forEach((item, index) => {
            payload.append(`demographics.race[${index}]`, String(item));
          });
        }
        if (formData.demographics.race_other) {
          payload.append('demographics.race_other', formData.demographics.race_other);
        }
        if (formData.demographics.ethnicity && formData.demographics.ethnicity.length > 0) {
          formData.demographics.ethnicity.forEach((item, index) => {
            payload.append(`demographics.ethnicity[${index}]`, String(item));
          });
        }
      }

      // Backend expects "yes" or "no" as string for immediate_safety_concern
      payload.append('immediate_safety_concern', formData.immediate_safety_concern);
      payload.append('authorization_consent', String(formData.authorization_consent));

      const response = await api.put(`/api/v1/intake/update/${identifier}`, payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error: any) {
      // Extract detailed error message from backend
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      // Handle 404 - Form not found
      if (error.response?.status === 404) {
        throw new Error('Intake form not found. Please verify the identifier and try again.');
      }
      // Handle 403 - Forbidden (no access to this form)
      if (error.response?.status === 403) {
        throw new Error('You do not have permission to update this intake form.');
      }
      // Handle network errors
      if (error.message === 'Network Error') {
        throw new Error('Network error. Please check your connection and try again.');
      }
      // Generic error
      throw new Error('Failed to update intake form. Please try again.');
    }
  }
}

