import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, User, Phone, Calendar, Shield, Heart, Users, AlertTriangle, CheckCircle2, Image as ImageIcon, Save } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getIntakeFormDetails, clearFormDetails } from "@/store/slices/intakeSlice";
import { toast } from "sonner";
import { IntakeFormDetailsResponse, IntakeFormData } from "@/types/intake";
import { cn } from "@/lib/utils";
import { IntakeService } from "@/services/intakeService";

// Dropdown options (same as IntakeForm)
const FAMILY_RESOURCE_OPTIONS = [
  "Housing Supports",
  "Food Supports",
  "Transportation",
  "Supports",
  "Medical Insurance",
  "Access",
  "Other",
];

const REFERRAL_CONCERN_OPTIONS = [
  "Anxiety, worry, or excessive stress",
  "Persistent sadness, low mood, or withdrawal",
  "Difficulty managing emotions (anger, frustration, emotional outbursts)",
  "Behavioral challenges at school or home",
  "Trouble focusing, paying attention, or staying organized",
  "Changes in sleep, appetite, or energy",
  "Peer relationship or friendship difficulties",
  "Bullying (being bullied or bullying others)",
  "Academic stress or school avoidance",
  "Family changes or conflict (divorce, separation, transitions)",
  "Grief or loss (death, relocation, separation)",
  "Trauma or exposure to stressful events",
  "Self-esteem or confidence concerns",
  "Social anxiety or difficulty with communication",
  "Substance use concerns or curiosity",
  "Adjustment to a new school or environment",
  "Other",
];

const RACE_OPTIONS = [
  "American Indian or Alaska Native",
  "Asian",
  "Black or African American",
  "White or Caucasian",
  "Multiracial / Two or More Races",
  "Other (please specify)",
  "Prefer not to answer",
];

// Form validation schema (same as IntakeForm)
const intakeFormSchema = z.object({
  student_information: z.object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    grade: z.string().min(1, "Grade is required"),
    school: z.string().min(1, "School is required"),
    date_of_birth: z.string().min(1, "Date of birth is required"),
    student_id: z.string().min(1, "Student ID is required"),
  }),
  parent_guardian_contact: z.object({
    name: z.string().min(1, "Parent/Guardian name is required"),
    email: z.string().email("Invalid email address").min(1, "Email is required"),
    phone: z.string().min(10, "Phone number is required"),
  }),
  service_request_type: z.enum(["start_now", "opt_in_future"], {
    required_error: "Service request type is required",
  }),
  insurance_information: z.object({
    has_insurance: z.enum(["yes", "no"], {
      required_error: "Insurance information is required",
    }),
    insurance_company: z.string().optional(),
    policyholder_name: z.string().optional(),
    relationship_to_student: z.string().optional(),
    member_id: z.string().optional(),
    group_number: z.string().optional(),
  }).refine((data) => {
    if (data.has_insurance === "yes") {
      return !!data.insurance_company && !!data.policyholder_name && !!data.member_id;
    }
    return true;
  }, {
    message: "Insurance company, policyholder name, and member ID are required when insurance is selected",
    path: ["insurance_company"],
  }),
  service_needs: z.object({
    service_category: z.array(z.string()).min(1, "At least one service category is required"),
    service_category_other: z.string().optional(),
    severity_of_concern: z.enum(["mild", "moderate", "severe"], {
      required_error: "Severity of concern is required",
    }),
    type_of_service_needed: z.array(z.string()).min(1, "At least one type of service is required"),
    family_resources: z.array(z.string()).optional(),
    referral_concern: z.array(z.string()).optional(),
  }),
  demographics: z.object({
    sex_at_birth: z.enum(["male", "female", "other", "prefer_not_to_answer"]).optional(),
    race: z.array(z.string()).optional(),
    race_other: z.string().optional(),
    ethnicity: z.array(z.string()).optional(),
  }).optional(),
  immediate_safety_concern: z.enum(["yes", "no"], {
    required_error: "Safety concern response is required",
  }),
  authorization_consent: z.boolean().refine((val) => val === true, {
    message: "You must authorize to proceed",
  }),
});

