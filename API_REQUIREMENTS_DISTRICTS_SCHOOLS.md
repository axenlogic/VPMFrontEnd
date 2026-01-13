# API Requirements: Districts & Schools Overview

**Version:** 1.0  
**Date:** January 2025  
**Component:** Districts & Schools Overview (Dashboard)  
**Status:** Ready for Backend Implementation

---

## 📋 Overview

This document specifies the API requirements for the **Districts & Schools Overview** section on the dashboard. This section displays a hierarchical view of:
- **Districts** → **Schools** → **Intake Forms**

The API should support role-based data scoping (district users see only their district) and provide filtering/pagination capabilities.

---

## 🔐 Authentication & Authorization

### Authentication
- **Required:** Yes (JWT Bearer Token)
- **Header:** `Authorization: Bearer <token>`

### Role-Based Access Control
- **VPM Admin:** Can view all districts, schools, and forms
- **District Admin:** Can view only their assigned district and associated schools/forms
- **District Viewer:** Same as District Admin (read-only)

### Data Scoping
- Backend should automatically filter data based on user's `district_id` (if not VPM Admin)
- No PHI (Personally Identifiable Information) should be exposed in this endpoint
- Only aggregated counts and non-identifiable data (student UUID, status, dates)

---

## 📡 API Endpoint

### Endpoint Details

```
GET /api/v1/dashboard/districts-schools
```

**Base URL:**
- Development: `http://localhost:8000`
- Production: `/api` (proxied via Nginx)

**Full URL Examples:**
- Dev: `http://localhost:8000/api/v1/dashboard/districts-schools?page=1&limit=10`
- Prod: `/api/v1/dashboard/districts-schools?page=1&limit=10`

---

## 📤 Request Payload

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | `1` | Page number for pagination |
| `limit` | integer | No | `50` | Number of districts per page (max: 100) |
| `district_id` | integer | No | `null` | Filter by specific district ID (VPM Admin only) |
| `school_id` | integer | No | `null` | Filter by specific school ID |
| `status` | string | No | `null` | Filter forms by status: `"pending"`, `"processed"`, `"active"` |
| `date_from` | string (ISO 8601) | No | `null` | Filter forms submitted from this date (YYYY-MM-DD) |
| `date_to` | string (ISO 8601) | No | `null` | Filter forms submitted to this date (YYYY-MM-DD) |
| `include_forms` | boolean | No | `true` | Whether to include intake forms in response |
| `forms_limit` | integer | No | `50` | Maximum number of forms per school (max: 200) |
| `sort_by` | string | No | `"name"` | Sort districts by: `"name"`, `"total_students"`, `"active_students"`, `"total_schools"` |
| `sort_order` | string | No | `"asc"` | Sort order: `"asc"` or `"desc"` |

### Example Request

```http
GET /api/v1/dashboard/districts-schools?page=1&limit=10&status=active&include_forms=true&forms_limit=50&sort_by=name&sort_order=asc
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Request Headers

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
Accept: application/json
```

---

