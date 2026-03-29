# Registration Test Guide

## Backend Fixes Applied ✅

### 1. AuthController.java
- ✅ Added comprehensive logging with @Slf4j
- ✅ Added try-catch blocks for proper exception handling
- ✅ Logs incoming requests and exceptions
- ✅ Returns proper HTTP status codes

### 2. UserService.java
- ✅ Added comprehensive logging
- ✅ BCrypt password encoding
- ✅ Email duplicate checking
- ✅ Proper ResponseStatusException usage

### 3. SecurityConfig.java
- ✅ Permits /api/auth/** endpoints
- ✅ CSRF disabled
- ✅ Session management set to STATELESS

### 4. CorsConfig.java
- ✅ Allows all origins with addAllowedOriginPattern("*")
- ✅ Proper CORS headers configured

### 5. GlobalExceptionHandler.java
- ✅ Handles ResponseStatusException properly
- ✅ Returns structured error responses

## Frontend Fixes Applied ✅

### 1. Register.jsx
- ✅ Added detailed console logging
- ✅ Enhanced error handling with multiple console.error statements
- ✅ Proper error message extraction from response

### 2. AuthContext.jsx
- ✅ Added register function that calls authService
- ✅ Properly sets user state after registration

### 3. authService.js
- ✅ Correct API endpoints (/auth/register)
- ✅ Proper token and user storage

### 4. api.js
- ✅ Uses VITE_API_BASE_URL environment variable
- ✅ Proper axios configuration with auth headers

## Test with Postman

### Request:
```
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
    "name": "Test User",
    "email": "test@test.com",
    "password": "123456"
}
```

### Expected Success Response (200 OK):
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "Test User",
        "email": "test@test.com",
        "role": "STUDENT"
    }
}
```

### Expected Error Response (400 Bad Request):
```json
{
    "error": "Email already registered"
}
```

## Test with Frontend

### 1. Set Environment Variables
Create `.env` file in frontend root:
```
VITE_API_BASE_URL=http://localhost:8080/api
VITE_BACKEND_URL=http://localhost:8080
```

### 2. Start Backend
```bash
cd assetmanager
./mvnw spring-boot:run
```

### 3. Start Frontend
```bash
cd asset-frontend
npm run dev
```

### 4. Test Registration
1. Open http://localhost:5173/register
2. Fill form:
   - Name: Test User
   - Email: test@test.com
   - Password: 123456
   - Role: Student
3. Check browser console for logs
4. Check backend logs for registration flow

## Debugging Checklist

### Backend Logs Should Show:
```
INFO  Registration request received: test@test.com
INFO  Creating user: test@test.com
INFO  User created successfully: test@test.com
INFO  User registered successfully: test@test.com
```

### Frontend Console Should Show:
```
Registering: {name: 'Test User', email: 'test@test.com', password: '123456', role: 'STUDENT'}
```

### Network Tab Should Show:
- Request URL: http://localhost:8080/api/auth/register
- Method: POST
- Status: 200 OK
- Response: AuthResponse with token and user

## Common Issues & Solutions

### 1. CORS Issues
- Check that backend is running on port 8080
- Verify VITE_API_BASE_URL is correct
- Check browser network tab for CORS errors

### 2. Connection Refused
- Ensure backend is running
- Check if port 8080 is available
- Verify no firewall blocking

### 3. Registration Failed
- Check backend logs for specific error
- Verify database connection
- Check email uniqueness constraint

### 4. JWT Issues
- Verify JWT secret is configured
- Check token generation in logs
- Validate token format
