# API Integration Test Guide

## Login Flow Test

### 1. Login API Test

**Endpoint:** `POST /auth/login`
**Request:**

```json
{
  "email": "softengr61@gmail.com",
  "password": "987654321A"
}
```

**Expected Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "username": "softengr61@gmail.com",
  "full_name": "John Doe"
}
```

**Expected Behavior:**

1. ✅ API call succeeds (200 response)
2. ✅ Token stored in localStorage
3. ✅ User state updated with full_name
4. ✅ Automatic redirect to `/main`
5. ✅ Header shows "Welcome, John Doe"
6. ✅ Main page shows "Welcome back, John Doe!"

## Signup Flow Test

### 1. Signup API Test

**Endpoint:** `POST /auth/signup`
**Request:**

```json
{
  "full_name": "Jane Smith",
  "email": "jane@example.com",
  "password": "Password123"
}
```

**Expected Response:**

```json
{
  "message": "OTP sent to your email for verification",
  "username": "jane@example.com",
  "full_name": "Jane Smith"
}
```

**Expected Behavior:**

1. ✅ Password validation passes
2. ✅ API call succeeds
3. ✅ Redirect to verification page
4. ✅ Verification page shows "Welcome, Jane Smith!"

### 2. Email Verification Test

**Endpoint:** `POST /auth/verify-otp`
**Request:**

```json
{
  "email": "jane@example.com",
  "otp": "123456"
}
```

**Expected Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "username": "jane@example.com",
  "full_name": "Jane Smith"
}
```

**Expected Behavior:**

1. ✅ OTP verification succeeds
2. ✅ Auto-login with full_name
3. ✅ Redirect to `/main`
4. ✅ Header shows "Welcome, Jane Smith"

## User Interface Updates

### Main Page Header

- **Navigation Bar:** Shows "Welcome, [Full Name]" below "Virtual Peace of Mind"
- **Main Content:** Shows "Welcome back, [Full Name]!" with verified account badge
- **User Info:** Displays email and account status

### Login Page

- Uses `response.full_name` from API
- No more hardcoded "User" placeholder

### Signup/Verification Flow

- Passes `full_name` through navigation state
- Uses API response `full_name` when available

## Testing Steps

1. **Clear browser storage** (localStorage)
2. **Go to** `http://localhost:8080`
3. **Login with** `softengr61@gmail.com` / `987654321A`
4. **Verify** redirect to `/main` and name display
5. **Test signup flow** with new email
6. **Verify** full name appears throughout the flow
