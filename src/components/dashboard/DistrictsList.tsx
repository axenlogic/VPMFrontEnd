import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Building2, School, FileText, ChevronRight, Users, Calendar, Copy, Check, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Type definitions for API integration
export interface IntakeForm {
  id: string;
  studentName: string | null;
  submittedDate: string;
  status: "pending" | "processed" | "active" | "submitted";
  studentUuid: string;
}

export interface School {
  id: string;
  name: string;
  totalStudents: number;
  activeStudents: number;
  forms: IntakeForm[];
}

export interface District {
  id: string;
  name: string;
  totalSchools: number;
  totalStudents: number;
  activeStudents: number;
  schools: School[];
}

interface DistrictsListProps {
  districts?: District[];
  onFormClick?: (form: IntakeForm) => void;
}

const DistrictsList = ({ districts, onFormClick }: DistrictsListProps) => {
  // Use API data or show empty state
  const displayDistricts = districts || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-50 text-green-700 border-green-200";
      case "processed":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "pending":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "submitted":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Active";
      case "processed":
        return "Completed";
      case "pending":
        return "Opt-ins";
      case "submitted":
        return "Submitted";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const getStudentDisplayName = (studentName: string | null, studentUuid: string) => {
    if (studentName && studentName.trim()) {
      return studentName;
    }
    // If name is null or empty, show a formatted UUID (first 8 chars)
    const shortUuid = studentUuid.substring(0, 8);
    return `Student ${shortUuid}...`;
  };

  const [copiedUuid, setCopiedUuid] = useState<string | null>(null);

  const handleCopyUuid = async (uuid: string) => {
    try {
      await navigator.clipboard.writeText(uuid);
      setCopiedUuid(uuid);
      toast.success("UUID copied to clipboard!");
      setTimeout(() => setCopiedUuid(null), 2000);
    } catch (err) {
      toast.error("Failed to copy UUID");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card className="bg-white border border-gray-200 shadow-lg overflow-hidden">
      <CardHeader className="pb-5 bg-gradient-to-r from-[#294a4a] to-[#375b59] text-white">
        <CardTitle className="text-xl font-semibold flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
            <Building2 className="h-6 w-6" />
          </div>
          Districts & Schools Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {displayDistricts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="p-4 bg-gray-100 rounded-full">
                <Building2 className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Districts Found</h3>
                <p className="text-sm text-gray-500">
                  There are no districts available at the moment. Please check back later.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <Accordion type="multiple" className="w-full">
            {displayDistricts.map((district, districtIndex) => (
            <AccordionItem
              key={district.id}
              value={district.id}
              className="border-b border-gray-100 last:border-b-0"
            >
              <AccordionTrigger className="px-6 py-5 hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent transition-all duration-300 group">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-gray-100 border border-gray-200 flex-shrink-0 group-hover:bg-gray-200 group-hover:scale-105 transition-all duration-300">
                      <Building2 className="h-5 w-5 text-gray-700" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-base font-semibold text-gray-900 mb-2">{district.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <School className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          <span className="font-medium text-gray-700">
                            {district.totalSchools} Schools
                          </span>
                        </div>
                        <span className="text-gray-300">|</span>
                        <div className="flex items-center gap-1.5">
                          <Users className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          <span className="font-medium text-gray-700">
                            {district.totalStudents.toLocaleString()} Students
                          </span>
                        </div>
                        <span className="text-gray-300">|</span>
                        <div className="flex items-center gap-1.5">
                          <Activity className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          <span className="font-medium text-gray-700">
                            {district.activeStudents.toLocaleString()} Active
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-5 bg-gray-50/50">
                <div className="ml-16 space-y-4 animate-in slide-in-from-top-2 duration-300">
                  {district.schools.map((school, schoolIndex) => (
                    <Accordion
                      key={school.id}
                      type="single"
                      collapsible
                      className="w-full"
                    >
                      <AccordionItem
                        value={school.id}
                        className="border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                      >
                        <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent transition-all duration-300">
                          <div className="flex items-center justify-between w-full pr-4">
                            <div className="flex items-center gap-4">
                              <div className="p-2.5 rounded-lg bg-gray-100 border border-gray-200">
                                <School className="h-5 w-5 text-gray-700" />
                              </div>
                              <div className="text-left">
                                <h4 className="text-sm font-semibold text-gray-900 mb-1.5">
                                  {school.name}
                                </h4>
                                <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
                                  <div className="flex items-center gap-1.5">
                                    <Users className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                    <span className="font-medium text-gray-700">
                                      {school.totalStudents} Students
                                    </span>
                                  </div>
                                  <span className="text-gray-300">|</span>
                                  <div className="flex items-center gap-1.5">
                                    <Activity className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                    <span className="font-medium text-gray-700">
                                      {school.activeStudents} Active
                                    </span>
                                  </div>
                                  <span className="text-gray-300">|</span>
                                  <div className="flex items-center gap-1.5">
                                    <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                    <span className="font-medium text-gray-700">
                                      {school.forms.length} Forms
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-5 pb-5">
                          <div className="ml-12 space-y-4 animate-in slide-in-from-top-2 duration-300">
                            {school.forms.length > 0 ? (
                              school.forms.map((form) => (
                                <div
                                  key={form.id}
                                  onClick={() => onFormClick?.(form)}
                                  className="group relative flex items-center justify-between p-5 rounded-2xl bg-white border border-gray-200 hover:border-[#294a4a]/40 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
                                >
                                  {/* Subtle background gradient on hover */}
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#294a4a]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                  
                                  {/* Left Section - Icon and Content */}
                                  <div className="flex items-start gap-5 flex-1 min-w-0 relative z-10">
                                    {/* Icon Container */}
                                    <div className="flex-shrink-0 mt-0.5">
                                      <div className="p-3.5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 group-hover:from-[#294a4a]/10 group-hover:to-[#294a4a]/5 group-hover:border-[#294a4a]/20 transition-all duration-300 shadow-sm">
                                        <FileText className="h-5 w-5 text-gray-600 group-hover:text-[#294a4a] transition-colors duration-300" />
                                      </div>
                                    </div>
                                    
                                    {/* Content Section */}
                                    <div className="flex-1 min-w-0 space-y-3">
                                      {/* Student Name */}
                                      <div>
                                        <p className="text-base font-semibold text-gray-900 mb-2 leading-tight">
                                          {getStudentDisplayName(form.studentName, form.studentUuid)}
                                        </p>
                                      </div>
                                      
                                      {/* Metadata Row - Simple inline format */}
                                      <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
                                        {/* Date with icon */}
                                        <div className="flex items-center gap-1.5">
                                          <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                          <span className="font-medium text-gray-700">
                                            {formatDate(form.submittedDate)}
                                          </span>
                                        </div>
                                        
                                        {/* Separator */}
                                        <span className="text-gray-300">|</span>
                                        
                                        {/* UUID with icon - Clickable */}
                                        <div
                                          onClick={(e) => {
                                            e.stopPropagation(); // Prevent form click
                                            handleCopyUuid(form.studentUuid);
                                          }}
                                          className={cn(
                                            "flex items-center gap-1.5 cursor-pointer transition-all duration-200 group/uuid",
                                            copiedUuid === form.studentUuid ? "text-green-600" : "text-gray-500 hover:text-[#294a4a]"
                                          )}
                                          title={`Click to copy: ${form.studentUuid}`}
                                        >
                                          {copiedUuid === form.studentUuid ? (
                                            <>
                                              <Check className="h-4 w-4 flex-shrink-0 text-green-600" />
                                              <span className="font-mono font-medium">Copied!</span>
                                            </>
                                          ) : (
                                            <>
                                              <Copy className="h-4 w-4 flex-shrink-0 text-gray-500 group-hover/uuid:text-[#294a4a] transition-colors" />
                                              <span className="font-mono truncate max-w-[200px]">{form.studentUuid}</span>
                                            </>
                                          )}
                                        </div>
                                        
                                        {/* Name Pending Badge */}
                                        {!form.studentName && (
                                          <>
                                            <span className="text-gray-300">|</span>
                                            <span className="text-xs font-medium text-amber-600">
                                              Name Pending
                                            </span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Right Section - Status and Arrow */}
                                  <div className="flex items-center gap-4 flex-shrink-0 relative z-10">
                                    {/* Status Badge */}
                                    <span
                                      className={cn(
                                        "px-4 py-2 rounded-xl text-sm font-semibold border shadow-sm",
                                        getStatusColor(form.status)
                                      )}
                                    >
                                      {getStatusLabel(form.status)}
                                    </span>
                                    
                                    {/* Arrow Icon */}
                                    <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 group-hover:bg-[#294a4a] group-hover:border-[#294a4a] transition-all duration-300 shadow-sm">
                                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-300" />
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="p-6 text-center rounded-xl bg-gray-50 border-2 border-dashed border-gray-300">
                                <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm font-medium text-gray-500">
                                  No forms submitted yet
                                </p>
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
};

export default DistrictsList;

