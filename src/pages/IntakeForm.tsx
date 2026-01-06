import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Upload, Camera, Loader2 } from "lucide-react";
import { IntakeService } from "@/services/intakeService";
import { IntakeFormData } from "@/types/intake";
import { toast } from "sonner";

// Form validation schema
const intakeFormSchema = z.object({
  student_information: z.object({
    full_name: z.string().min(1, "Student full name is required"),
    student_id: z.string().optional(),
    date_of_birth: z.string().min(1, "Date of birth is required"),
    grade_level: z.string().min(1, "Grade level is required"),
  }),
  parent_guardian_contact: z.object({
    name: z.string().min(1, "Parent/Guardian name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number is required"),
  }),
  service_request_type: z.enum(["start_now", "opt_in_future"]),
  insurance_information: z.object({
    has_insurance: z.boolean(),
    insurance_company: z.string().optional(),
    policyholder_name: z.string().optional(),
    relationship_to_student: z.string().optional(),
    member_id: z.string().optional(),
    group_number: z.string().optional(),
  }).refine((data) => {
    if (data.has_insurance) {
      return !!data.insurance_company && !!data.policyholder_name && !!data.member_id;
    }
    return true;
  }, {
    message: "Insurance company, policyholder name, and member ID are required when insurance is selected",
  }),
  immediate_safety_concern: z.boolean(),
  authorization_consent: z.boolean().refine((val) => val === true, {
    message: "You must authorize to proceed",
  }),
});

