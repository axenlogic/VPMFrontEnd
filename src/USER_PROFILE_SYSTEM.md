# User Profile System Documentation

## Overview

A comprehensive user profile management system with JWT authentication, centralized services, and React context management following senior developer best practices.

## Architecture

### 1. Type Definitions (`src/types/user.ts`)

```typescript
interface UserProfile {
  id: number;
  full_name: string;
  email: string;
  is_verified: boolean;
}
```

### 2. Centralized Service (`src/services/userService.ts`)

- **JWT Authentication**: Automatically includes Bearer token in requests
- **Error Handling**: Comprehensive error handling for all API responses
- **Type Safety**: Full TypeScript support with proper interfaces
- **Utility Methods**: Helper functions for profile validation and display

### 3. React Context (`src/contexts/UserContext.tsx`)

- **State Management**: Centralized profile state management
- **Auto-fetch**: Automatically fetches profile on authentication
- **Auto-refresh**: Refreshes profile every 5 minutes
- **Error Handling**: Global error state management

### 4. Custom Hook (`src/hooks/useUserProfile.ts`)

- **Convenient API**: Easy-to-use methods for profile operations
- **Optimistic Updates**: Immediate UI updates with rollback on error
- **Toast Notifications**: User feedback for all operations

## API Integration

### User Profile Endpoint

```
GET /auth/user/profile
Authorization: Bearer <jwt_token>
```

### Response Format

```json
{
  "id": 1,
  "full_name": "John Doe",
  "email": "johndoe@example.com",
  "is_verified": true
}
```

### Error Handling

- **401 Unauthorized**: Invalid or expired token
- **404 Not Found**: User profile not found
- **Network Errors**: Connection issues

## Features

### 1. Real-time Profile Display

- **Header**: Shows user's full name in navigation
- **Main Content**: Displays complete profile information
- **Status Indicators**: Verification status and user ID

### 2. Loading States

- **Initial Load**: Spinner while fetching profile
- **Refresh**: Loading indicator during profile refresh
- **Error States**: Clear error messages with retry options

### 3. Auto-refresh

- **Background Updates**: Refreshes profile every 5 minutes
- **Manual Refresh**: Refresh button in navigation
- **Smart Updates**: Only updates when authenticated

### 4. Error Recovery

- **Retry Mechanism**: Easy retry for failed requests
- **Graceful Degradation**: Fallback to basic auth data
- **User Feedback**: Clear error messages and actions

## Usage Examples

### Basic Usage

```typescript
import { useUserProfile } from "@/hooks/useUserProfile";

const MyComponent = () => {
  const { profile, isLoading, getDisplayName } = useUserProfile();

  return (
    <div>{isLoading ? "Loading..." : `Welcome, ${getDisplayName()}!`}</div>
  );
};
```

### Profile Management

```typescript
const { updateUserProfile, refreshProfile } = useUserProfile();

// Update profile
await updateUserProfile({ full_name: "New Name" });

// Refresh profile
await refreshProfile();
```

### Service Usage

```typescript
import { UserService } from "@/services/userService";

// Get profile
const profile = await UserService.getUserProfile();

// Update profile
const updated = await UserService.updateUserProfile({ full_name: "New Name" });
```

## Security Features

### 1. JWT Authentication

- **Automatic Headers**: JWT token automatically included in requests
- **Token Validation**: Proper error handling for invalid tokens
- **Secure Storage**: Tokens stored securely in localStorage

### 2. Error Handling

- **Authentication Errors**: Clear messages for auth failures
- **Network Errors**: Graceful handling of connection issues
- **Data Validation**: Proper validation of API responses

### 3. State Management

- **Secure Updates**: Only authenticated users can update profiles
- **Data Integrity**: Validation of profile data before updates
- **Error Recovery**: Automatic cleanup on authentication errors

## Performance Optimizations

### 1. Caching

- **Profile Caching**: Profile data cached in context
- **Smart Updates**: Only fetch when necessary
- **Background Refresh**: Non-blocking profile updates

### 2. Loading States

- **Optimistic Updates**: Immediate UI feedback
- **Loading Indicators**: Clear loading states
- **Error Boundaries**: Graceful error handling

### 3. Memory Management

- **Cleanup**: Proper cleanup on component unmount
- **Interval Management**: Automatic cleanup of refresh intervals
- **State Reset**: Clear state on logout

## Testing

### Manual Testing

1. **Login** to the application
2. **Verify** profile loads automatically
3. **Check** header shows correct name
4. **Test** refresh functionality
5. **Verify** error handling

### API Testing

```bash
# Test profile endpoint
curl -H "Authorization: Bearer <token>" \
     http://localhost:8000/auth/user/profile
```

## Files Structure

```
src/
├── types/user.ts              # Type definitions
├── services/userService.ts    # API service
├── contexts/UserContext.tsx   # React context
├── hooks/useUserProfile.ts    # Custom hook
└── pages/Main.tsx            # Updated main page
```

## Benefits

### 1. Developer Experience

- **Type Safety**: Full TypeScript support
- **Easy to Use**: Simple hook-based API
- **Well Documented**: Comprehensive documentation
- **Error Handling**: Built-in error management

### 2. User Experience

- **Real-time Updates**: Live profile information
- **Loading States**: Clear feedback during operations
- **Error Recovery**: Easy retry mechanisms
- **Performance**: Optimized for speed

### 3. Maintainability

- **Centralized Logic**: All profile logic in one place
- **Reusable Components**: Easy to reuse across app
- **Clean Architecture**: Separation of concerns
- **Testable**: Easy to unit test

This system provides a robust, scalable, and maintainable solution for user profile management with proper JWT authentication and excellent developer experience.
