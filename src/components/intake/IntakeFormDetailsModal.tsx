import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, User, Phone, Calendar, Shield, Heart, Users, AlertTriangle, CheckCircle2, Image as ImageIcon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getIntakeFormDetails, clearFormDetails } from "@/store/slices/intakeSlice";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { IntakeService } from "@/services/intakeService";

interface IntakeFormDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentUuid: string;
  onStatusChange?: (status: IntakeStatus) => void;
}

type IntakeStatus = "pending" | "processed" | "active";

const STATUS_OPTIONS: { value: IntakeStatus; label: string }[] = [
  { value: "pending", label: "Opt-in" },
  { value: "active", label: "Active" },
  { value: "processed", label: "Completed" },
];

const IntakeFormDetailsModal = ({ open, onOpenChange, studentUuid, onStatusChange }: IntakeFormDetailsModalProps) => {
  const dispatch = useAppDispatch();
  const { isFetchingDetails, detailsError, formDetails } = useAppSelector(
    (state) => state.intake
  );
  const [statusValue, setStatusValue] = useState<IntakeStatus | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    if (open && studentUuid) {
      dispatch(getIntakeFormDetails(studentUuid));
    } else if (!open) {
      dispatch(clearFormDetails());
    }
  }, [open, studentUuid, dispatch]);

  useEffect(() => {
    if (detailsError) {
      toast.error(detailsError);
    }
  }, [detailsError]);

  useEffect(() => {
    if (formDetails?.status) {
      setStatusValue(formDetails.status as IntakeStatus);
    }
  }, [formDetails]);

  const getStatusBadge = (status: string) => {
    const baseClass =
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
    switch (status) {
      case "active":
        return (
          <Badge className={`${baseClass} bg-green-50 text-green-700 border-green-200`}>
            Active
          </Badge>
        );
      case "processed":
        return (
          <Badge className={`${baseClass} bg-blue-50 text-blue-700 border-blue-200`}>
            Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge className={`${baseClass} bg-orange-50 text-orange-700 border-orange-200`}>
            Opt-in
          </Badge>
        );
      default:
        return <Badge className={baseClass}>{status}</Badge>;
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

  const displayValue = (value?: string | number | null) => {
    if (value === null || value === undefined) return "N/A";
    const stringValue = String(value).trim();
    return stringValue.length > 0 ? stringValue : "N/A";
  };

  const renderBadgeList = (items?: string[]) => {
    if (!items || items.length === 0) {
      return <p className="text-sm text-gray-500 italic">No selection provided</p>;
    }
    return (
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Badge key={item} variant="outline" className="bg-white text-gray-700 border-gray-200 shadow-sm">
            {item}
          </Badge>
        ))}
      </div>
    );
  };

  const renderField = (label: string, value?: string | number | null, mono = false) => (
    <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
      <Label className="text-[11px] uppercase tracking-wide text-gray-500">{label}</Label>
      <p className={cn("mt-1 text-sm text-gray-900", mono && "font-mono break-all")}>
        {displayValue(value)}
      </p>
    </div>
  );

  const sectionClass = "bg-white rounded-xl border border-gray-200 p-6 space-y-4 shadow-sm";

  const handleStatusChange = async (value: IntakeStatus) => {
    if (!studentUuid || value === statusValue) {
      return;
    }
    setIsUpdatingStatus(true);
    try {
      await IntakeService.updateIntakeStatus(studentUuid, value);
      setStatusValue(value);
      toast.success("Status updated successfully");
      onStatusChange?.(value);
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto p-0" style={{ backgroundColor: 'var(--brand-color)' }}>
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-[#294a4a] rounded-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div className="space-y-2">
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  Intake Form Details
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  View complete form information (read-only)
                </DialogDescription>
                {formDetails && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </span>
                    {getStatusBadge(statusValue || formDetails.status)}
                  </div>
                )}
              </div>
            </div>
            {formDetails && (
              <div className="min-w-[200px]">
                <Label className="text-[11px] uppercase tracking-wide text-gray-500">Update Status</Label>
                <Select
                  value={statusValue || formDetails.status}
                  onValueChange={(value) => handleStatusChange(value as IntakeStatus)}
                  disabled={isUpdatingStatus}
                >
                  <SelectTrigger className="h-9 bg-white border-gray-200">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
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
          <div className="space-y-6 px-6 py-4">
            {/* Form Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
              {renderField("Student UUID", formDetails.student_uuid, true)}
              {renderField("Submitted Date", formatDate(formDetails.submitted_date))}
              {formDetails.processed_date ? renderField("Processed Date", formatDate(formDetails.processed_date)) : null}
            </div>

            {/* SECTION 1: STUDENT INFORMATION */}
            <div className={sectionClass}>
              <div className="flex items-center gap-2 pb-2 border-b-2 border-[#294a4a]/20">
                <div className="p-2 bg-[#294a4a]/10 rounded-lg">
                  <User className="w-5 h-5 text-[#294a4a]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">SECTION 1: STUDENT INFORMATION</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField("First Name", formDetails.student_information.first_name)}
                {renderField("Last Name", formDetails.student_information.last_name)}
                {renderField("Grade", formDetails.student_information.grade || formDetails.student_information.grade_level)}
                {renderField("School", formDetails.student_information.school)}
                {renderField("Date of Birth", formDetails.student_information.date_of_birth)}
                {renderField("Student ID", formDetails.student_information.student_id)}
              </div>
            </div>

            {/* SECTION 2: PARENT/GUARDIAN CONTACT */}
            <div className={sectionClass}>
              <div className="flex items-center gap-2 pb-2 border-b-2 border-[#294a4a]/20">
                <div className="p-2 bg-[#294a4a]/10 rounded-lg">
                  <Phone className="w-5 h-5 text-[#294a4a]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">SECTION 2: PARENT/GUARDIAN CONTACT INFORMATION</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField("Name", formDetails.parent_guardian_contact.name)}
                {renderField("Email address", formDetails.parent_guardian_contact.email)}
                <div className="md:col-span-2">
                  {renderField("Phone", formDetails.parent_guardian_contact.phone)}
                </div>
              </div>
            </div>

            {/* SECTION 3: SERVICE REQUEST TYPE */}
            <div className={sectionClass}>
              <div className="flex items-center gap-2 pb-2 border-b-2 border-[#294a4a]/20">
                <div className="p-2 bg-[#294a4a]/10 rounded-lg">
                  <Calendar className="w-5 h-5 text-[#294a4a]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">SECTION 3: SERVICE REQUEST TYPE</h3>
              </div>
              <div className="rounded-lg border border-[#294a4a]/20 bg-[#294a4a]/5 p-4 text-sm text-gray-800">
                {formDetails.service_request_type === "start_now"
                  ? "My child needs to start services now (new opt-in)"
                  : "I am opting in now, so services are available if needed later"}
              </div>
            </div>

            {/* SECTION 4: INSURANCE INFORMATION */}
            <div className={sectionClass}>
              <div className="flex items-center gap-2 pb-2 border-b-2 border-[#294a4a]/20">
                <div className="p-2 bg-[#294a4a]/10 rounded-lg">
                  <Shield className="w-5 h-5 text-[#294a4a]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">SECTION 4: INSURANCE INFORMATION</h3>
              </div>
              {renderField("Has insurance", formDetails.insurance_information.has_insurance === "yes" ? "Yes" : "No")}

              {formDetails.insurance_information.has_insurance === "yes" && (
                <div className="ml-0 md:ml-4 space-y-4 border-l-2 border-[#294a4a] pl-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField("Insurance Company Name", formDetails.insurance_information.insurance_company)}
                    {renderField("Policyholder Name", formDetails.insurance_information.policyholder_name)}
                    {renderField("Relationship to Student", formDetails.insurance_information.relationship_to_student)}
                    {renderField("Member ID Number", formDetails.insurance_information.member_id)}
                    {renderField("Group Number", formDetails.insurance_information.group_number)}
                  </div>

                  {(() => {
                    const insuranceInfo = formDetails.insurance_information as typeof formDetails.insurance_information & {
                      insurance_card_front?: string;
                      insurance_card_back?: string;
                    };
                    const frontUrl =
                      insuranceInfo.insurance_card_front_url || insuranceInfo.insurance_card_front;
                    const backUrl =
                      insuranceInfo.insurance_card_back_url || insuranceInfo.insurance_card_back;

                    if (!frontUrl && !backUrl) {
                      return (
                        <div className="space-y-2">
                          <Label>Insurance Cards</Label>
                          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-500">
                            No insurance card images uploaded.
                          </div>
                        </div>
                      );
                    }

                    return (
                    <div className="space-y-3">
                      <Label>Insurance Cards</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {frontUrl && (
                          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                            <div className="bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                              Front Card
                            </div>
                            <div className="p-3">
                              <img
                                src={frontUrl}
                                alt="Insurance card front"
                                className="h-40 w-full rounded-lg border border-gray-200 object-cover"
                              />
                              <a
                                href={frontUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-3 inline-flex items-center gap-2 text-sm text-[#294a4a] hover:text-[#375b59]"
                              >
                                <ImageIcon className="h-4 w-4" />
                                View full size
                              </a>
                            </div>
                          </div>
                        )}
                        {backUrl && (
                          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                            <div className="bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                              Back Card
                            </div>
                            <div className="p-3">
                              <img
                                src={backUrl}
                                alt="Insurance card back"
                                className="h-40 w-full rounded-lg border border-gray-200 object-cover"
                              />
                              <a
                                href={backUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-3 inline-flex items-center gap-2 text-sm text-[#294a4a] hover:text-[#375b59]"
                              >
                                <ImageIcon className="h-4 w-4" />
                                View full size
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* SECTION 5: SERVICE NEEDS */}
            <div className={sectionClass}>
              <div className="flex items-center gap-2 pb-2 border-b-2 border-[#294a4a]/20">
                <div className="p-2 bg-[#294a4a]/10 rounded-lg">
                  <Heart className="w-5 h-5 text-[#294a4a]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">SECTION 5: SERVICE NEEDS</h3>
              </div>

              <div className="space-y-2">
                <Label>Service Category</Label>
                {renderBadgeList(formDetails.service_needs.service_category)}
                {formDetails.service_needs.service_category_other && (
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Other:</span> {formDetails.service_needs.service_category_other}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Severity of Concern</Label>
                <p className="text-sm text-gray-900 capitalize">
                  {displayValue(formDetails.service_needs.severity_of_concern)}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Type of Service Needed</Label>
                {renderBadgeList(formDetails.service_needs.type_of_service_needed)}
              </div>

              <div className="space-y-2">
                <Label>Family Resources</Label>
                {renderBadgeList(formDetails.service_needs.family_resources)}
              </div>

              <div className="space-y-2">
                <Label>Referral Concern</Label>
                {renderBadgeList(formDetails.service_needs.referral_concern)}
              </div>
            </div>

            {/* SECTION 6: DEMOGRAPHICS */}
            {formDetails.demographics && (
              <div className={sectionClass}>
                <div className="flex items-center gap-2 pb-2 border-b-2 border-[#294a4a]/20">
                  <div className="p-2 bg-[#294a4a]/10 rounded-lg">
                    <Users className="w-5 h-5 text-[#294a4a]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">SECTION 6: DEMOGRAPHICS (Optional)</h3>
                </div>

                {formDetails.demographics.sex_at_birth && (
                  <div className="space-y-2">
                    <Label>Sex at Birth</Label>
                    <p className="text-sm text-gray-900 capitalize">
                      {displayValue(formDetails.demographics.sex_at_birth.replace(/_/g, " "))}
                    </p>
                  </div>
                )}

                {formDetails.demographics.race && formDetails.demographics.race.length > 0 && (
                  <div className="space-y-2">
                    <Label>Race</Label>
                    {renderBadgeList(formDetails.demographics.race)}
                    {formDetails.demographics.race_other && (
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Other:</span> {formDetails.demographics.race_other}
                      </p>
                    )}
                  </div>
                )}

                {formDetails.demographics.ethnicity && formDetails.demographics.ethnicity.length > 0 && (
                  <div className="space-y-2">
                    <Label>Ethnicity</Label>
                    {renderBadgeList(formDetails.demographics.ethnicity)}
                  </div>
                )}
              </div>
            )}

            {/* SECTION 7: IMMEDIATE SAFETY CONCERN */}
            <div className={sectionClass}>
              <div className="flex items-center gap-2 pb-2 border-b-2 border-[#294a4a]/20">
                <div className="p-2 bg-[#294a4a]/10 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-[#294a4a]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">SECTION 7: IMMEDIATE SAFETY CONCERN</h3>
              </div>
              <div className="rounded-lg border border-[#294a4a]/20 bg-[#294a4a]/5 p-4 text-sm text-gray-800">
                {formDetails.immediate_safety_concern === "yes" ? "Yes" : "No"}
              </div>
            </div>

            {/* SECTION 8: AUTHORIZATION */}
            <div className={sectionClass}>
              <div className="flex items-center gap-2 pb-2 border-b-2 border-[#294a4a]/20">
                <div className="p-2 bg-[#294a4a]/10 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-[#294a4a]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">SECTION 8: AUTHORIZATION & CONSENT</h3>
              </div>
              <div className="rounded-lg border border-[#294a4a]/20 bg-[#294a4a]/5 p-4 text-sm text-gray-800">
                {formDetails.authorization_consent
                  ? "Authorized for service coordination"
                  : "Not authorized"}
              </div>
            </div>
            {/* Footer Actions */}
            <div className="flex justify-end items-center pt-4 border-t border-gray-200 bg-white sticky bottom-0 pb-4 -mx-6 px-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-[#294a4a] text-[#294a4a] hover:bg-[#294a4a] hover:text-white"
              >
                Close
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default IntakeFormDetailsModal;