type IntakeFormValues = z.infer<typeof intakeFormSchema> & {
  insurance_information: {
    has_insurance: boolean;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedUuid, setSubmittedUuid] = useState<string | null>(null);
  const [insuranceCardFront, setInsuranceCardFront] = useState<File | null>(null);
  const [insuranceCardBack, setInsuranceCardBack] = useState<File | null>(null);

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
        full_name: "",
        student_id: "",
        date_of_birth: "",
        grade_level: "",
      },
      parent_guardian_contact: {
        name: "",
        email: "",
        phone: "",
      },
      service_request_type: "start_now",
      insurance_information: {
        has_insurance: false,
      },
      immediate_safety_concern: false,
      authorization_consent: false,
    },
  });

  const hasInsurance = watch("insurance_information.has_insurance");
  const immediateSafetyConcern = watch("immediate_safety_concern");

  const onSubmit = async (data: IntakeFormValues) => {
    setIsSubmitting(true);
    try {
      const formData: IntakeFormData = {
        ...data,
        insurance_information: {
          ...data.insurance_information,
          insurance_card_front: insuranceCardFront,
          insurance_card_back: insuranceCardBack,
        },
      };

      const response = await IntakeService.submitIntakeForm(formData);
      setSubmittedUuid(response.student_uuid);
      toast.success("Intake form submitted successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit intake form");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (field: "front" | "back", file: File | null) => {
    if (field === "front") {
      setInsuranceCardFront(file);
    } else {
      setInsuranceCardBack(file);
    }
  };

  const handleCameraCapture = async (field: "front" | "back") => {
    // Mobile camera integration
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment"; // Use back camera on mobile
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleFileUpload(field, file);
      }
    };
    input.click();
  };

  if (submittedUuid) {
    return (
      <div className="min-h-screen py-12 px-4" style={{ backgroundColor: 'var(--brand-color)' }}>
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="w-6 h-6" />
                <CardTitle>Form Submitted Successfully</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Your intake form has been submitted. Please save this Student UUID for status checking:
              </p>
              <div className="p-4 bg-muted rounded-lg">
                <Label className="text-sm font-semibold">Student UUID:</Label>
                <p className="font-mono text-lg mt-2 break-all">{submittedUuid}</p>
              </div>
              <Button
                onClick={() => {
                  setSubmittedUuid(null);
                  window.location.reload();
                }}
                className="w-full"
              >
                Submit Another Form
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4" style={{ backgroundColor: 'var(--brand-color)' }}>
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Student Assistance Program (SSAP) - Intake Form</CardTitle>
            <CardDescription>
              This form allows Virtual Peace of Mind (VPM) to verify insurance coverage, confirm urgency, and contact families to complete consent and schedule services.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Section 2: Student Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Section 2: Student Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="student_full_name">Student Full Name *</Label>
                    <Input
                      id="student_full_name"
                      {...register("student_information.full_name")}
                      placeholder="Enter student's full name"
                    />
                    {errors.student_information?.full_name && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.student_information.full_name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="student_id">Student ID (Optional)</Label>
                    <Input
                      id="student_id"
                      {...register("student_information.student_id")}
                      placeholder="Enter student ID"
                    />
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
                    <Label htmlFor="grade_level">Grade Level *</Label>
                    <Input
                      id="grade_level"
                      {...register("student_information.grade_level")}
                      placeholder="e.g., 9th, 10th, 11th, 12th"
                    />
                    {errors.student_information?.grade_level && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.student_information.grade_level.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 3: Parent/Guardian Contact */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Section 3: Parent/Guardian Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="parent_name">Parent/Guardian Name *</Label>
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
                    <Label htmlFor="parent_email">Email Address *</Label>
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
                    <Label htmlFor="parent_phone">Phone Number *</Label>
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

              {/* Section 3: Service Request Type */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Section 3: Service Request Type *</h3>
                <RadioGroup
                  value={watch("service_request_type")}
                  onValueChange={(value) => setValue("service_request_type", value as "start_now" | "opt_in_future")}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="start_now" id="start_now" />
                    <Label htmlFor="start_now" className="cursor-pointer">
                      My child needs to start services now (new sign-in)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="opt_in_future" id="opt_in_future" />
                    <Label htmlFor="opt_in_future" className="cursor-pointer">
                      I am opting in for future services if needed later
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Section 4: Insurance Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Section 4: Insurance Information *</h3>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has_insurance"
                    checked={hasInsurance}
                    onCheckedChange={(checked) =>
                      setValue("insurance_information.has_insurance", checked as boolean)
                    }
                  />
                  <Label htmlFor="has_insurance" className="cursor-pointer">
                    Does your child currently have health insurance?
                  </Label>
                </div>

                {hasInsurance && (
                  <div className="ml-6 space-y-4 border-l-2 border-primary pl-4">
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
                        <Label htmlFor="relationship">Relationship to Student *</Label>
                        <Input
                          id="relationship"
                          {...register("insurance_information.relationship_to_student")}
                          placeholder="e.g., Parent, Guardian"
                        />
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
                    <div className="space-y-4">
                      <Label>Upload Insurance Card (Optional)</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Front of Card</Label>
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
                            <p className="text-sm text-muted-foreground">
                              {insuranceCardFront.name}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label>Back of Card</Label>
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
                            <p className="text-sm text-muted-foreground">
                              {insuranceCardBack.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 7: Safety Concern */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Section 7: Safety Concern *</h3>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="safety_concern"
                    checked={immediateSafetyConcern}
                    onCheckedChange={(checked) =>
                      setValue("immediate_safety_concern", checked as boolean)
                    }
                  />
                  <Label htmlFor="safety_concern" className="cursor-pointer">
                    Is your child currently experiencing an immediate safety concern?
                  </Label>
                </div>
                {immediateSafetyConcern && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      If your child is in immediate danger, please call 911 or local emergency services.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Section 8: Authorization */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Section 8: Authorization *</h3>
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="authorization"
                    checked={watch("authorization_consent")}
                    onCheckedChange={(checked) =>
                      setValue("authorization_consent", checked as boolean)
                    }
                  />
                  <Label htmlFor="authorization" className="cursor-pointer">
                    Authorize to securely share the information above with Virtual Peace of Mind for the purpose of care coordination, insurance verification, and next steps.
                  </Label>
                </div>
                {errors.authorization_consent && (
                  <p className="text-sm text-destructive">
                    {errors.authorization_consent.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IntakeForm;

