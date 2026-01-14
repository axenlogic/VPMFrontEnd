// Intake Form Types

export interface StudentInformation {
  first_name?: string;
  last_name?: string;
  full_name: string;
  student_id?: string;
  date_of_birth: string;
  grade_level?: string;
  grade?: string;
  school?: string;
}

export interface ParentGuardianContact {
  name: string;
  email: string;
  phone: string;
}

export type ServiceRequestType = "start_now" | "opt_in_future";

export interface InsuranceInformation {
  has_insurance: "yes" | "no"; // Backend expects string enum, not boolean
  insurance_company?: string;
  policyholder_name?: string;
  relationship_to_student?: string;
  member_id?: string;
  group_number?: string;
  insurance_card_front?: File | string;
  insurance_card_back?: File | string;
}

export interface ServiceNeeds {
  service_category: string[];
  service_category_other?: string;
  severity_of_concern?: "mild" | "moderate" | "severe";
  type_of_service_needed?: string[];
  family_resources?: string[];
  referral_concern?: string[];
}

export interface Demographics {
  sex_at_birth?: "male" | "female" | "other" | "prefer_not_to_answer";
  race?: string[];
  race_other?: string;
  ethnicity?: string[];
}

export interface IntakeFormData {
  student_information: StudentInformation;
  parent_guardian_contact: ParentGuardianContact;
  service_request_type: ServiceRequestType;
  insurance_information: InsuranceInformation;
  service_needs: ServiceNeeds; // Made required to match backend
  demographics?: Demographics;
  immediate_safety_concern: "yes" | "no"; // Backend expects string enum, not boolean
  authorization_consent: boolean;
}

export interface IntakeSubmissionResponse {
  student_uuid: string;
  message: string;
  status: "pending" | "processed" | "active";
}

export interface IntakeStatusResponse {
  student_uuid: string;
  status: "pending" | "processed" | "active";
  submitted_date: string;
  processed_date?: string;
}

/**
 * Intake Form Details Response
 * Complete form data retrieved by student UUID or form ID
 * This includes all PHI (Personally Identifiable Information)
 */
export interface IntakeFormDetailsResponse {
  id: string; // Form ID
  student_uuid: string;
  status: "pending" | "processed" | "active" | "submitted";
  submitted_date: string;
  processed_date?: string;

  // Complete form data
  student_information: StudentInformation;
  parent_guardian_contact: ParentGuardianContact;
  service_request_type: ServiceRequestType;
  insurance_information: InsuranceInformation & {
    insurance_card_front_url?: string; // URL to view/download front card
    insurance_card_back_url?: string; // URL to view/download back card
  };
  service_needs: ServiceNeeds;
  demographics?: Demographics;
  immediate_safety_concern: "yes" | "no";
  authorization_consent: boolean;
}

