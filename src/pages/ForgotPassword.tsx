import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, KeyRound, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);

    try {
      await authApi.forgotPassword({ email });
      
      toast.success('Password reset link sent to your email!');
      setEmailSent(true);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to send reset email. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-large p-8 border border-border text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-light rounded-full mb-4">
              <KeyRound className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Check Your Email</h1>
            <p className="text-muted-foreground mb-6">
              We've sent a password reset link to<br />
              <span className="font-medium text-foreground">{email}</span>
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Click the link in the email to reset your password. The link will expire in 1 hour.
            </p>
            <Link to="/login">
              <Button className="w-full h-11 bg-primary hover:bg-primary-hover text-primary-foreground font-medium">
                Back to Login
              </Button>
            </Link>
            <button
              onClick={() => setEmailSent(false)}
              className="text-sm text-primary hover:text-primary-hover font-medium mt-4 transition-colors"
            >
              Didn't receive the email? Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

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
              <KeyRound className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Forgot Password?</h1>
            <p className="text-muted-foreground">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Remember your password?{' '}
            <Link to="/login" className="text-primary hover:text-primary-hover font-medium transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
