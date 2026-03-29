# CORS Fix Guide - Spring Boot + React (Vercel)

## ✅ Fixes Applied

### 1. CorsConfig.java
- ✅ Added specific origins: `http://localhost:5173` and `https://campusassetmanagement.vercel.app`
- ✅ Added wildcard pattern `*` for development backup
- ✅ Allowed all methods: GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD
- ✅ Allowed all headers
- ✅ Enabled credentials
- ✅ Added exposed headers: Authorization, Content-Type
- ✅ Set max age to 3600s for pre-flight caching

### 2. SecurityConfig.java
- ✅ CORS enabled with `cors(Customizer.withDefaults())`
- ✅ CSRF disabled
- ✅ Permitted endpoints: `/api/auth/**`, `/api/scan/**`, `/qrcodes/**`, `/health`, `/api/test/**`
- ✅ Session management set to STATELESS

### 3. JwtFilter.java
- ✅ Added logging for debugging
- ✅ Skip JWT validation for OPTIONS requests (CORS preflight)
- ✅ Skip JWT validation for `/api/auth/**` endpoints
- ✅ Added debug logging for authentication flow

### 4. application-prod.properties
- ✅ Set default frontend URL to `https://campusassetmanagement.vercel.app`
- ✅ Added `FRONTEND_URL` environment variable for CORS

### 5. TestController.java
- ✅ Created `/api/test/cors` endpoint for testing
- ✅ Logs incoming requests with origin and method
- ✅ Handles OPTIONS requests for pre-flight testing

## 🧪 Testing CORS

### Test 1: Browser Console
```javascript
// Test from browser console on your Vercel app
fetch('https://your-backend.onrender.com/api/test/cors', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
})
.then(response => response.json())
.then(data => console.log('CORS Test Result:', data))
.catch(error => console.error('CORS Error:', error));
```

### Test 2: Postman/Thunder Client
```http
GET https://your-backend.onrender.com/api/test/cors
Origin: https://campusassetmanagement.vercel.app
```

### Test 3: OPTIONS Pre-flight
```http
OPTIONS https://your-backend.onrender.com/api/test/cors
Origin: https://campusassetmanagement.vercel.app
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Authorization, Content-Type
```

## 📋 Expected Response Headers

### Successful CORS Response:
```
Access-Control-Allow-Origin: https://campusassetmanagement.vercel.app
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD
Access-Control-Allow-Headers: *
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 3600
Access-Control-Expose-Headers: Authorization, Content-Type
```

### OPTIONS Pre-flight Response:
```
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://campusassetmanagement.vercel.app
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD
Access-Control-Allow-Headers: *
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 3600
```

## 🔧 Render Environment Variables

Set these in your Render dashboard:

### Backend Service:
```
DATABASE_URL=mysql://user:pass@host:3306/dbname
DATABASE_USERNAME=user
DATABASE_PASSWORD=pass
FRONTEND_URL=https://campusassetmanagement.vercel.app
BACKEND_URL=https://your-backend.onrender.com
```

### Frontend Service (Vercel):
```
VITE_API_BASE_URL=https://your-backend.onrender.com/api
VITE_BACKEND_URL=https://your-backend.onrender.com
```

## 🐛 Debugging Steps

### 1. Check Backend Logs
Look for these log messages:
```
INFO  CORS test request from: https://campusassetmanagement.vercel.app
INFO  Request method: GET
DEBUG Skipping JWT filter for OPTIONS request: /api/test/cors
DEBUG Skipping JWT filter for auth endpoint: /api/auth/login
```

### 2. Check Browser Network Tab
1. Open DevTools → Network
2. Make a request from your Vercel app
3. Check the OPTIONS pre-flight request
4. Verify response headers above

### 3. Common Issues & Solutions

#### Issue: "No 'Access-Control-Allow-Origin' header"
**Solution:** Check if CORS is properly configured and the origin matches

#### Issue: "CORS preflight channel did not succeed"
**Solution:** Ensure OPTIONS requests return 200 OK

#### Issue: "Credentials mode is inclusive"
**Solution:** Ensure `AllowCredentials: true` and specific origin (not wildcard)

#### Issue: JWT filter blocking OPTIONS
**Solution:** Check if OPTIONS requests are properly skipped

## 🚀 Deployment Checklist

### Backend (Render):
- [ ] Set `FRONTEND_URL=https://campusassetmanagement.vercel.app`
- [ ] Deploy with `application-prod.properties`
- [ ] Test `/api/test/cors` endpoint
- [ ] Check logs for CORS requests

### Frontend (Vercel):
- [ ] Set `VITE_API_BASE_URL=https://your-backend.onrender.com/api`
- [ ] Deploy to Vercel
- [ ] Test login/registration from deployed app
- [ ] Check browser console for errors

## 📞 Quick Test Commands

### From Backend (curl):
```bash
# Test CORS with origin header
curl -H "Origin: https://campusassetmanagement.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Authorization, Content-Type" \
     -X OPTIONS \
     https://your-backend.onrender.com/api/test/cors

# Test actual endpoint
curl -H "Origin: https://campusassetmanagement.vercel.app" \
     https://your-backend.onrender.com/api/test/cors
```

### From Frontend (browser):
```javascript
// Test login API
fetch('https://your-backend.onrender.com/api/auth/login', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        email: 'test@example.com',
        password: 'password'
    })
})
.then(response => response.json())
.then(data => console.log('Login Result:', data))
.catch(error => console.error('Login Error:', error));
```

## ✅ Success Indicators

1. **No CORS errors** in browser console
2. **OPTIONS pre-flight** returns 200 OK
3. **Actual requests** succeed with proper response
4. **Backend logs** show incoming requests from Vercel
5. **Login/registration** works from deployed app

The CORS issue should now be resolved! 🎉
