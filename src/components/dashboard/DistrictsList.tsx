import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Building2, School, FileText, ChevronRight, Users, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

// Type definitions for API integration
export interface IntakeForm {
  id: string;
  studentName: string;
  submittedDate: string;
  status: "pending" | "processed" | "active";
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
  // Dummy data - will be replaced with API data
  const dummyDistricts: District[] = districts || [
    {
      id: "1",
      name: "Springfield District",
      totalSchools: 12,
      totalStudents: 2450,
      activeStudents: 890,
      schools: [
        {
          id: "1-1",
          name: "Springfield Elementary",
          totalStudents: 450,
          activeStudents: 180,
          forms: [
            {
              id: "f1",
              studentName: "John Doe",
              submittedDate: "2024-01-15",
              status: "active",
              studentUuid: "uuid-001",
            },
            {
              id: "f2",
              studentName: "Jane Smith",
              submittedDate: "2024-01-14",
              status: "processed",
              studentUuid: "uuid-002",
            },
            {
              id: "f3",
              studentName: "Mike Johnson",
              submittedDate: "2024-01-13",
              status: "pending",
              studentUuid: "uuid-003",
            },
          ],
        },
        {
          id: "1-2",
          name: "Springfield Middle School",
          totalStudents: 680,
          activeStudents: 250,
          forms: [
            {
              id: "f4",
              studentName: "Sarah Williams",
              submittedDate: "2024-01-16",
              status: "active",
              studentUuid: "uuid-004",
            },
            {
              id: "f5",
              studentName: "David Brown",
              submittedDate: "2024-01-12",
              status: "processed",
              studentUuid: "uuid-005",
            },
          ],
        },
        {
          id: "1-3",
          name: "Springfield High School",
          totalStudents: 1320,
          activeStudents: 460,
          forms: [
            {
              id: "f6",
              studentName: "Emily Davis",
              submittedDate: "2024-01-17",
              status: "active",
              studentUuid: "uuid-006",
            },
          ],
        },
      ],
    },
    {
      id: "2",
      name: "Riverside District",
      totalSchools: 10,
      totalStudents: 1980,
      activeStudents: 755,
      schools: [
        {
          id: "2-1",
          name: "Riverside Elementary",
          totalStudents: 520,
          activeStudents: 200,
          forms: [
            {
              id: "f7",
              studentName: "Alex Martinez",
              submittedDate: "2024-01-18",
              status: "active",
              studentUuid: "uuid-007",
            },
            {
              id: "f8",
              studentName: "Lisa Anderson",
              submittedDate: "2024-01-17",
              status: "pending",
              studentUuid: "uuid-008",
            },
          ],
        },
        {
          id: "2-2",
          name: "Riverside Middle School",
          totalStudents: 720,
          activeStudents: 280,
          forms: [
            {
              id: "f9",
              studentName: "Tom Wilson",
              submittedDate: "2024-01-16",
              status: "processed",
              studentUuid: "uuid-009",
            },
          ],
        },
        {
          id: "2-3",
          name: "Riverside High School",
          totalStudents: 740,
          activeStudents: 275,
          forms: [
            {
              id: "f10",
              studentName: "Olivia Taylor",
              submittedDate: "2024-01-15",
              status: "active",
              studentUuid: "uuid-010",
            },
          ],
        },
      ],
    },
    {
      id: "3",
      name: "Oakwood District",
      totalSchools: 8,
      totalStudents: 1650,
      activeStudents: 535,
      schools: [
        {
          id: "3-1",
          name: "Oakwood Elementary",
          totalStudents: 380,
          activeStudents: 150,
          forms: [
            {
              id: "f11",
              studentName: "James Lee",
              submittedDate: "2024-01-19",
              status: "active",
              studentUuid: "uuid-011",
            },
          ],
        },
        {
          id: "3-2",
          name: "Oakwood Middle School",
          totalStudents: 520,
          activeStudents: 200,
          forms: [
            {
              id: "f12",
              studentName: "Sophia Garcia",
              submittedDate: "2024-01-18",
              status: "pending",
              studentUuid: "uuid-012",
            },
          ],
        },
        {
          id: "3-3",
          name: "Oakwood High School",
          totalStudents: 750,
          activeStudents: 185,
          forms: [
            {
              id: "f13",
              studentName: "Noah Rodriguez",
              submittedDate: "2024-01-17",
              status: "processed",
              studentUuid: "uuid-013",
            },
          ],
        },
      ],
    },
    {
      id: "4",
      name: "Maple Valley District",
      totalSchools: 6,
      totalStudents: 980,
      activeStudents: 265,
      schools: [
        {
          id: "4-1",
          name: "Maple Valley Elementary",
          totalStudents: 320,
          activeStudents: 120,
          forms: [
            {
              id: "f14",
              studentName: "Ava Thompson",
              submittedDate: "2024-01-20",
              status: "active",
              studentUuid: "uuid-014",
            },
          ],
        },
        {
          id: "4-2",
          name: "Maple Valley Middle School",
          totalStudents: 380,
          activeStudents: 95,
          forms: [
            {
              id: "f15",
              studentName: "Lucas White",
              submittedDate: "2024-01-19",
              status: "pending",
              studentUuid: "uuid-015",
            },
          ],
        },
        {
          id: "4-3",
          name: "Maple Valley High School",
          totalStudents: 280,
          activeStudents: 50,
          forms: [
            {
              id: "f16",
              studentName: "Isabella Harris",
              submittedDate: "2024-01-18",
              status: "processed",
              studentUuid: "uuid-016",
            },
          ],
        },
      ],
    },
  ];

