import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Lock, ArrowLeft } from 'lucide-react';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  // Get token from URL query params (e.g., /reset-password?token=abc123)
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      toast.error('Invalid or missing reset token');
      navigate('/forgot-password');
    }
  }, [token, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (!token) {
      toast.error('Invalid reset token');
      return;
    }

    setLoading(true);

    try {
      await authApi.resetPassword({
        token,
        new_password: formData.password,
      });

      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to reset password. The link may have expired.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-large p-8 border border-border">
          <div className="mb-6">
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Login
            </Link>
          </div>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-light rounded-full mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Reset Password</h1>
            <p className="text-muted-foreground">
              Enter your new password below
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={8}
                className="h-11"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-primary hover:bg-primary-hover text-primary-foreground font-medium transition-all"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-accent/50 rounded-xl border border-border">
            <p className="text-xs text-muted-foreground text-center">
              🔒 Your password is encrypted and stored securely
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
