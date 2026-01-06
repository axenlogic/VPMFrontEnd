import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import { useEmailVerification } from "@/hooks/useEmailVerification";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const { verifyOtp, resendOtp, loading, resendLoading, email, fullName } =
    useEmailVerification();
  const [otp, setOtp] = useState("");

  if (!email) {
    navigate("/signup");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      return;
    }

    await verifyOtp(otp);
  };

  const handleResend = async () => {
    await resendOtp();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ backgroundColor: 'var(--brand-color)' }}>
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-large p-8 border border-border">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-light rounded-full mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Verify Your Email
            </h1>
            <p className="text-muted-foreground">
              Enter the 6-digit code sent to
              <br />
              <span className="font-medium text-foreground">{email}</span>
            </p>
            {fullName && (
              <p className="text-sm text-muted-foreground mt-2">
                Welcome, {fullName}!
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                name="otp"
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                required
                maxLength={6}
                className="h-11 text-center text-xl tracking-widest font-mono"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-primary hover:bg-primary-hover text-primary-foreground font-medium transition-all"
              disabled={loading || otp.length !== 6}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground mt-6 space-y-2">
            <p>
              Didn't receive the code?{" "}
              <button
                onClick={handleResend}
                disabled={resendLoading}
                className="text-primary hover:text-primary-hover font-medium transition-colors disabled:opacity-50"
              >
                {resendLoading ? "Sending..." : "Resend"}
              </button>
            </p>
            <button
              onClick={() => navigate("/signup")}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
