import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Upload, Camera, Loader2, Copy, Check, Sparkles, FileText } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { submitIntakeForm, clearSubmissionState } from "@/store/slices/intakeSlice";
import { IntakeFormData } from "@/types/intake";
import { toast } from "sonner";

// Dropdown options data
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

// Form validation schema
const intakeFormSchema = z.object({
  // Section 1: Student Information
  student_information: z.object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    grade: z.string().min(1, "Grade is required"),
    school: z.string().min(1, "School is required"),
    date_of_birth: z.string().min(1, "Date of birth is required"),
    student_id: z.string().min(1, "Student ID is required"),
  }),
  // Section 2: Parent/Guardian Contact
  parent_guardian_contact: z.object({
    name: z.string().min(1, "Parent/Guardian name is required"),
    email: z.string().email("Invalid email address").min(1, "Email is required"),
    phone: z.string().min(10, "Phone number is required"),
  }),
  // Section 3: Service Request Type
  service_request_type: z.enum(["start_now", "opt_in_future"], {
    required_error: "Service request type is required",
  }),
  // Section 4: Insurance Information
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
  // Section 5: Service Needs
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
  // Section 6: Demographics (optional)
  demographics: z.object({
    sex_at_birth: z.enum(["male", "female", "other", "prefer_not_to_answer"]).optional(),
    race: z.array(z.string()).optional(),
    race_other: z.string().optional(),
    ethnicity: z.array(z.string()).optional(),
  }).optional(),
  // Section 7: Safety Check
  immediate_safety_concern: z.enum(["yes", "no"], {
    required_error: "Safety concern response is required",
  }),
  // Section 8: Authorization
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
    insurance_card_front?: File;
    insurance_card_back?: File;
  };
};