## 📥 Response Structure

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "districts": [
      {
        "id": "1",
        "name": "Springfield District",
        "total_schools": 12,
        "total_students": 2450,
        "active_students": 890,
        "schools": [
          {
            "id": "1-1",
            "name": "Springfield Elementary",
            "total_students": 450,
            "active_students": 180,
            "forms": [
              {
                "id": "f1",
                "student_name": "John Doe",
                "submitted_date": "2024-01-15T10:30:00Z",
                "status": "active",
                "student_uuid": "550e8400-e29b-41d4-a716-446655440000"
              },
              {
                "id": "f2",
                "student_name": "Jane Smith",
                "submitted_date": "2024-01-14T14:20:00Z",
                "status": "processed",
                "student_uuid": "550e8400-e29b-41d4-a716-446655440001"
              },
              {
                "id": "f3",
                "student_name": "Mike Johnson",
                "submitted_date": "2024-01-13T09:15:00Z",
                "status": "pending",
                "student_uuid": "550e8400-e29b-41d4-a716-446655440002"
              }
            ]
          },
          {
            "id": "1-2",
            "name": "Springfield Middle School",
            "total_students": 680,
            "active_students": 250,
            "forms": [
              {
                "id": "f4",
                "student_name": "Sarah Williams",
                "submitted_date": "2024-01-16T11:45:00Z",
                "status": "active",
                "student_uuid": "550e8400-e29b-41d4-a716-446655440003"
              }
            ]
          }
        ]
      },
      {
        "id": "2",
        "name": "Riverside District",
        "total_schools": 10,
        "total_students": 1980,
        "active_students": 755,
        "schools": [
          {
            "id": "2-1",
            "name": "Riverside Elementary",
            "total_students": 520,
            "active_students": 200,
            "forms": []
          }
        ]
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_districts": 25,
      "per_page": 10,
      "has_next": true,
      "has_previous": false
    },
    "summary": {
      "total_districts": 25,
      "total_schools": 180,
      "total_students": 12500,
      "total_active_students": 4500,
      "total_forms": 3200
    }
  }
}
```

### Response Field Descriptions

#### District Object
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique district identifier |
| `name` | string | District name |
| `total_schools` | integer | Total number of schools in the district |
| `total_students` | integer | Total number of students in the district |
| `active_students` | integer | Number of active students (status = "active") |
| `schools` | array | List of schools in the district |

#### School Object
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique school identifier |
| `name` | string | School name |
| `total_students` | integer | Total number of students in the school |
| `active_students` | integer | Number of active students in the school |
| `forms` | array | List of intake forms (if `include_forms=true`) |

#### Intake Form Object
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique form identifier (can be same as `student_uuid` or separate ID) |
| `student_name` | string | Student's full name (first + last name) |
| `submitted_date` | string (ISO 8601) | Form submission date/time |
| `status` | string | Form status: `"pending"`, `"processed"`, or `"active"` |
| `student_uuid` | string (UUID) | Unique student identifier from form submission |

#### Pagination Object
| Field | Type | Description |
|-------|------|-------------|
| `current_page` | integer | Current page number |
| `total_pages` | integer | Total number of pages |
| `total_districts` | integer | Total number of districts (after filtering) |
| `per_page` | integer | Number of districts per page |
| `has_next` | boolean | Whether there is a next page |
| `has_previous` | boolean | Whether there is a previous page |

#### Summary Object
| Field | Type | Description |
|-------|------|-------------|
| `total_districts` | integer | Total districts in response (after filtering) |
| `total_schools` | integer | Total schools across all districts |
| `total_students` | integer | Total students across all districts |
| `total_active_students` | integer | Total active students across all districts |
| `total_forms` | integer | Total intake forms across all districts |

---

## ❌ Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required. Please provide a valid JWT token.",
    "detail": "Token is missing or invalid"
  }
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to access this resource.",
    "detail": "User does not have access to requested district"
  }
}
```

### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "detail": {
      "page": ["Page number must be a positive integer"],
      "limit": ["Limit must be between 1 and 100"]
    }
  }
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "District or school not found",
    "detail": "District with ID '999' does not exist or you do not have access to it"
  }
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An internal server error occurred",
    "detail": "Database connection failed"
  }
}
```

---

## 🔍 Filtering & Sorting Logic

### Status Filter
- **Values:** `"pending"`, `"processed"`, `"active"`
- **Behavior:** Filters intake forms by status. If `status` is provided, only forms matching that status are returned.
- **Note:** If a school has no forms matching the status filter, the school should still be included in the response, but with an empty `forms` array.

### Date Range Filter
- **Format:** ISO 8601 date strings (YYYY-MM-DD)
- **Behavior:** Filters forms by `submitted_date` within the specified range (inclusive)
- **Example:** `date_from=2024-01-01&date_to=2024-01-31` returns forms submitted in January 2024

### District/School Filter
- **`district_id`:** Only available to VPM Admin. Filters to show only the specified district.
- **`school_id`:** Filters to show only the specified school (must be within user's accessible districts).

### Sorting
- **`sort_by`:** Determines the order of districts in the response
- **`sort_order`:** `"asc"` for ascending, `"desc"` for descending
- **Default:** Sort by district name (ascending)

---

## 📊 Data Aggregation Rules

### Student Counts
- **`total_students`:** Count of all unique students who have submitted intake forms
- **`active_students`:** Count of students with status = `"active"`

### School Counts
- **`total_schools`:** Count of unique schools that have at least one intake form

### Form Counts
- Forms are counted at the school level
- Each form represents one student submission
- Forms are filtered based on query parameters (status, date range)

---

## 🚀 Performance Considerations

### Pagination
- Default limit: 50 districts per page
- Maximum limit: 100 districts per page
- Forms are limited per school (default: 50, max: 200)

### Caching Recommendations
- Consider caching district/school metadata (names, IDs) for 5-10 minutes
- Form data should be fresh (no caching or short TTL: 1-2 minutes)
- Cache invalidation on form submission/status change

### Database Optimization
- Use database indexes on:
  - `district_id`
  - `school_id`
  - `submitted_date`
  - `status`
- Consider materialized views for aggregated counts if performance is an issue

---

## 🔄 Frontend Integration Notes

### TypeScript Interfaces (Already Defined)

The frontend expects the following TypeScript interfaces:

```typescript
export interface IntakeForm {
  id: string;
  studentName: string;
  submittedDate: string; // ISO 8601 format
  status: "pending" | "processed" | "active";
  studentUuid: string;
}