  const displayDistricts = districts || dummyDistricts;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-50 text-green-700 border-green-200";
      case "processed":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "pending":
        return "bg-orange-50 text-orange-700 border-orange-200";
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
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
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
                      <div className="flex items-center gap-5 flex-wrap">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100">
                          <School className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">
                            {district.totalSchools} Schools
                          </span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-100">
                          <Users className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-900">
                            {district.totalStudents.toLocaleString()} Students
                          </span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#294a4a]/10 border border-[#294a4a]/20">
                          <div className="h-2 w-2 rounded-full bg-[#294a4a]"></div>
                          <span className="text-sm font-medium text-[#294a4a]">
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
                                <div className="flex items-center gap-4 flex-wrap">
                                  <span className="text-sm text-gray-600 font-normal">
                                    {school.totalStudents} Students
                                  </span>
                                  <span className="text-sm font-medium text-[#375b59]">
                                    {school.activeStudents} Active
                                  </span>
                                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200">
                                    <FileText className="h-3.5 w-3.5 text-amber-600" />
                                    <span className="text-xs font-medium text-amber-900">
                                      {school.forms.length} Forms
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-5 pb-4">
                          <div className="ml-12 space-y-3 animate-in slide-in-from-top-2 duration-300">
                            {school.forms.length > 0 ? (
                              school.forms.map((form) => (
                                <div
                                  key={form.id}
                                  onClick={() => onFormClick?.(form)}
                                  className="group flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-white to-gray-50 border-2 border-gray-200 hover:border-[#294a4a] hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
                                >
                                  <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className="p-2.5 rounded-lg bg-gray-100 border border-gray-200 group-hover:bg-gray-200 group-hover:scale-110 transition-all duration-300">
                                      <FileText className="h-4 w-4 text-gray-700" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-semibold text-gray-900 mb-1.5">
                                        {form.studentName}
                                      </p>
                                      <div className="flex items-center gap-3 flex-wrap">
                                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-100">
                                          <Calendar className="h-3.5 w-3.5 text-gray-600" />
                                          <span className="text-xs font-normal text-gray-700">
                                            {formatDate(form.submittedDate)}
                                          </span>
                                        </div>
                                        <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-1 rounded-md">
                                          {form.studentUuid}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span
                                      className={cn(
                                        "px-3 py-1.5 rounded-lg text-xs font-medium border",
                                        getStatusColor(form.status)
                                      )}
                                    >
                                      {getStatusLabel(form.status)}
                                    </span>
                                    <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-[#294a4a] transition-colors duration-300">
                                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
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
      </CardContent>
    </Card>
  );
};

export default DistrictsList;