const IntakeForm = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  // Redux state
  const { isSubmitting, submitError, submissionSuccess, submittedUuid } = useAppSelector(
    (state) => state.intake
  );
  
  // Local state for file uploads
  const [insuranceCardFront, setInsuranceCardFront] = useState<File | null>(null);
  const [insuranceCardBack, setInsuranceCardBack] = useState<File | null>(null);
  
  // Copy to clipboard state
  const [copied, setCopied] = useState(false);
  
  // Clear submission state when component unmounts or on navigation
  useEffect(() => {
    return () => {
      dispatch(clearSubmissionState());
    };
  }, [dispatch]);
  
  // Handle successful submission
  useEffect(() => {
    if (submissionSuccess && submittedUuid) {
      toast.success("Intake form submitted successfully!");
      // Optionally navigate to status page or show success message
      // navigate(`/intake/status?uuid=${submittedUuid}`);
    }
  }, [submissionSuccess, submittedUuid, navigate]);
  
  // Handle submission errors
  useEffect(() => {
    if (submitError) {
      toast.error(submitError);
    }
  }, [submitError]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<IntakeFormValues>({
    resolver: zodResolver(intakeFormSchema),
    defaultValues: {
      student_information: {
        first_name: "",
        last_name: "",
        grade: "",
        school: "",
        date_of_birth: "",
        student_id: "",
      },
      parent_guardian_contact: {
        name: "",
        email: "",
        phone: "",
      },
      service_request_type: "start_now",
      insurance_information: {
        has_insurance: "no",
      },
      service_needs: {
        service_category: [],
        service_category_other: "",
        severity_of_concern: "mild",
        type_of_service_needed: [],
        family_resources: [],
        referral_concern: [],
      },
      demographics: {
        sex_at_birth: undefined,
        race: [],
        race_other: "",
        ethnicity: [],
      },
      immediate_safety_concern: "no",
      authorization_consent: false,
    },
  });

  const hasInsurance = watch("insurance_information.has_insurance") === "yes";
  const immediateSafetyConcern = watch("immediate_safety_concern") === "yes";
  const serviceCategory = watch("service_needs.service_category") || [];
  const race = watch("demographics.race") || [];
  const familyResources = watch("service_needs.family_resources") || [];
  const referralConcern = watch("service_needs.referral_concern") || [];

  const handleCheckboxChange = (
    field: string,
    value: string,
    checked: boolean,
    currentValues: string[]
  ) => {
    if (checked) {
      setValue(field as any, [...currentValues, value]);
    } else {
      setValue(field as any, currentValues.filter((v) => v !== value));
    }
  };

  const handleMultiSelectChange = (
    field: string,
    value: string,
    currentValues: string[]
  ) => {
    if (currentValues.includes(value)) {
      setValue(field as any, currentValues.filter((v) => v !== value));
    } else {
      setValue(field as any, [...currentValues, value]);
    }
  };

  const onSubmit = async (data: IntakeFormValues) => {
    // Clear any previous submission state
    dispatch(clearSubmissionState());
    
    // Transform form data to match API expected format
    // Backend expects "yes"/"no" strings for has_insurance and immediate_safety_concern
    // Form validation ensures required fields are present
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
        has_insurance: data.insurance_information.has_insurance, // Keep as "yes"/"no" string
        insurance_company: data.insurance_information.insurance_company,
        policyholder_name: data.insurance_information.policyholder_name,
        relationship_to_student: data.insurance_information.relationship_to_student,
        member_id: data.insurance_information.member_id,
        group_number: data.insurance_information.group_number,
        insurance_card_front: insuranceCardFront || undefined,
        insurance_card_back: insuranceCardBack || undefined,
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
      immediate_safety_concern: data.immediate_safety_concern, // Keep as "yes"/"no" string
      authorization_consent: data.authorization_consent,
    };

    // Submit using Redux thunk
    // CAPTCHA token can be added here when CAPTCHA is implemented
    const result = await dispatch(submitIntakeForm({ 
      formData,
      captchaToken: undefined // TODO: Add CAPTCHA token when implemented
    }));
    
    // If submission was successful, the useEffect will handle the success message
    if (submitIntakeForm.fulfilled.match(result)) {
      // Success is handled by useEffect watching submissionSuccess
    }
  };

  const handleFileUpload = (field: "front" | "back", file: File | null) => {
    if (field === "front") {
      setInsuranceCardFront(file);
      if (file) {
        setValue("insurance_information.insurance_card_front", file);
      }
    } else {
      setInsuranceCardBack(file);
      if (file) {
        setValue("insurance_information.insurance_card_back", file);
      }
    }
  };

  const handleCameraCapture = async (field: "front" | "back") => {
    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      
      // Create video element to show camera preview
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      video.playsInline = true;
      video.style.width = '100%';
      video.style.maxWidth = '500px';
      video.style.borderRadius = '8px';
      
      // Create container for camera preview
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '0';
      container.style.right = '0';
      container.style.bottom = '0';
      container.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.alignItems = 'center';
      container.style.justifyContent = 'center';
      container.style.zIndex = '9999';
      container.style.padding = '20px';
      
      // Create canvas for capturing image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Create capture button
      const captureBtn = document.createElement('button');
      captureBtn.textContent = 'Capture Photo';
      captureBtn.style.padding = '12px 24px';
      captureBtn.style.backgroundColor = '#294a4a';
      captureBtn.style.color = 'white';
      captureBtn.style.border = 'none';
      captureBtn.style.borderRadius = '8px';
      captureBtn.style.cursor = 'pointer';
      captureBtn.style.marginTop = '20px';
      captureBtn.style.fontSize = '16px';
      captureBtn.style.fontWeight = '600';
      
      // Create cancel button
      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = 'Cancel';
      cancelBtn.style.padding = '12px 24px';
      cancelBtn.style.backgroundColor = 'gray';
      cancelBtn.style.color = 'white';
      cancelBtn.style.border = 'none';
      cancelBtn.style.borderRadius = '8px';
      cancelBtn.style.cursor = 'pointer';
      cancelBtn.style.marginTop = '10px';
      cancelBtn.style.fontSize = '16px';
      
      // Create button container
      const buttonContainer = document.createElement('div');
      buttonContainer.style.display = 'flex';
      buttonContainer.style.gap = '10px';
      buttonContainer.style.marginTop = '20px';
      
      // Label for which side
      const label = document.createElement('p');
      label.textContent = `Capture ${field === 'front' ? 'FRONT' : 'BACK'} of insurance card`;
      label.style.color = 'white';
      label.style.fontSize = '18px';
      label.style.fontWeight = '600';
      label.style.marginBottom = '20px';
      
      container.appendChild(label);
      container.appendChild(video);
      buttonContainer.appendChild(captureBtn);
      buttonContainer.appendChild(cancelBtn);
      container.appendChild(buttonContainer);
      document.body.appendChild(container);
      
      // Wait for video to be ready
      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      };
      
      // Capture photo
      captureBtn.onclick = () => {
        if (ctx && video.videoWidth > 0) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], `insurance_card_${field}_${Date.now()}.jpg`, {
                type: 'image/jpeg'
              });
              handleFileUpload(field, file);
            }
            
            // Clean up
            stream.getTracks().forEach(track => track.stop());
            document.body.removeChild(container);
          }, 'image/jpeg', 0.9);
        }
      };
      
      // Cancel
      cancelBtn.onclick = () => {
        stream.getTracks().forEach(track => track.stop());
        document.body.removeChild(container);
      };
      
    } catch (error) {
      // Fallback to file input if camera access is denied or not available
      console.warn('Camera access denied or not available, falling back to file input', error);
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.capture = "environment";
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          handleFileUpload(field, file);
        }
      };
      input.click();
    }
  };

  // Copy UUID to clipboard
  const handleCopyUuid = async () => {
    if (submittedUuid) {
      try {
        await navigator.clipboard.writeText(submittedUuid);
        setCopied(true);
        toast.success("UUID copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        toast.error("Failed to copy UUID");
      }
    }
  };

  if (submittedUuid) {
    return (
      <div className="min-h-screen py-12 px-4 flex items-center justify-center" style={{ backgroundColor: 'var(--brand-color)' }}>
        <div className="max-w-2xl w-full mx-auto">
          <Card className="shadow-2xl border-0 overflow-hidden">
            <CardContent className="p-8 md:p-12">
              {/* Animated Success Icon */}
              <div className="flex flex-col items-center text-center space-y-6">
                {/* Success Animation Container */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 bg-green-100 rounded-full animate-ping opacity-20"></div>
                  </div>
                  <div className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg transform transition-all duration-500 animate-scale-in">
                    <CheckCircle2 className="w-14 h-14 text-white animate-checkmark" />
                  </div>
                </div>

                {/* Thank You Message */}
                <div className="space-y-3 animate-fade-in-up">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                    Thank You!
                  </h1>
                  <p className="text-lg text-gray-600 max-w-md">
                    Your intake form has been successfully submitted. We'll review your submission and get back to you soon.
                  </p>
                </div>

                {/* UUID Section */}
                <div className="w-full space-y-3 animate-fade-in-up animation-delay-200">
                  <Label className="text-sm font-semibold text-gray-700 block text-left">
                    Your Student UUID:
                  </Label>
                  <div className="relative group">
                    <div className="flex items-center gap-2 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 hover:border-[#294a4a] transition-all duration-300">
                      <p className="font-mono text-sm md:text-base text-gray-800 flex-1 break-all pr-2">
                        {submittedUuid}
                      </p>
                      <Button
                        onClick={handleCopyUuid}
                        variant="ghost"
                        size="sm"
                        className="flex-shrink-0 h-9 w-9 p-0 hover:bg-[#294a4a] hover:text-white transition-all duration-200 group/copy"
                        title={copied ? "Copied!" : "Copy to clipboard"}
                      >
                        {copied ? (
                          <Check className="w-5 h-5 text-green-600 group-hover/copy:text-white" />
                        ) : (
                          <Copy className="w-5 h-5 text-gray-600 group-hover/copy:text-white" />
                        )}
                      </Button>
                    </div>
                    {copied && (
                      <div className="absolute -top-8 right-0 bg-green-500 text-white text-xs px-3 py-1 rounded-full animate-fade-in">
                        Copied!
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 text-left">
                    💡 Please save this UUID. You'll need it to check your submission status.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 w-full pt-4 animate-fade-in-up animation-delay-400">
                  <Button
                    onClick={() => {
                      dispatch(clearSubmissionState());
                      window.location.reload();
                    }}
                    className="flex-1 bg-[#294a4a] hover:bg-[#375b59] text-white h-12 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Submit Another Form
                  </Button>
                  <Button
                    onClick={() => {
                      navigate(`/intake/status?uuid=${submittedUuid}`);
                    }}
                    variant="outline"
                    className="flex-1 border-2 border-[#294a4a] text-[#294a4a] hover:bg-[#294a4a] hover:text-white h-12 text-base font-medium transition-all duration-300"
                  >
                    Check Status
                  </Button>
                </div>

                {/* Decorative Elements */}
                <div className="flex items-center gap-2 pt-4 animate-fade-in-up animation-delay-600">
                  <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                  <span className="text-sm text-gray-500">Your submission is being processed</span>
                  <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-4 pb-12 px-4 overflow-x-hidden" style={{ backgroundColor: 'var(--brand-color)' }}>
      <div className="max-w-4xl mx-auto w-full">
        <Card className="shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-[#294a4a] to-[#375b59] text-white">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <FileText className="w-6 h-6" />
              STUDENT INTAKE FORM
            </CardTitle>
            <CardDescription className="text-gray-100 mt-2">
              This form allows Virtual Peace of Mind (VPM) to verify insurance coverage, confirm urgency, and contact families to complete consent and schedule services.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 md:p-8 overflow-x-hidden">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* SECTION 1: STUDENT INFORMATION */}
              <div className="space-y-4 animate-fade-in-up">
                <div className="flex items-center gap-2 pb-2 border-b-2 border-[#294a4a]/20">
                  <div className="p-2 bg-[#294a4a]/10 rounded-lg">
                    <FileText className="w-5 h-5 text-[#294a4a]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">SECTION 1: STUDENT INFORMATION</h3>
                </div>
                <p className="text-sm text-gray-600 italic">All fields are auto-populated</p>
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

              {/* SECTION 2: PARENT/GUARDIAN CONTACT INFORMATION */}
              <div className="space-y-4 animate-fade-in-up animation-delay-200">
                <div className="flex items-center gap-2 pb-2 border-b-2 border-[#294a4a]/20">
                  <div className="p-2 bg-[#294a4a]/10 rounded-lg">
                    <FileText className="w-5 h-5 text-[#294a4a]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">SECTION 2: PARENT/GUARDIAN CONTACT INFORMATION</h3>
                </div>
                <p className="text-sm text-gray-600 italic">All fields are auto-populated-editable</p>
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
              <div className="space-y-4 animate-fade-in-up animation-delay-400">
                <div className="flex items-center gap-2 pb-2 border-b-2 border-[#294a4a]/20">
                  <div className="p-2 bg-[#294a4a]/10 rounded-lg">
                    <FileText className="w-5 h-5 text-[#294a4a]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">SECTION 3: SERVICE REQUEST TYPE (Required)</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">Please select one:</p>
                <RadioGroup
                  value={watch("service_request_type")}
                  onValueChange={(value) => setValue("service_request_type", value as "start_now" | "opt_in_future")}
                >
                  <div className="flex items-start space-x-3 space-y-0 py-2">
                    <RadioGroupItem value="start_now" id="start_now" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="start_now" className="cursor-pointer font-normal">
                        My child needs to start services now (new opt-in)
                      </Label>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 space-y-0 py-2">
                    <RadioGroupItem value="opt_in_future" id="opt_in_future" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="opt_in_future" className="cursor-pointer font-normal">
                        I am opting in now, so services are available if needed later
                      </Label>
                      <p className="text-sm text-gray-600 mt-2 italic">
                        (This selection will not trigger an appointment, but VPM will contact you to complete the students file, send consents, and secure insurance info, in preparation for when an appointment is needed).
                      </p>
                    </div>
                  </div>
                </RadioGroup>
                {errors.service_request_type && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.service_request_type.message}
                  </p>
                )}
              </div>

              {/* SECTION 4: INSURANCE INFORMATION */}
              <div className="space-y-4 animate-fade-in-up animation-delay-600">
                <div className="flex items-center gap-2 pb-2 border-b-2 border-[#294a4a]/20">
                  <div className="p-2 bg-[#294a4a]/10 rounded-lg">
                    <FileText className="w-5 h-5 text-[#294a4a]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">SECTION 4: INSURANCE INFORMATION (Required to Proceed)</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">Does your child currently have health insurance?</p>
                <RadioGroup
                  value={watch("insurance_information.has_insurance")}
                  onValueChange={(value) => setValue("insurance_information.has_insurance", value as "yes" | "no")}
                >
                  <div className="flex items-center space-x-3 space-y-0 py-2">
                    <RadioGroupItem value="yes" id="has_insurance_yes" />
                    <Label htmlFor="has_insurance_yes" className="cursor-pointer font-normal">
                      Yes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 space-y-0 py-2">
                    <RadioGroupItem value="no" id="has_insurance_no" />
                    <Label htmlFor="has_insurance_no" className="cursor-pointer font-normal">
                      No
                    </Label>
                  </div>
                </RadioGroup>
                {errors.insurance_information?.has_insurance && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.insurance_information.has_insurance.message}
                  </p>
                )}

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

                    {/* Insurance Card Upload */}
                    <div className="space-y-4 mt-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm font-semibold text-blue-900 mb-2">Required: Upload photo of front and back of insurance card</p>
                        <p className="text-xs text-blue-700">
                          Insurance information is used to support care coordination and program funding. Families are never billed.
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Take photo of FRONT</Label>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => handleCameraCapture("front")}
                              className="flex-1"
                            >
                              <Camera className="w-4 h-4 mr-2" />
                              Camera
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                const input = document.createElement("input");
                                input.type = "file";
                                input.accept = "image/*";
                                input.onchange = (e) => {
                                  const file = (e.target as HTMLInputElement).files?.[0];
                                  if (file) handleFileUpload("front", file);
                                };
                                input.click();
                              }}
                              className="flex-1"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Upload
                            </Button>
                          </div>
                          {insuranceCardFront && (
                            <p className="text-sm text-green-600 font-medium">
                              ✓ {insuranceCardFront.name}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label>Take photo of BACK</Label>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => handleCameraCapture("back")}
                              className="flex-1"
                            >
                              <Camera className="w-4 h-4 mr-2" />
                              Camera
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                const input = document.createElement("input");
                                input.type = "file";
                                input.accept = "image/*";
                                input.onchange = (e) => {
                                  const file = (e.target as HTMLInputElement).files?.[0];
                                  if (file) handleFileUpload("back", file);
                                };
                                input.click();
                              }}
                              className="flex-1"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Upload
                            </Button>
                          </div>
                          {insuranceCardBack && (
                            <p className="text-sm text-green-600 font-medium">
                              ✓ {insuranceCardBack.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 5: Service Needs */}
              <div className="space-y-4 animate-fade-in-up">
                <div className="flex items-center gap-2 pb-2 border-b-2 border-[#294a4a]/20">
                  <div className="p-2 bg-[#294a4a]/10 rounded-lg">
                    <FileText className="w-5 h-5 text-[#294a4a]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">SECTION 5: Service Needs</h3>
                </div>
                
                {/* Service Category */}
                <div className="space-y-2">
                  <Label>Service Category *</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="service_category_mental_health"
                        checked={serviceCategory.includes("mental health")}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(
                            "service_needs.service_category",
                            "mental health",
                            checked as boolean,
                            serviceCategory
                          )
                        }
                      />
                      <Label htmlFor="service_category_mental_health" className="cursor-pointer font-normal">
                        mental health
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="service_category_substance_use"
                        checked={serviceCategory.includes("Substance Use")}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(
                            "service_needs.service_category",
                            "Substance Use",
                            checked as boolean,
                            serviceCategory
                          )
                        }
                      />
                      <Label htmlFor="service_category_substance_use" className="cursor-pointer font-normal">
                        Substance Use
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="service_category_other"
                        checked={serviceCategory.includes("Other Service")}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(
                            "service_needs.service_category",
                            "Other Service",
                            checked as boolean,
                            serviceCategory
                          )
                        }
                      />
                      <Label htmlFor="service_category_other" className="cursor-pointer font-normal">
                        Other Service :
                      </Label>
                      {serviceCategory.includes("Other Service") && (
                        <Input
                          {...register("service_needs.service_category_other")}
                          placeholder="Enter other service"
                          className="max-w-xs"
                        />
                      )}
                    </div>
                  </div>
                  {errors.service_needs?.service_category && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.service_needs.service_category.message}
                    </p>
                  )}
                </div>

                {/* Severity of Concern */}
                <div className="space-y-2">
                  <Label>Severity of Concern *</Label>
                  <RadioGroup
                    value={watch("service_needs.severity_of_concern")}
                    onValueChange={(value) =>
                      setValue("service_needs.severity_of_concern", value as "mild" | "moderate" | "severe")
                    }
                  >
                    <div className="flex items-center space-x-3 space-y-0 py-2">
                      <RadioGroupItem value="mild" id="severity_mild" />
                      <Label htmlFor="severity_mild" className="cursor-pointer font-normal">Mild</Label>
                    </div>
                    <div className="flex items-center space-x-3 space-y-0 py-2">
                      <RadioGroupItem value="moderate" id="severity_moderate" />
                      <Label htmlFor="severity_moderate" className="cursor-pointer font-normal">Moderate</Label>
                    </div>
                    <div className="flex items-center space-x-3 space-y-0 py-2">
                      <RadioGroupItem value="severe" id="severity_severe" />
                      <Label htmlFor="severity_severe" className="cursor-pointer font-normal">Severe</Label>
                    </div>
                  </RadioGroup>
                  {errors.service_needs?.severity_of_concern && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.service_needs.severity_of_concern.message}
                    </p>
                  )}
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
                          className="cursor-pointer font-normal text-sm"
                        >
                          {service}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {errors.service_needs?.type_of_service_needed && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.service_needs.type_of_service_needed.message}
                    </p>
                  )}
                </div>

                {/* Family Resources Dropdown */}
                <div className="space-y-2">
                  <Label>Family Resources</Label>
                  <p className="text-xs text-gray-600 mb-2">Choose all that apply (dropdown)</p>
                  <div className="border-2 border-gray-200 rounded-lg p-3 min-h-[60px] bg-gradient-to-br from-gray-50 to-white transition-all duration-200 hover:border-[#294a4a]/30">
                    {familyResources.length === 0 ? (
                      <p className="text-sm text-gray-400 italic flex items-center gap-2">
                        <Sparkles className="w-4 h-4 animate-pulse" />
                        No resources selected
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {familyResources.map((resource, index) => (
                          <span
                            key={resource}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-[#294a4a] to-[#375b59] text-white text-sm rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 animate-slide-in"
                            style={{ animationDelay: `${index * 0.1}s` }}
                          >
                            {resource}
                            <button
                              type="button"
                              onClick={() =>
                                handleMultiSelectChange(
                                  "service_needs.family_resources",
                                  resource,
                                  familyResources
                                )
                              }
                              className="ml-1 hover:text-red-200 hover:scale-110 transition-transform"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <Select
                    onValueChange={(value) => {
                      handleMultiSelectChange(
                        "service_needs.family_resources",
                        value,
                        familyResources
                      );
                    }}
                    value=""
                  >
                    <SelectTrigger className="w-full h-12 animate-fade-in">
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

                {/* Referral Concern Dropdown */}
                <div className="space-y-2">
                  <Label>Referral Concern</Label>
                  <p className="text-xs text-gray-600 mb-2">Choose all that apply (dropdown)</p>
                  <div className="border-2 border-gray-200 rounded-lg p-3 min-h-[60px] bg-gradient-to-br from-gray-50 to-white transition-all duration-200 hover:border-[#294a4a]/30">
                    {referralConcern.length === 0 ? (
                      <p className="text-sm text-gray-400 italic flex items-center gap-2">
                        <Sparkles className="w-4 h-4 animate-pulse" />
                        No concerns selected
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {referralConcern.map((concern, index) => (
                          <span
                            key={concern}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 animate-slide-in"
                            style={{ animationDelay: `${index * 0.1}s` }}
                          >
                            {concern}
                            <button
                              type="button"
                              onClick={() =>
                                handleMultiSelectChange(
                                  "service_needs.referral_concern",
                                  concern,
                                  referralConcern
                                )
                              }
                              className="ml-1 hover:text-red-200 hover:scale-110 transition-transform"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <Select
                    onValueChange={(value) => {
                      handleMultiSelectChange(
                        "service_needs.referral_concern",
                        value,
                        referralConcern
                      );
                    }}
                    value=""
                  >
                    <SelectTrigger className="w-full h-12 animate-fade-in">
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

              {/* SECTION 6: Demographics (optional) */}
              <div className="space-y-4 animate-fade-in-up">
                <div className="flex items-center gap-2 pb-2 border-b-2 border-[#294a4a]/20">
                  <div className="p-2 bg-[#294a4a]/10 rounded-lg">
                    <FileText className="w-5 h-5 text-[#294a4a]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">SECTION 6: Demographics (optional)</h3>
                </div>
                
                {/* Sex at birth */}
                <div className="space-y-2">
                  <Label>Sex at birth</Label>
                  <RadioGroup
                    value={watch("demographics.sex_at_birth")}
                    onValueChange={(value) =>
                      setValue("demographics.sex_at_birth", value as "male" | "female" | "other" | "prefer_not_to_answer")
                    }
                  >
                    <div className="flex items-center space-x-3 space-y-0 py-2">
                      <RadioGroupItem value="male" id="sex_male" />
                      <Label htmlFor="sex_male" className="cursor-pointer font-normal">male</Label>
                    </div>
                    <div className="flex items-center space-x-3 space-y-0 py-2">
                      <RadioGroupItem value="female" id="sex_female" />
                      <Label htmlFor="sex_female" className="cursor-pointer font-normal">female</Label>
                    </div>
                    <div className="flex items-center space-x-3 space-y-0 py-2">
                      <RadioGroupItem value="other" id="sex_other" />
                      <Label htmlFor="sex_other" className="cursor-pointer font-normal">Other</Label>
                    </div>
                    <div className="flex items-center space-x-3 space-y-0 py-2">
                      <RadioGroupItem value="prefer_not_to_answer" id="sex_prefer_not" />
                      <Label htmlFor="sex_prefer_not" className="cursor-pointer font-normal">Prefer not to answer</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Race */}
                <div className="space-y-2">
                  <Label>Race</Label>
                  <div className="space-y-2">
                    {RACE_OPTIONS.map((raceOption) => (
                      <div key={raceOption} className="flex items-center space-x-2">
                        <Checkbox
                          id={`race_${raceOption.toLowerCase().replace(/\s+/g, "_")}`}
                          checked={race.includes(raceOption)}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange(
                              "demographics.race",
                              raceOption,
                              checked as boolean,
                              race
                            )
                          }
                        />
                        <div className="flex-1 flex items-center gap-2">
                          <Label
                            htmlFor={`race_${raceOption.toLowerCase().replace(/\s+/g, "_")}`}
                            className="cursor-pointer font-normal text-sm"
                          >
                            {raceOption}
                          </Label>
                          {raceOption === "Other (please specify)" && race.includes(raceOption) && (
                            <Input
                              {...register("demographics.race_other")}
                              placeholder="Please specify"
                              className="max-w-xs"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ethnicity */}
                <div className="space-y-2">
                  <Label>Ethnicity</Label>
                  <div className="space-y-2">
                    {["Hispanic or Latino", "Not Hispanic or Latino", "Prefer not to answer"].map((ethnicity) => (
                      <div key={ethnicity} className="flex items-center space-x-2">
                        <Checkbox
                          id={`ethnicity_${ethnicity.toLowerCase().replace(/\s+/g, "_")}`}
                          checked={(watch("demographics.ethnicity") || []).includes(ethnicity)}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange(
                              "demographics.ethnicity",
                              ethnicity,
                              checked as boolean,
                              watch("demographics.ethnicity") || []
                            )
                          }
                        />
                        <Label
                          htmlFor={`ethnicity_${ethnicity.toLowerCase().replace(/\s+/g, "_")}`}
                          className="cursor-pointer font-normal text-sm"
                        >
                          {ethnicity}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-gray-600 italic mt-2">
                  This information is optional and is collected only in aggregate to support equitable access to services.
                </p>
              </div>

              {/* SECTION 7: SAFETY CHECK */}
              <div className="space-y-4 animate-fade-in-up">
                <div className="flex items-center gap-2 pb-2 border-b-2 border-[#294a4a]/20">
                  <div className="p-2 bg-[#294a4a]/10 rounded-lg">
                    <FileText className="w-5 h-5 text-[#294a4a]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">SECTION 7: SAFETY CHECK (Required)</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">Is your child currently experiencing an immediate safety concern?</p>
                <RadioGroup
                  value={watch("immediate_safety_concern")}
                  onValueChange={(value) => setValue("immediate_safety_concern", value as "yes" | "no")}
                >
                  <div className="flex items-center space-x-3 space-y-0 py-2">
                    <RadioGroupItem value="no" id="safety_no" />
                    <Label htmlFor="safety_no" className="cursor-pointer font-normal">No</Label>
                  </div>
                  <div className="flex items-center space-x-3 space-y-0 py-2">
                    <RadioGroupItem value="yes" id="safety_yes" />
                    <Label htmlFor="safety_yes" className="cursor-pointer font-normal">Yes</Label>
                  </div>
                </RadioGroup>
                {errors.immediate_safety_concern && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.immediate_safety_concern.message}
                  </p>
                )}
                {immediateSafetyConcern && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      If your child is in immediate danger, please call 911 or local emergency services.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* SECTION 8: AUTHORIZATION */}
              <div className="space-y-4 animate-fade-in-up">
                <div className="flex items-center gap-2 pb-2 border-b-2 border-[#294a4a]/20">
                  <div className="p-2 bg-[#294a4a]/10 rounded-lg">
                    <FileText className="w-5 h-5 text-[#294a4a]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">SECTION 8: AUTHORIZATION TO SHARE INFORMATION (Required)</h3>
                </div>
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="authorization"
                    checked={watch("authorization_consent")}
                    onCheckedChange={(checked) =>
                      setValue("authorization_consent", checked as boolean)
                    }
                    className="mt-1"
                  />
                  <Label htmlFor="authorization" className="cursor-pointer font-normal leading-relaxed">
                    I authorize Chesapeake Public Schools to securely share the information above with Virtual Peace of Mind for the purpose of care coordination, insurance verification, and next steps.
                  </Label>
                </div>
                {errors.authorization_consent && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.authorization_consent.message}
                  </p>
                )}
              </div>

              {/* Submit Button and Footer */}
              <div className="space-y-4 pt-4 border-t">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#294a4a] hover:bg-[#375b59] text-white py-6 text-lg font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit"
                  )}
                </Button>
                <div className="text-xs text-gray-600 space-y-2 bg-gray-50 p-4 rounded-lg">
                  <p>
                    By submitting your information, you consent to receive occasional updates and communications from Virtual Peace of Mind (VPM) about our school-based mental health services. You may opt out at any time.
                  </p>
                  <p>
                    Your privacy is important to us—VPM complies with all HIPAA and FERPA standards to protect student and family information. For more details, please review our{" "}
                    <a href="#" className="text-[#294a4a] hover:underline font-medium">Privacy Policy</a>.
                  </p>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IntakeForm;
