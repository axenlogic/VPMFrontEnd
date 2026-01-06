import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";
import { AdminService, IntakeDetails } from "@/services/adminService";
import { toast } from "sonner";
import { format } from "date-fns";

const IntakeProcessing = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [intake, setIntake] = useState<IntakeDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [simplepracticeId, setSimplepracticeId] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (id) {
      fetchIntakeDetails();
    }
  }, [id]);

  const fetchIntakeDetails = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await AdminService.getIntakeDetails(parseInt(id));
      setIntake(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch intake details");
      navigate("/admin/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessIntake = async () => {
    if (!id) return;
    setIsProcessing(true);
    try {
      await AdminService.processIntake(parseInt(id), {
        simplepractice_record_id: simplepracticeId || undefined,
        notes: notes || undefined,
      });
      toast.success("Intake processed successfully");
      setIsDialogOpen(false);
      navigate("/admin/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to process intake");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!intake) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* PHI Warning Banner */}
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>PHI Data - Restricted Access:</strong> This page contains Protected Health Information. 
          All access is logged for audit purposes.
        </AlertDescription>
      </Alert>

      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate("/admin/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to List
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Intake Processing</h1>
          <p className="text-muted-foreground">Review and process intake form</p>
        </div>
      </div>

      {/* Student Information */}
      <Card>
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm text-muted-foreground">Full Name</Label>
            <p className="font-semibold">{intake.student_information.full_name}</p>
          </div>
          {intake.student_information.student_id && (
            <div>
              <Label className="text-sm text-muted-foreground">Student ID</Label>
              <p className="font-semibold">{intake.student_information.student_id}</p>
            </div>
          )}
          <div>
            <Label className="text-sm text-muted-foreground">Date of Birth</Label>
            <p className="font-semibold">
              {format(new Date(intake.student_information.date_of_birth), "MMM dd, yyyy")}
            </p>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Grade Level</Label>
            <p className="font-semibold">{intake.student_information.grade_level}</p>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Student UUID</Label>
            <p className="font-mono text-sm">{intake.student_uuid}</p>
          </div>
        </CardContent>
      </Card>

      {/* Parent/Guardian Contact */}
      <Card>
        <CardHeader>
          <CardTitle>Parent/Guardian Contact</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm text-muted-foreground">Name</Label>
            <p className="font-semibold">{intake.parent_guardian_contact.name}</p>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Email</Label>
            <p className="font-semibold">{intake.parent_guardian_contact.email}</p>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Phone</Label>
            <p className="font-semibold">{intake.parent_guardian_contact.phone}</p>
          </div>
        </CardContent>
      </Card>

      {/* Service Request */}
      <Card>
        <CardHeader>
          <CardTitle>Service Request Type</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="outline">
            {intake.service_request_type === "start_now"
              ? "Needs to start services now"
              : "Opting in for future services"}
          </Badge>
        </CardContent>
      </Card>

      {/* Insurance Information */}
      <Card>
        <CardHeader>
          <CardTitle>Insurance Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground">Has Insurance</Label>
              <p className="font-semibold">
                {intake.insurance_information.has_insurance ? "Yes" : "No"}
              </p>
            </div>
            {intake.insurance_information.has_insurance && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Insurance Company</Label>
                  <p className="font-semibold">
                    {intake.insurance_information.insurance_company}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Policyholder Name</Label>
                  <p className="font-semibold">
                    {intake.insurance_information.policyholder_name}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Relationship to Student</Label>
                  <p className="font-semibold">
                    {intake.insurance_information.relationship_to_student}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Member ID</Label>
                  <p className="font-semibold">{intake.insurance_information.member_id}</p>
                </div>
                {intake.insurance_information.group_number && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Group Number</Label>
                    <p className="font-semibold">
                      {intake.insurance_information.group_number}
                    </p>
                  </div>
                )}
              </div>
            )}
            {(intake.insurance_information.insurance_card_front_url ||
              intake.insurance_information.insurance_card_back_url) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {intake.insurance_information.insurance_card_front_url && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Insurance Card (Front)</Label>
                    <img
                      src={intake.insurance_information.insurance_card_front_url}
                      alt="Insurance card front"
                      className="mt-2 border rounded-lg max-w-full"
                    />
                  </div>
                )}
                {intake.insurance_information.insurance_card_back_url && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Insurance Card (Back)</Label>
                    <img
                      src={intake.insurance_information.insurance_card_back_url}
                      alt="Insurance card back"
                      className="mt-2 border rounded-lg max-w-full"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Safety Concern */}
      {intake.immediate_safety_concern && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Immediate Safety Concern:</strong> This intake was flagged with an immediate
            safety concern.
          </AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark as Processed
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Process Intake</DialogTitle>
                <DialogDescription>
                  Mark this intake as processed and optionally add SimplePractice Record ID and notes.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="simplepractice_id">SimplePractice Record ID (Optional)</Label>
                  <Input
                    id="simplepractice_id"
                    value={simplepracticeId}
                    onChange={(e) => setSimplepracticeId(e.target.value)}
                    placeholder="Enter SimplePractice Record ID"
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes about this intake"
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleProcessIntake} disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Process Intake"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntakeProcessing;

