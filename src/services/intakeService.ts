import api from '@/lib/api';
import { IntakeFormData, IntakeSubmissionResponse, IntakeStatusResponse } from '@/types/intake';

/**
 * Intake Service
 * Handles all intake form related API calls
 */
export class IntakeService {
  /**
   * Submit intake form
   * Public endpoint - no authentication required
   */
  static async submitIntakeForm(formData: IntakeFormData): Promise<IntakeSubmissionResponse> {
    try {
      // Convert FormData if files are present
      const payload = new FormData();

      // Add student information
      Object.entries(formData.student_information).forEach(([key, value]) => {
        if (value) payload.append(`student_information.${key}`, value);
      });

      // Add parent/guardian contact
      Object.entries(formData.parent_guardian_contact).forEach(([key, value]) => {
        if (value) payload.append(`parent_guardian_contact.${key}`, value);
      });

      // Add service request type
      payload.append('service_request_type', formData.service_request_type);

      // Add insurance information
      payload.append('insurance_information.has_insurance', String(formData.insurance_information.has_insurance));
      if (formData.insurance_information.has_insurance) {
        Object.entries(formData.insurance_information).forEach(([key, value]) => {
          if (key === 'has_insurance' || !value) return;
          if (key === 'insurance_card_front' || key === 'insurance_card_back') {
            if (value instanceof File) {
              payload.append(`insurance_information.${key}`, value);
            }
          } else {
            payload.append(`insurance_information.${key}`, String(value));
          }
        });
      }

      // Add service needs if provided
      if (formData.service_needs) {
        Object.entries(formData.service_needs).forEach(([key, value]) => {
          if (!value) return;
          if (Array.isArray(value)) {
            value.forEach((item, index) => {
              payload.append(`service_needs.${key}[${index}]`, String(item));
            });
          } else {
            payload.append(`service_needs.${key}`, String(value));
          }
        });
      }

      // Add demographics if provided
      if (formData.demographics) {
        Object.entries(formData.demographics).forEach(([key, value]) => {
          if (!value) return;
          if (Array.isArray(value)) {
            value.forEach((item, index) => {
              payload.append(`demographics.${key}[${index}]`, String(item));
            });
          } else {
            payload.append(`demographics.${key}`, String(value));
          }
        });
      }

      payload.append('immediate_safety_concern', String(formData.immediate_safety_concern));
      payload.append('authorization_consent', String(formData.authorization_consent));

      const response = await api.post('/intake/submit', payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error: any) {
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('Failed to submit intake form. Please try again.');
    }
  }

  /**
   * Check intake status by student UUID
   * Public endpoint - no authentication required
   */
  static async checkIntakeStatus(studentUuid: string): Promise<IntakeStatusResponse> {
    try {
      const response = await api.get(`/intake/status/${studentUuid}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('Failed to check intake status. Please verify the UUID and try again.');
    }
  }
}