export interface School {
  id: string;
  name: string;
  totalStudents: number;
  activeStudents: number;
  forms: IntakeForm[];
}

export interface District {
  id: string;
  name: string;
  totalSchools: number;
  totalStudents: number;
  activeStudents: number;
  schools: School[];
}
```

### Response Mapping

The backend response should map to these interfaces as follows:

- `district.id` → `District.id`
- `district.name` → `District.name`
- `district.total_schools` → `District.totalSchools`
- `district.total_students` → `District.totalStudents`
- `district.active_students` → `District.activeStudents`
- `school.id` → `School.id`
- `school.name` → `School.name`
- `school.total_students` → `School.totalStudents`
- `school.active_students` → `School.activeStudents`
- `form.id` → `IntakeForm.id`
- `form.student_name` → `IntakeForm.studentName`
- `form.submitted_date` → `IntakeForm.submittedDate`
- `form.status` → `IntakeForm.status`
- `form.student_uuid` → `IntakeForm.studentUuid`

---

## ✅ Testing Checklist

### Functional Tests
- [ ] VPM Admin can view all districts
- [ ] District Admin can view only their district
- [ ] District Viewer can view only their district
- [ ] Pagination works correctly
- [ ] Status filter works for all three statuses
- [ ] Date range filter works correctly
- [ ] Sorting works for all sort options
- [ ] Empty results are handled gracefully
- [ ] Forms are limited per school correctly

### Security Tests
- [ ] Unauthenticated requests return 401
- [ ] District users cannot access other districts
- [ ] No PHI is exposed (only student name, UUID, dates, status)
- [ ] SQL injection attempts are blocked
- [ ] XSS attempts are sanitized

### Performance Tests
- [ ] Response time < 500ms for 50 districts
- [ ] Response time < 1s for 100 districts
- [ ] Database queries are optimized (no N+1 queries)
- [ ] Pagination reduces memory usage

---

## 📝 Implementation Notes

### Database Schema Considerations

The backend should join the following tables:
- `districts` (id, name)
- `schools` (id, name, district_id)
- `intake_forms` (id, student_uuid, student_name, submitted_date, status, school_id)
- `users` (id, district_id, role) - for access control

### Status Values
- **`"pending"`:** Form submitted but not yet processed (displayed as "Opt-ins" in UI)
- **`"processed"`:** Form has been processed (displayed as "Completed" in UI)
- **`"active"`:** Student is actively receiving services (displayed as "Active" in UI)

### Date Format
- All dates should be returned in ISO 8601 format: `YYYY-MM-DDTHH:mm:ssZ`
- Example: `"2024-01-15T10:30:00Z"`

---

## 🔗 Related Endpoints

This endpoint is part of the dashboard API suite:
- `GET /api/v1/dashboard/summary` - Dashboard summary cards
- `GET /api/v1/dashboard/trends` - Trend data for charts
- `GET /api/v1/dashboard/district-breakdown` - District breakdown for donut chart
- `GET /api/v1/dashboard/school-breakdown` - School breakdown data
- `GET /api/v1/dashboard/districts-schools` - **This endpoint**

---

## 📞 Support

For questions or clarifications regarding this API specification, please contact the frontend development team.

**Document Status:** ✅ Ready for Backend Implementation  
**Last Updated:** January 2025

