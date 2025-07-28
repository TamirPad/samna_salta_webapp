# 🔧 API Connection Fix Guide

## 🚨 **Issue Identified:**
Frontend is trying to connect to `localhost:3001` instead of the Render server URL, causing `ERR_CONNECTION_REFUSED` errors.

## 🔧 **Root Cause:**
The `REACT_APP_API_URL` environment variable is not being set correctly in production, causing the frontend to fall back to localhost.

## ✅ **Fixes Applied:**

### 1. **Fixed render.yaml Configuration**
```yaml
# Frontend Environment Variables
- key: REACT_APP_API_URL
  value: https://samna-salta-webapp.onrender.com/api
```

### 2. **Enhanced API Configuration**
- Added dynamic API URL detection
- Better environment handling
- Added debugging information
- Fallback to current domain in production

### 3. **Added Development Proxy**
- Added proxy configuration for local development
- Helps with CORS issues during development

## 🧪 **Testing Steps:**

### **1. Check Current API URL:**
Open browser console and look for:
```
🔧 Using REACT_APP_API_URL: https://samna-salta-webapp.onrender.com/api
```

### **2. Test API Endpoints:**
```bash
# Test backend directly
curl https://samna-salta-webapp.onrender.com/api/test

# Test health check
curl https://samna-salta-webapp.onrender.com/health
```

### **3. Test Frontend Login:**
- Visit: https://samna-salta-webapp.onrender.com
- Try to login
- Check browser console for API calls

## 🔍 **Debugging Information:**

### **Expected API Calls:**
- ✅ `https://samna-salta-webapp.onrender.com/api/auth/login`
- ❌ `http://localhost:3001/api/auth/login` (this was the problem)

### **Environment Variables to Check:**
```bash
# In Render dashboard, verify these are set:
REACT_APP_API_URL=https://samna-salta-webapp.onrender.com/api
NODE_ENV=production
```

## 🚀 **Deployment Steps:**

1. **Update Environment Variables in Render:**
   - Go to Render dashboard
   - Navigate to your service
   - Go to Environment tab
   - Set `REACT_APP_API_URL` to `https://samna-salta-webapp.onrender.com/api`

2. **Redeploy the Application:**
   - Trigger a new deployment
   - Monitor the logs

3. **Verify the Fix:**
   - Check browser console for correct API URL
   - Test login functionality
   - Verify API calls go to Render URL

## 📊 **Expected Behavior:**

### **Before Fix:**
```
❌ API calls to: http://localhost:3001/api/auth/login
❌ ERR_CONNECTION_REFUSED errors
❌ Login functionality broken
```

### **After Fix:**
```
✅ API calls to: https://samna-salta-webapp.onrender.com/api/auth/login
✅ Successful API responses
✅ Login functionality working
```

## 🔧 **Manual Environment Variable Setup:**

If the render.yaml doesn't work, manually set in Render dashboard:

1. **Go to Render Dashboard**
2. **Navigate to your service**
3. **Go to Environment tab**
4. **Add/Update these variables:**
   ```
   REACT_APP_API_URL=https://samna-salta-webapp.onrender.com/api
   NODE_ENV=production
   ```

## 📞 **Troubleshooting:**

### **If API calls still fail:**
1. Check browser console for the correct API URL
2. Verify environment variables in Render
3. Test backend endpoints directly
4. Check CORS configuration

### **If backend is not responding:**
1. Check Render logs for backend startup issues
2. Test the health check endpoint
3. Verify the backend is running on the correct port

---

**Status:** API URL configuration issue identified and fixed
**Priority:** High - Required for frontend-backend communication
**Confidence:** High - Clear root cause and solution 