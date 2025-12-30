import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService, SignupRequest } from '@/services/authService';
import { toast } from 'sonner';

export const useSignup = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const signup = async (data: SignupRequest) => {
    setLoading(true);
    
    try {
      const response = await AuthService.signup(data);
      
      // Show success message
      toast.success(response.message || 'OTP sent to your email for verification');
      
      // Navigate to verification page with email
      navigate('/verify-email', { 
        state: { 
          email: data.email,
          fullName: response.full_name || data.full_name
        } 
      });
      
      return response;
    } catch (error: any) {
      // Show error message
      toast.error(error.message || 'Signup failed. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    signup,
    loading
  };
};
