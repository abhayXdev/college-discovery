# 🎓 College Discovery Platform - API Documentation

This document provides a comprehensive guide to the backend architecture and available endpoints for the College Discovery Platform.

## 🏗️ Backend Architecture

- **Framework:** Next.js 15+ (App Router)
- **Database:** PostgreSQL via Prisma ORM
- **Pattern:** Service Layer Architecture (Decouples business logic from HTTP transport)
- **Standardization:** Global Higher-Order Function (HOF) wrapper for consistent API responses.

---

## 📡 Standardized Response Format

All API responses follow a unified "Envelope" format to ensure a predictable developer experience for frontend consumers.

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "meta": { "total": 100, "page": 1, "limit": 10 } // Optional metadata
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Human-readable error message",
    "code": "ErrorClassName (e.g., BadRequestError)"
  }
}
```

---

## 🚀 Endpoints

### 1. Search & Filter Colleges
`GET /api/colleges`

Fetches a paginated list of colleges with optional filtering and advanced sorting.

**Query Parameters:**
| Parameter | Type | Description |
| :--- | :--- | :--- |
| `search` | `string` | Partial match on college name (case-insensitive). |
| `city` | `string` | Filter by exact city match. |
| `state` | `string` | Filter by exact state match. |
| `minFees` | `number` | Minimum annual tuition fees. |
| `maxFees` | `number` | Maximum annual tuition fees. |
| `sortBy` | `string` | Field to sort by: `fees`, `rank`, or `score`. Default: `rank`. |
| `sortOrder` | `string` | `asc` or `desc`. Default: `asc`. |
| `page` | `number` | Page number for pagination. Default: `1`. |
| `limit` | `number` | Number of items per page. Default: `10`. |

---

### 2. College Detail
`GET /api/colleges/[id]`

Fetches detailed information about a specific college, including its courses.

**Path Parameters:**
- `id`: The unique CUID of the college.

---

### 3. Compare Colleges
`GET /api/colleges/compare`

Fetches side-by-side data for multiple colleges.

**Query Parameters:**
- `ids`: Comma-separated list of college IDs (Max 5).

---

### 4. Admission Predictor
`GET /api/predict`

Uses a fuzzy-matching algorithm to suggest colleges based on an NIRF score.

**Query Parameters:**
- `score`: The user's score (0-100).

---

## 🛠️ Error Codes
- `BadRequestError` (400): Missing or malformed parameters.
- `NotFoundError` (404): Resource does not exist.
- `InternalServerError` (500): Unexpected server failure.
