import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { useSignup } from "@/hooks/useSignup";
import { validatePassword } from "@/services/authService";

const Signup = () => {
  const navigate = useNavigate();
  const { signup, loading } = useSignup();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    isValid: false,
    errors: [] as string[],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Validate password in real-time
    if (name === "password") {
      const validation = validatePassword(value);
      setPasswordValidation(validation);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Final password validation
    const validation = validatePassword(formData.password);
    if (!validation.isValid) {
      return;
    }

    await signup(formData);
  };

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: 'var(--brand-color)' }}>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-6">
        {/* Logo on Left */}
        <div className="flex items-center gap-3">
          <img 
            src="/vpm-logo.png" 
            alt="VPM Logo" 
            className="h-10 w-auto object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>

        {/* Log In Button on Right */}
        <Button
          onClick={() => navigate("/login")}
          variant="default"
          className="px-6"
        >
          Log In
        </Button>
      </div>

      {/* Main Content - Centered */}
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-large p-8 border border-border">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Create Account
              </h1>
              <p className="text-muted-foreground">Sign up to get started</p>
            </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="Enter Your Full Name"
                value={formData.full_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter Your Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Your Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Password validation feedback */}
              {formData.password && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <div
                      className={`flex items-center gap-1 ${
                        formData.password.length >= 8
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {formData.password.length >= 8 ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      <span>At least 8 characters</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div
                      className={`flex items-center gap-1 ${
                        /[A-Z]/.test(formData.password)
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {/[A-Z]/.test(formData.password) ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      <span>At least 1 uppercase letter</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div
                      className={`flex items-center gap-1 ${
                        /\d/.test(formData.password)
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {/\d/.test(formData.password) ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      <span>At least 1 digit</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-primary hover:bg-primary-hover text-primary-foreground font-medium transition-all"
              disabled={
                loading ||
                !passwordValidation.isValid ||
                !formData.full_name ||
                !formData.email
              }
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>
          </div>
        </div>
      </div>

      {/* Need Help Link - Bottom Right */}
      <div className="absolute bottom-6 right-6">
        <button
          onClick={() => setShowHelpDialog(true)}
          className="text-primary hover:text-primary-hover font-medium transition-colors"
        >
          Need Help?
        </button>
      </div>

      {/* Help Dialog */}
      <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Contact Support</DialogTitle>
            <DialogDescription>
              If you have any questions, please call Virtual Peace of Mind support at{" "}
              <a 
                href="tel:8007642935" 
                className="text-primary hover:text-primary-hover font-semibold"
              >
                (800) 764-2935
              </a>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowHelpDialog(false)}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Signup;
