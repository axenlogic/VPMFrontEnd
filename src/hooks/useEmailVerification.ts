import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthService, VerifyOtpRequest } from '@/services/authService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useEmailVerification = () => {
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Get email from location state
  const email = location.state?.email;
  const fullName = location.state?.fullName;

  const verifyOtp = async (otp: string) => {
    if (!email) {
      toast.error('Email not found. Please sign up again.');
      navigate('/signup');
      return;
    }

    setLoading(true);
    
    try {
      const response = await AuthService.verifyOtp({ email, otp });
      
      // Show success message
      toast.success('Email verified successfully!');
      
      // Login user with the received token
      login(response.access_token, {
        email,
        full_name: response.full_name
      });
      
      return response;
    } catch (error: any) {
      // Handle specific error cases
      if (error.message.includes('expired')) {
        toast.error('OTP has expired. Please request a new one.');
      } else if (error.message.includes('Invalid OTP')) {
        toast.error('Invalid OTP. Please check and try again.');
      } else {
        toast.error(error.message || 'Verification failed. Please try again.');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (!email) {
      toast.error('Email not found. Please sign up again.');
      navigate('/signup');
      return;
    }

    setResendLoading(true);
    
    try {
      // Re-signup to get new OTP
      await AuthService.signup({ 
        full_name: fullName || 'User', 
        email, 
        password: 'temp' // This will be handled by backend
      });
      
      toast.success('New OTP sent to your email');
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return {
    verifyOtp,
    resendOtp,
    loading,
    resendLoading,
    email,
    fullName
  };
};
