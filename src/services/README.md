# API Services Documentation

## Overview

This directory contains centralized API services for the Virtual Peace of Mind application, providing clean separation of concerns and consistent error handling.

## Files

### `authService.ts`

Centralized authentication service with the following features:

#### Password Validation

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 digit
- Real-time validation feedback

#### API Methods

- `signup(data: SignupRequest)` - User registration
- `verifyOtp(data: VerifyOtpRequest)` - Email verification
- `login(email: string, password: string)` - User login
- `forgotPassword(email: string)` - Password reset request
- `resetPassword(token: string, newPassword: string)` - Password reset

#### Error Handling

- Centralized error processing
- User-friendly error messages
- Network error handling
- API response validation

## Custom Hooks

### `useSignup.ts`

Manages signup flow with:

- Loading states
- Form validation
- Success/error handling
- Navigation management

### `useEmailVerification.ts`

Manages email verification with:

- OTP verification
- Resend functionality
- Loading states
- Error handling

## API Endpoints

### Signup

```
POST /auth/signup
Request: { full_name, email, password }
Response: { message: "OTP sent to your email for verification" }
```

### Email Verification

```
POST /auth/verify-otp
Request: { email, otp }
Response: { access_token, token_type }
```

## Usage Example

```typescript
import { AuthService } from "@/services/authService";
import { useSignup } from "@/hooks/useSignup";

// In component
const { signup, loading } = useSignup();

const handleSignup = async (formData) => {
  await signup(formData);
};
```

## Error Handling

All services include comprehensive error handling:

- Validation errors
- API errors
- Network errors
- User-friendly messages
