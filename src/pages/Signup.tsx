import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { useSignup } from "@/hooks/useSignup";
import { validatePassword } from "@/services/authService";

const Signup = () => {
  const { signup, loading } = useSignup();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-large p-8 border border-border">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Create Account
            </h1>
            <p className="text-muted-foreground">Sign up to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="John Doe"
                value={formData.full_name}
                onChange={handleChange}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
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

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary hover:text-primary-hover font-medium transition-colors"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
