// Intake Form Types

export interface StudentInformation {
  full_name: string;
  student_id?: string;
  date_of_birth: string;
  grade_level: string;
}

export interface ParentGuardianContact {
  name: string;
  email: string;
  phone: string;
}

export type ServiceRequestType = "start_now" | "opt_in_future";

export interface InsuranceInformation {
  has_insurance: boolean;
  insurance_company?: string;
  policyholder_name?: string;
  relationship_to_student?: string;
  member_id?: string;
  group_number?: string;
  insurance_card_front?: File | string;
  insurance_card_back?: File | string;
}

export interface Demographics {
  sex_at_birth?: string;
  race_ethnicity?: string;
  other_race_ethnicity?: string;
}

export interface IntakeFormData {
  student_information: StudentInformation;
  parent_guardian_contact: ParentGuardianContact;
  service_request_type: ServiceRequestType;
  insurance_information: InsuranceInformation;
  demographics?: Demographics;
  immediate_safety_concern: boolean;
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

