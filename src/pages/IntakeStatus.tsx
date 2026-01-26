import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle, Search, Loader2, Copy, Check, Calendar, FileText, Sparkles } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { checkIntakeStatus, clearStatusState } from "@/store/slices/intakeSlice";
import { toast } from "sonner";

const IntakeStatus = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialUuid = searchParams.get("uuid") || "";
  const externalToken =
    searchParams.get("token") ||
    searchParams.get("externalToken") ||
    searchParams.get("extToken") ||
    "";
  const [studentUuid, setStudentUuid] = useState(initialUuid);
  const [copied, setCopied] = useState(false);
  const [hasAutoChecked, setHasAutoChecked] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Redux state
  const { isCheckingStatus, statusCheckError, statusData } = useAppSelector(
    (state) => state.intake
  );
  
  // Auto-check status if UUID is provided in URL (only once)
  useEffect(() => {
    if (initialUuid && !statusData && !hasAutoChecked) {
      dispatch(checkIntakeStatus({ studentUuid: initialUuid, accessToken: externalToken || undefined }));
      setHasAutoChecked(true);
    }
  }, [initialUuid, dispatch, statusData, hasAutoChecked, externalToken]);

  // Clear status state when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearStatusState());
    };
  }, [dispatch]);

  // Handle status check errors
  useEffect(() => {
    if (statusCheckError) {
      toast.error(statusCheckError);
    }
  }, [statusCheckError]);

  // Handle successful status check
  useEffect(() => {
    if (statusData && !isCheckingStatus) {
      toast.success("Status retrieved successfully");
    }
  }, [statusData, isCheckingStatus]);

  const handleCheckStatus = async () => {
    if (!studentUuid.trim()) {
      toast.error("Please enter a Student UUID");
      return;
    }

    // Clear previous status
    dispatch(clearStatusState());

    // Check status using Redux thunk
    await dispatch(checkIntakeStatus({ studentUuid: studentUuid.trim(), accessToken: externalToken || undefined }));
  };

  // Copy UUID to clipboard
  const handleCopyUuid = async (uuid: string) => {
    try {
      await navigator.clipboard.writeText(uuid);
      setCopied(true);
      toast.success("UUID copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy UUID");
    }
  };

  const getStatusConfig = (statusType: string) => {
    switch (statusType) {
      case "active":
        return {
          icon: CheckCircle2,
          label: "Active",
          color: "bg-green-50 text-green-600 border-green-100",
          iconColor: "text-green-500",
          badgeColor: "bg-green-400",
          badgeTextColor: "text-green-700",
        };
      case "processed":
        return {
          icon: CheckCircle2,
          label: "Completed",
          color: "bg-blue-50 text-blue-600 border-blue-100",
          iconColor: "text-blue-500",
          badgeColor: "bg-blue-400",
          badgeTextColor: "text-blue-700",
        };
      case "pending":
        return {
          icon: Clock,
          label: "Pending",
          color: "bg-yellow-50 text-yellow-600 border-yellow-100",
          iconColor: "text-yellow-500",
          badgeColor: "bg-yellow-400",
          badgeTextColor: "text-yellow-700",
        };
      default:
        return {
          icon: XCircle,
          label: "Unknown",
          color: "bg-gray-50 text-gray-600 border-gray-100",
          iconColor: "text-gray-500",
          badgeColor: "bg-gray-400",
          badgeTextColor: "text-gray-700",
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", { 
        year: "numeric", 
        month: "long", 
        day: "numeric" 
      }),
      time: date.toLocaleTimeString("en-US", { 
        hour: "2-digit", 
        minute: "2-digit" 
      }),
    };
  };

  const statusConfig = statusData ? getStatusConfig(statusData.status) : null;
  const submittedDate = statusData ? formatDate(statusData.submitted_date) : null;
  const processedDate = statusData?.processed_date ? formatDate(statusData.processed_date) : null;

  return (
    <div className="min-h-screen py-12 px-4 flex items-center justify-center" style={{ backgroundColor: 'var(--brand-color)' }}>
      <div className="max-w-3xl w-full mx-auto">
        <Card className="shadow-2xl border-0 overflow-hidden">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#294a4a] rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl md:text-3xl">Check Intake Status</CardTitle>
                <CardDescription className="text-base mt-1">
                  Enter your Student UUID to check the status of your intake form submission
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Search Section */}
            <div className="space-y-3">
              <Label htmlFor="student_uuid" className="text-base font-semibold text-gray-700">
                Student UUID
              </Label>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    id="student_uuid"
                    value={studentUuid}
                    onChange={(e) => setStudentUuid(e.target.value)}
                    placeholder="Enter or paste your Student UUID here"
                    className="h-12 text-base pr-12"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleCheckStatus();
                      }
                    }}
                  />
                  {studentUuid && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => setStudentUuid("")}
                    >
                      <XCircle className="w-4 h-4 text-gray-400" />
                    </Button>
                  )}
                </div>
                <Button
                  onClick={handleCheckStatus}
                  disabled={isCheckingStatus || !studentUuid.trim()}
                  className="h-12 px-6 bg-[#294a4a] hover:bg-[#375b59] text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isCheckingStatus ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      Check Status
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Error Alert */}
            {statusCheckError && (
              <Alert variant="destructive" className="animate-fade-in-up border-red-300">
                <XCircle className="h-5 w-5" />
                <AlertDescription className="font-medium">{statusCheckError}</AlertDescription>
              </Alert>
            )}

            {/* Status Display */}
            {statusData && statusConfig && (
              <div className="space-y-6 animate-fade-in-up">
                {/* Status Badge with Animation */}
                <div className={`relative flex items-center gap-4 p-5 rounded-xl border ${statusConfig.color} animate-fade-in-up overflow-hidden`}>
                  {/* Animated Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer`}></div>
                  
                  {/* Floating Icon Animation */}
                  <div className="relative z-10">
                    <div className={`absolute inset-0 ${statusConfig.badgeColor} rounded-full opacity-10 animate-pulse`}></div>
                    <div className="relative animate-float">
                      <statusConfig.icon className={`w-8 h-8 ${statusConfig.iconColor}`} />
                    </div>
                  </div>
                  
                  <div className="flex-1 relative z-10">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-base font-medium text-gray-700">Status:</span>
                      <Badge 
                        variant="outline" 
                        className={`text-sm px-3 py-1 font-medium border ${statusConfig.badgeTextColor} ${statusConfig.color.split(' ')[0]} animate-badge-pulse`}
                      >
                        {statusConfig.label}
                      </Badge>
                    </div>
                    <p className="text-sm mt-2 text-gray-600 font-normal">
                      {statusData.status === "pending" && "Your form is being reviewed by our team"}
                      {statusData.status === "processed" && "Your form has been processed successfully"}
                      {statusData.status === "active" && "Your student is now active in the system"}
                    </p>
                  </div>
                  
                  {/* Decorative Sparkles for Pending Status */}
                  {statusData.status === "pending" && (
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Sparkles className="w-3 h-3 text-yellow-400 animate-pulse" style={{ animationDelay: '0s' }} />
                      <Sparkles className="w-3 h-3 text-yellow-400 animate-pulse" style={{ animationDelay: '0.3s' }} />
                      <Sparkles className="w-3 h-3 text-yellow-400 animate-pulse" style={{ animationDelay: '0.6s' }} />
                    </div>
                  )}
                </div>

                {/* Information Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Student UUID Card */}
                  <Card className="border-2 hover:border-[#294a4a] transition-all duration-300 hover:shadow-lg">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-[#294a4a]/10 rounded-lg">
                            <FileText className="w-4 h-4 text-[#294a4a]" />
                          </div>
                          <Label className="text-sm font-semibold text-gray-600">Student UUID</Label>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-[#294a4a] hover:text-white"
                          onClick={() => handleCopyUuid(statusData.student_uuid)}
                          title={copied ? "Copied!" : "Copy UUID"}
                        >
                          {copied ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-500" />
                          )}
                        </Button>
                      </div>
                      <p className="font-mono text-sm text-gray-800 break-all bg-gray-50 p-3 rounded-lg">
                        {statusData.student_uuid}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Submitted Date Card */}
                  <Card className="border-2 hover:border-[#294a4a] transition-all duration-300 hover:shadow-lg">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-2 bg-[#294a4a]/10 rounded-lg">
                          <Calendar className="w-4 h-4 text-[#294a4a]" />
                        </div>
                        <Label className="text-sm font-semibold text-gray-600">Submitted Date</Label>
                      </div>
                      {submittedDate && (
                        <div className="space-y-1">
                          <p className="text-base font-semibold text-gray-800">{submittedDate.date}</p>
                          <p className="text-sm text-gray-500">{submittedDate.time}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Processed Date Card */}
                  {processedDate && (
                    <Card className="border-2 hover:border-[#294a4a] transition-all duration-300 hover:shadow-lg md:col-span-2">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          </div>
                          <Label className="text-sm font-semibold text-gray-600">Processed Date</Label>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="space-y-1">
                            <p className="text-base font-semibold text-gray-800">{processedDate.date}</p>
                            <p className="text-sm text-gray-500">{processedDate.time}</p>
                          </div>
                          <div className="flex items-center gap-2 ml-auto">
                            <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                            <span className="text-sm text-gray-600">Processing completed</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Action Button */}
                <div className="pt-2">
                  <Button
                    onClick={() => {
                      // Clear UUID input
                      setStudentUuid("");
                      // Clear Redux state
                      dispatch(clearStatusState());
                      // Clear URL parameter
                      setSearchParams({});
                      // Reset auto-check flag
                      setHasAutoChecked(false);
                      // Focus on input field
                      setTimeout(() => {
                        inputRef.current?.focus();
                      }, 100);
                    }}
                    variant="outline"
                    className="w-full border-2 border-[#294a4a] text-[#294a4a] hover:bg-[#294a4a] hover:text-white h-11 text-base font-medium transition-all duration-300"
                  >
                    Check Another Status
                  </Button>
                </div>
              </div>
            )}

            {/* Empty State / Instructions */}
            {!statusData && !isCheckingStatus && !statusCheckError && (
              <div className="text-center py-8 space-y-4 animate-fade-in">
                <div className="flex justify-center">
                  <div className="p-4 bg-gray-100 rounded-full">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Enter a Student UUID above to check status</p>
                  <p className="text-sm text-gray-500 mt-2">
                    You can find your UUID in the confirmation message after form submission
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IntakeStatus;