type IntakeFormValues = z.infer<typeof intakeFormSchema> & {
  insurance_information: {
    has_insurance: "yes" | "no";
    insurance_company?: string;
    policyholder_name?: string;
    relationship_to_student?: string;
    member_id?: string;
    group_number?: string;
  };
};

interface IntakeFormDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentUuid: string;
}

const IntakeFormDetailsModal = ({ open, onOpenChange, studentUuid }: IntakeFormDetailsModalProps) => {
  const dispatch = useAppDispatch();
  const { isFetchingDetails, detailsError, formDetails } = useAppSelector(
    (state) => state.intake
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<IntakeFormValues>({
    resolver: zodResolver(intakeFormSchema),
    mode: "onChange",
  });

  const hasInsurance = watch("insurance_information.has_insurance") === "yes";
  const serviceCategory = watch("service_needs.service_category") || [];
  const familyResources = watch("service_needs.family_resources") || [];
  const referralConcern = watch("service_needs.referral_concern") || [];
  const race = watch("demographics.race") || [];

  // Load form data when details are fetched
  useEffect(() => {
    if (formDetails) {
      reset({
        student_information: {
          first_name: formDetails.student_information.first_name || "",
          last_name: formDetails.student_information.last_name || "",
          grade: formDetails.student_information.grade || formDetails.student_information.grade_level || "",
          school: formDetails.student_information.school || "",
          date_of_birth: formDetails.student_information.date_of_birth || "",
          student_id: formDetails.student_information.student_id || "",
        },
        parent_guardian_contact: {
          name: formDetails.parent_guardian_contact.name || "",
          email: formDetails.parent_guardian_contact.email || "",
          phone: formDetails.parent_guardian_contact.phone || "",
        },
        service_request_type: formDetails.service_request_type,
        insurance_information: {
          has_insurance: formDetails.insurance_information.has_insurance,
          insurance_company: formDetails.insurance_information.insurance_company || "",
          policyholder_name: formDetails.insurance_information.policyholder_name || "",
          relationship_to_student: formDetails.insurance_information.relationship_to_student || "",
          member_id: formDetails.insurance_information.member_id || "",
          group_number: formDetails.insurance_information.group_number || "",
        },
        service_needs: {
          service_category: formDetails.service_needs.service_category || [],
          service_category_other: formDetails.service_needs.service_category_other || "",
          severity_of_concern: formDetails.service_needs.severity_of_concern || "mild",
          type_of_service_needed: formDetails.service_needs.type_of_service_needed || [],
          family_resources: formDetails.service_needs.family_resources || [],
          referral_concern: formDetails.service_needs.referral_concern || [],
        },
        demographics: formDetails.demographics ? {
          sex_at_birth: formDetails.demographics.sex_at_birth,
          race: formDetails.demographics.race || [],
          race_other: formDetails.demographics.race_other || "",
          ethnicity: formDetails.demographics.ethnicity || [],
        } : undefined,
        immediate_safety_concern: formDetails.immediate_safety_concern,
        authorization_consent: formDetails.authorization_consent,
      });
    }
  }, [formDetails, reset]);

  useEffect(() => {
    if (open && studentUuid) {
      dispatch(getIntakeFormDetails(studentUuid));
    } else if (!open) {
      dispatch(clearFormDetails());
      reset();
    }
  }, [open, studentUuid, dispatch, reset]);

  useEffect(() => {
    if (detailsError) {
      toast.error(detailsError);
    }
  }, [detailsError]);

  const handleCheckboxChange = (
    field: string,
    value: string,
    checked: boolean,
    currentValues: string[]
  ) => {
    if (checked) {
      setValue(field as any, [...currentValues, value], { shouldDirty: true });
    } else {
      setValue(field as any, currentValues.filter((v) => v !== value), { shouldDirty: true });
    }
  };

  const handleMultiSelectChange = (
    field: string,
    value: string,
    currentValues: string[]
  ) => {
    if (currentValues.includes(value)) {
      setValue(field as any, currentValues.filter((v) => v !== value), { shouldDirty: true });
    } else {
      setValue(field as any, [...currentValues, value], { shouldDirty: true });
    }
  };

  const onSubmit = async (data: IntakeFormValues) => {
    try {
      // Transform form data to match API expected format
      const formData: IntakeFormData = {
        student_information: {
          first_name: data.student_information.first_name,
          last_name: data.student_information.last_name,
          full_name: `${data.student_information.first_name} ${data.student_information.last_name}`,
          grade: data.student_information.grade,
          school: data.student_information.school,
          date_of_birth: data.student_information.date_of_birth,
          student_id: data.student_information.student_id,
        },
        parent_guardian_contact: {
          name: data.parent_guardian_contact.name,
          email: data.parent_guardian_contact.email,
          phone: data.parent_guardian_contact.phone,
        },
        service_request_type: data.service_request_type,
        insurance_information: {
          has_insurance: data.insurance_information.has_insurance,
          insurance_company: data.insurance_information.insurance_company,
          policyholder_name: data.insurance_information.policyholder_name,
          relationship_to_student: data.insurance_information.relationship_to_student,
          member_id: data.insurance_information.member_id,
          group_number: data.insurance_information.group_number,
        },
        service_needs: {
          service_category: data.service_needs.service_category,
          service_category_other: data.service_needs.service_category_other,
          severity_of_concern: data.service_needs.severity_of_concern,
          type_of_service_needed: data.service_needs.type_of_service_needed,
          family_resources: data.service_needs.family_resources,
          referral_concern: data.service_needs.referral_concern,
        },
        demographics: data.demographics,
        immediate_safety_concern: data.immediate_safety_concern,
        authorization_consent: data.authorization_consent,
      };

      // Call update API
      await IntakeService.updateIntakeForm(studentUuid, formData);
      
      toast.success("Form updated successfully!");
      
      // Refresh form details to show updated data
      dispatch(getIntakeFormDetails(studentUuid));
    } catch (error: any) {
      toast.error(error.message || "Failed to update form");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-50 text-green-700 border-green-200">Active</Badge>;
      case "processed":
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200">Completed</Badge>;
      case "pending":
        return <Badge className="bg-orange-50 text-orange-700 border-orange-200">Opt-ins</Badge>;
      case "submitted":
        return <Badge className="bg-purple-50 text-purple-700 border-purple-200">Submitted</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto p-0" style={{ backgroundColor: 'var(--brand-color)' }}>
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#294a4a] rounded-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  Intake Form Details
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  View and edit complete form information
                </DialogDescription>
              </div>
            </div>
            {formDetails && getStatusBadge(formDetails.status)}
          </div>
        </DialogHeader>

        {isFetchingDetails ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#294a4a] mx-auto mb-4" />
              <p className="text-gray-600">Loading form details...</p>
            </div>
          </div>
        ) : detailsError ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 font-medium">{detailsError}</p>
              <Button
                onClick={() => dispatch(getIntakeFormDetails(studentUuid))}
                className="mt-4 bg-[#294a4a] hover:bg-[#375b59]"
              >
                Retry
              </Button>
            </div>
          </div>
        ) : formDetails ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 px-6 py-4">
            {/* Form Metadata */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-white rounded-lg border border-gray-200">
              <div>
                <Label className="text-xs text-gray-500">Student UUID</Label>
                <p className="text-sm font-mono text-gray-900 mt-1 break-all">{formDetails.student_uuid}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Submitted Date</Label>
                <p className="text-sm text-gray-900 mt-1">{formatDate(formDetails.submitted_date)}</p>
              </div>
              {formDetails.processed_date && (
                <div>
                  <Label className="text-xs text-gray-500">Processed Date</Label>
                  <p className="text-sm text-gray-900 mt-1">{formatDate(formDetails.processed_date)}</p>
                </div>
              )}
            </div>

            {/* SECTION 1: STUDENT INFORMATION */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b-2 border-[#294a4a]/20">
                <div className="p-2 bg-[#294a4a]/10 rounded-lg">
                  <User className="w-5 h-5 text-[#294a4a]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">SECTION 1: STUDENT INFORMATION</h3>
              </div>
              <p className="text-sm text-gray-600 italic">
                {"All fields are editable"}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    {...register("student_information.first_name")}
                    placeholder="Enter first name"
                     
                     
                  />
                  {errors.student_information?.first_name && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.student_information.first_name.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    {...register("student_information.last_name")}
                    placeholder="Enter last name"
                     
                     
                  />
                  {errors.student_information?.last_name && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.student_information.last_name.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="grade">Grade *</Label>
                  <Input
                    id="grade"
                    {...register("student_information.grade")}
                    placeholder="e.g., 9th, 10th, 11th, 12th"
                     
                     
                  />
                  {errors.student_information?.grade && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.student_information.grade.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="school">School *</Label>
                  <Input
                    id="school"
                    {...register("student_information.school")}
                    placeholder="Enter school name"
                     
                     
                  />
                  {errors.student_information?.school && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.student_information.school.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="date_of_birth">Date of Birth *</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    {...register("student_information.date_of_birth")}
                     
                     
                  />
                  {errors.student_information?.date_of_birth && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.student_information.date_of_birth.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="student_id">Student ID *</Label>
                  <Input
                    id="student_id"
                    {...register("student_information.student_id")}
                    placeholder="Enter student ID"
                     
                     
                  />
                  {errors.student_information?.student_id && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.student_information.student_id.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 2: PARENT/GUARDIAN CONTACT */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b-2 border-[#294a4a]/20">
                <div className="p-2 bg-[#294a4a]/10 rounded-lg">
                  <Phone className="w-5 h-5 text-[#294a4a]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">SECTION 2: PARENT/GUARDIAN CONTACT INFORMATION</h3>
              </div>
              <p className="text-sm text-gray-600 italic">
                {"All fields are editable"}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="parent_name">Name *</Label>
                  <Input
                    id="parent_name"
                    {...register("parent_guardian_contact.name")}
                    placeholder="Enter parent/guardian name"
                     
                     
                  />
                  {errors.parent_guardian_contact?.name && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.parent_guardian_contact.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="parent_email">Email address *</Label>
                  <Input
                    id="parent_email"
                    type="email"
                    {...register("parent_guardian_contact.email")}
                    placeholder="Enter email address"
                     
                     
                  />
                  {errors.parent_guardian_contact?.email && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.parent_guardian_contact.email.message}
                    </p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="parent_phone">Phone *</Label>
                  <Input
                    id="parent_phone"
                    type="tel"
                    {...register("parent_guardian_contact.phone")}
                    placeholder="(555) 123-4567"
                     
                     
                  />
                  {errors.parent_guardian_contact?.phone && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.parent_guardian_contact.phone.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 3: SERVICE REQUEST TYPE */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b-2 border-[#294a4a]/20">
                <div className="p-2 bg-[#294a4a]/10 rounded-lg">
                  <Calendar className="w-5 h-5 text-[#294a4a]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">SECTION 3: SERVICE REQUEST TYPE</h3>
              </div>
              <RadioGroup
                value={watch("service_request_type")}
                onValueChange={(value) => setValue("service_request_type", value as "start_now" | "opt_in_future", { shouldDirty: true })}
                 
                 
              >
                <div className="flex items-start space-x-3 space-y-0 py-2">
                  <RadioGroupItem value="start_now" id="start_now" className="mt-1"   />
                  <div className="flex-1">
                    <Label htmlFor="start_now" className={cn("font-normal", "cursor-pointer")}>
                      My child needs to start services now (new opt-in)
                    </Label>
                  </div>
                </div>
                <div className="flex items-start space-x-3 space-y-0 py-2">
                  <RadioGroupItem value="opt_in_future" id="opt_in_future" className="mt-1"   />
                  <div className="flex-1">
                    <Label htmlFor="opt_in_future" className={cn("font-normal", "cursor-pointer")}>
                      I am opting in now, so services are available if needed later
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* SECTION 4: INSURANCE INFORMATION */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b-2 border-[#294a4a]/20">
                <div className="p-2 bg-[#294a4a]/10 rounded-lg">
                  <Shield className="w-5 h-5 text-[#294a4a]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">SECTION 4: INSURANCE INFORMATION</h3>
              </div>
              <p className="text-sm text-gray-600 mb-2">Does your child currently have health insurance?</p>
              <RadioGroup
                value={watch("insurance_information.has_insurance")}
                onValueChange={(value) => setValue("insurance_information.has_insurance", value as "yes" | "no", { shouldDirty: true })}
                 
                 
              >
                <div className="flex items-center space-x-3 space-y-0 py-2">
                  <RadioGroupItem value="yes" id="has_insurance_yes"   />
                  <Label htmlFor="has_insurance_yes" className="cursor-pointer font-normal">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center space-x-3 space-y-0 py-2">
                  <RadioGroupItem value="no" id="has_insurance_no"   />
                  <Label htmlFor="has_insurance_no" className="cursor-pointer font-normal">
                    No
                  </Label>
                </div>
              </RadioGroup>

              {hasInsurance && (
                <div className="ml-6 space-y-4 border-l-2 border-[#294a4a] pl-6 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="insurance_company">Insurance Company Name *</Label>
                      <Input
                        id="insurance_company"
                        {...register("insurance_information.insurance_company")}
                        placeholder="Enter insurance company name"
                         
                         
                      />
                      {errors.insurance_information?.insurance_company && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.insurance_information.insurance_company.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="policyholder_name">Policyholder Name *</Label>
                      <Input
                        id="policyholder_name"
                        {...register("insurance_information.policyholder_name")}
                        placeholder="Enter policyholder name"
                         
                         
                      />
                      {errors.insurance_information?.policyholder_name && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.insurance_information.policyholder_name.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="relationship_to_student">Relationship to Student *</Label>
                      <Input
                        id="relationship_to_student"
                        {...register("insurance_information.relationship_to_student")}
                        placeholder="e.g., Parent, Guardian"
                         
                         
                      />
                      {errors.insurance_information?.relationship_to_student && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.insurance_information.relationship_to_student.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="member_id">Member ID Number *</Label>
                      <Input
                        id="member_id"
                        {...register("insurance_information.member_id")}
                        placeholder="Enter member ID"
                         
                         
                      />
                      {errors.insurance_information?.member_id && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.insurance_information.member_id.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="group_number">Group Number (if available)</Label>
                      <Input
                        id="group_number"
                        {...register("insurance_information.group_number")}
                        placeholder="Enter group number"
                         
                         
                      />
                    </div>
                  </div>

                  {/* Insurance Card Images */}
                  {(formDetails.insurance_information.insurance_card_front_url || formDetails.insurance_information.insurance_card_back_url) && (
                    <div className="space-y-2">
                      <Label>Insurance Cards</Label>
                      <div className="flex gap-4">
                        {formDetails.insurance_information.insurance_card_front_url && (
                          <a
                            href={formDetails.insurance_information.insurance_card_front_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            <ImageIcon className="h-4 w-4 text-gray-600" />
                            <span className="text-sm text-gray-700">View Front Card</span>
                          </a>
                        )}
                        {formDetails.insurance_information.insurance_card_back_url && (
                          <a
                            href={formDetails.insurance_information.insurance_card_back_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            <ImageIcon className="h-4 w-4 text-gray-600" />
                            <span className="text-sm text-gray-700">View Back Card</span>
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SECTION 5: SERVICE NEEDS */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b-2 border-[#294a4a]/20">
                <div className="p-2 bg-[#294a4a]/10 rounded-lg">
                  <Heart className="w-5 h-5 text-[#294a4a]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">SECTION 5: SERVICE NEEDS</h3>
              </div>

              {/* Service Category */}
              <div className="space-y-2">
                <Label>Service Category *</Label>
                <div className="space-y-2">
                  {["mental health", "Substance Use", "Other Service"].map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`service_category_${category.toLowerCase().replace(/\s+/g, "_")}`}
                        checked={serviceCategory.includes(category)}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(
                            "service_needs.service_category",
                            category,
                            checked as boolean,
                            serviceCategory
                          )
                        }
                         
                      />
                      <Label 
                        htmlFor={`service_category_${category.toLowerCase().replace(/\s+/g, "_")}`}
                        className={cn("font-normal", "cursor-pointer")}
                      >
                        {category === "Other Service" ? "Other Service :" : category}
                      </Label>
                      {category === "Other Service" && serviceCategory.includes("Other Service") && (
                        <Input
                          {...register("service_needs.service_category_other")}
                          placeholder="Enter other service"
                          className="max-w-xs"
                           
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Severity of Concern */}
              <div className="space-y-2">
                <Label>Severity of Concern *</Label>
                <RadioGroup
                  value={watch("service_needs.severity_of_concern")}
                  onValueChange={(value) => setValue("service_needs.severity_of_concern", value as "mild" | "moderate" | "severe", { shouldDirty: true })}
                   
                   
                >
                  {["mild", "moderate", "severe"].map((severity) => (
                    <div key={severity} className="flex items-center space-x-3 space-y-0 py-2">
                      <RadioGroupItem value={severity} id={`severity_${severity}`}   />
                      <Label htmlFor={`severity_${severity}`} className={cn("capitalize font-normal", "cursor-pointer")}>
                        {severity}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Type of Service Needed */}
              <div className="space-y-2">
                <Label>Type of Service Needed *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    "Individual Therapy",
                    "Group Therapy",
                    "Family Therapy",
                    "Caregiver Support",
                    "Psychiatry",
                    "Psychological Testing",
                    "Crisis Support",
                    "Family Resources",
                  ].map((service) => (
                    <div key={service} className="flex items-center space-x-2">
                      <Checkbox
                        id={`service_type_${service.toLowerCase().replace(/\s+/g, "_")}`}
                        checked={(watch("service_needs.type_of_service_needed") || []).includes(service)}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(
                            "service_needs.type_of_service_needed",
                            service,
                            checked as boolean,
                            watch("service_needs.type_of_service_needed") || []
                          )
                        }
                         
                      />
                      <Label
                        htmlFor={`service_type_${service.toLowerCase().replace(/\s+/g, "_")}`}
                        className={cn("text-sm font-normal", "cursor-pointer")}
                      >
                        {service}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Family Resources */}
              <div className="space-y-2">
                <Label>Family Resources</Label>
                <div className="border-2 border-gray-200 rounded-lg p-3 min-h-[60px] bg-gradient-to-br from-gray-50 to-white">
                  {familyResources.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No resources selected</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {familyResources.map((resource) => (
                        <Badge key={resource} variant="outline" className="bg-gray-50">
                          {resource}
                          <button
                            type="button"
                            onClick={() => handleMultiSelectChange("service_needs.family_resources", resource, familyResources)}
                            className="ml-1 hover:text-red-500"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Select
                  onValueChange={(value) => handleMultiSelectChange("service_needs.family_resources", value, familyResources)}
                  value=""
                >
                  <SelectTrigger className="w-full h-12">
                    <SelectValue placeholder={familyResources.length > 0 ? `Add another resource (${FAMILY_RESOURCE_OPTIONS.filter((opt) => !familyResources.includes(opt)).length} remaining)` : "Select family resource needs"} />
                  </SelectTrigger>
                  <SelectContent>
                    {FAMILY_RESOURCE_OPTIONS.filter((opt) => !familyResources.includes(opt)).length > 0 ? (
                      FAMILY_RESOURCE_OPTIONS.filter((opt) => !familyResources.includes(opt)).map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>All resources selected</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Referral Concern */}
              <div className="space-y-2">
                <Label>Referral Concern</Label>
                <div className="border-2 border-gray-200 rounded-lg p-3 min-h-[60px] bg-gradient-to-br from-gray-50 to-white">
                  {referralConcern.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No concerns selected</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {referralConcern.map((concern) => (
                        <Badge key={concern} variant="outline" className="bg-gray-50">
                          {concern}
                          <button
                            type="button"
                            onClick={() => handleMultiSelectChange("service_needs.referral_concern", concern, referralConcern)}
                            className="ml-1 hover:text-red-500"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Select
                  onValueChange={(value) => handleMultiSelectChange("service_needs.referral_concern", value, referralConcern)}
                  value=""
                >
                  <SelectTrigger className="w-full h-12">
                    <SelectValue placeholder={referralConcern.length > 0 ? `Add another concern (${REFERRAL_CONCERN_OPTIONS.filter((opt) => !referralConcern.includes(opt)).length} remaining)` : "Select primary concern"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {REFERRAL_CONCERN_OPTIONS.filter((opt) => !referralConcern.includes(opt)).length > 0 ? (
                      REFERRAL_CONCERN_OPTIONS.filter((opt) => !referralConcern.includes(opt)).map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>All concerns selected</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* SECTION 6: DEMOGRAPHICS */}
            {watch("demographics") && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b-2 border-[#294a4a]/20">
                  <div className="p-2 bg-[#294a4a]/10 rounded-lg">
                    <Users className="w-5 h-5 text-[#294a4a]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">SECTION 6: DEMOGRAPHICS (Optional)</h3>
                </div>

                {/* Sex at Birth */}
                {watch("demographics.sex_at_birth") && (
                  <div className="space-y-2">
                    <Label>Sex at Birth</Label>
                    <RadioGroup
                      value={watch("demographics.sex_at_birth") || ""}
                      onValueChange={(value) => setValue("demographics.sex_at_birth", value as any, { shouldDirty: true })}
                       
                       
                    >
                      {["male", "female", "other", "prefer_not_to_answer"].map((option) => (
                        <div key={option} className="flex items-center space-x-3 space-y-0 py-2">
                          <RadioGroupItem value={option} id={`sex_${option}`}   />
                          <Label htmlFor={`sex_${option}`} className={cn("capitalize font-normal", "cursor-pointer")}>
                            {option.replace(/_/g, " ")}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                {/* Race */}
                {race.length > 0 && (
                  <div className="space-y-2">
                    <Label>Race</Label>
                    <div className="flex flex-wrap gap-2">
                      {race.map((r) => (
                        <Badge key={r} variant="outline" className="bg-gray-50">
                          {r}
                        </Badge>
                      ))}
                    </div>
                    {watch("demographics.race_other") && (
                      <p className="text-sm text-gray-700 mt-2">
                        <span className="font-medium">Other:</span> {watch("demographics.race_other")}
                      </p>
                    )}
                  </div>
                )}

                {/* Ethnicity */}
                {watch("demographics.ethnicity") && watch("demographics.ethnicity").length > 0 && (
                  <div className="space-y-2">
                    <Label>Ethnicity</Label>
                    <div className="flex flex-wrap gap-2">
                      {watch("demographics.ethnicity").map((ethnicity) => (
                        <Badge key={ethnicity} variant="outline" className="bg-gray-50">
                          {ethnicity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SECTION 7: IMMEDIATE SAFETY CONCERN */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b-2 border-[#294a4a]/20">
                <div className="p-2 bg-[#294a4a]/10 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-[#294a4a]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">SECTION 7: IMMEDIATE SAFETY CONCERN</h3>
              </div>
              <RadioGroup
                value={watch("immediate_safety_concern")}
                onValueChange={(value) => setValue("immediate_safety_concern", value as "yes" | "no", { shouldDirty: true })}
                 
                 
              >
                <div className="flex items-center space-x-3 space-y-0 py-2">
                  <RadioGroupItem value="yes" id="safety_yes"   />
                  <Label htmlFor="safety_yes" className="cursor-pointer font-normal">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center space-x-3 space-y-0 py-2">
                  <RadioGroupItem value="no" id="safety_no"   />
                  <Label htmlFor="safety_no" className="cursor-pointer font-normal">
                    No
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* SECTION 8: AUTHORIZATION */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b-2 border-[#294a4a]/20">
                <div className="p-2 bg-[#294a4a]/10 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-[#294a4a]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">SECTION 8: AUTHORIZATION & CONSENT</h3>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="authorization_consent"
                  checked={watch("authorization_consent")}
                  onCheckedChange={(checked) => setValue("authorization_consent", checked as boolean, { shouldDirty: true })}
                   
                />
                <Label htmlFor="authorization_consent" className={cn("font-normal", "cursor-pointer")}>
                  I authorize the use of this information for service coordination
                </Label>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200 bg-white sticky bottom-0 pb-4 -mx-6 px-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-[#294a4a] text-[#294a4a] hover:bg-[#294a4a] hover:text-white"
              >
                Close
              </Button>
              <Button
                type="submit"
                disabled={!isDirty}
                className="bg-[#294a4a] hover:bg-[#375b59] text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default IntakeFormDetailsModal;

