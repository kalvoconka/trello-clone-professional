# API Documentation

## Base URL
- Development: `http://localhost:5000/api`
- Production: `https://api.trelloclone.com/api`

## Authentication
All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Interactive Documentation
Full interactive API documentation with Swagger UI is available at:
- Development: http://localhost:5000/api/docs
- Production: https://api.trelloclone.com/api/docs

## Endpoints

### Authentication

#### POST /auth/register
Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "cuid",
      "email": "user@example.com",
      "username": "johndoe",
      "name": "John Doe"
    },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

#### POST /auth/login
Authenticate user and receive tokens.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "data": {
    "user": {
      "id": "cuid",
      "email": "user@example.com",
      "username": "johndoe",
      "name": "John Doe"
    },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

#### POST /auth/refresh
Get new access token using refresh token.

**Request:**
```json
{
  "refreshToken": "refresh_token"
}
```

**Response (200):**
```json
{
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "new_jwt_token",
    "refreshToken": "new_refresh_token"
  }
}
```

#### GET /auth/profile
Get current user profile (requires authentication).

**Response (200):**
```json
{
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": "cuid",
      "email": "user@example.com",
      "username": "johndoe",
      "name": "John Doe",
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    }
  }
}
```

### Health Check

#### GET /health
Check API health status.

**Response (200):**
```json
{
  "status": "OK",
  "message": "Trello Clone Backend is healthy",
  "timestamp": "2025-01-01T00:00:00Z",
  "environment": "development",
  "version": "1.0.0",
  "uptime": 3600,
  "database": "connected"
}
```

## Error Responses

All errors follow this format:
```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- 400: Bad Request (invalid input)
- 401: Unauthorized (missing/invalid token)
- 403: Forbidden (invalid permissions)
- 404: Not Found
- 429: Too Many Requests (rate limit)
- 500: Internal Server Error

## Rate Limiting

- Login: 5 attempts per 15 minutes
- Register: 3 attempts per hour
- API calls: 100 requests per 15 minutes (configurable)

## Upcoming Endpoints

### Boards (Sprint 3)
- GET /boards - List user's boards
- POST /boards - Create board
- GET /boards/:id - Get board details
- PUT /boards/:id - Update board
- DELETE /boards/:id - Delete board

### Lists (Sprint 3)
- POST /boards/:boardId/lists - Create list
- PUT /lists/:id - Update list
- DELETE /lists/:id - Delete list
- PUT /lists/reorder - Reorder lists

### Cards (Sprint 4)
- POST /lists/:listId/cards - Create card
- GET /cards/:id - Get card details
- PUT /cards/:id - Update card
- DELETE /cards/:id - Delete card
- PUT /cards/move - Move card between lists