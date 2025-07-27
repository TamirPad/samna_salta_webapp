# Render Environment Variables Setup Guide

## 🚨 **Current Issues to Fix:**

1. **Missing JWT_SECRET** - Required for authentication
2. **Database Connection** - IPv6 connection issue (fixed in code)

## ✅ **Required Environment Variables:**

### **🔐 JWT_SECRET (REQUIRED)**
```
JWT_SECRET=c14e54c69ffb213ded08925ee8c3b80af471c8e23b464b2884dfd1d9136d6f2ed7ed692a74369df02b7476da4855b4f7a6a080eb39e9fa6fa4d62e8b42ad9a19
```

### **🗄️ Database (REQUIRED)**
```
SUPABASE_CONNECTION_STRING=postgresql://postgres:5fBBhV7x6qzqRMff@db.kwrwxtccbnvadqedaqdd.supabase.co:5432/postgres
```

## 📋 **How to Set Environment Variables in Render:**

1. **Go to your Render Dashboard**
2. **Click on your service** (`samna-salta-app`)
3. **Go to "Environment" tab**
4. **Add these variables:**

### **Required Variables:**
| Variable | Value | Description |
|----------|-------|-------------|
| `JWT_SECRET` | `c14e54c69ffb213ded08925ee8c3b80af471c8e23b464b2884dfd1d9136d6f2ed7ed692a74369df02b7476da4855b4f7a6a080eb39e9fa6fa4d62e8b42ad9a19` | Authentication secret |
| `SUPABASE_CONNECTION_STRING` | `postgresql://postgres:5fBBhV7x6qzqRMff@db.kwrwxtccbnvadqedaqdd.supabase.co:5432/postgres` | Database connection |

### **Optional Variables (for full functionality):**
| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | `3000` | Server port |
| `FRONTEND_URL` | `https://samna-salta-webapp.onrender.com` | Frontend URL for CORS |
| `REDIS_URL` | (optional) | For session management |
| `STRIPE_SECRET_KEY` | (optional) | For payment processing |
| `CLOUDINARY_CLOUD_NAME` | (optional) | For file uploads |
| `CLOUDINARY_API_KEY` | (optional) | For file uploads |
| `CLOUDINARY_API_SECRET` | (optional) | For file uploads |
| `TWILIO_ACCOUNT_SID` | (optional) | For SMS notifications |
| `TWILIO_AUTH_TOKEN` | (optional) | For SMS notifications |
| `TWILIO_PHONE_NUMBER` | (optional) | For SMS notifications |
| `SMTP_HOST` | (optional) | For email notifications |
| `SMTP_PORT` | (optional) | For email notifications |
| `SMTP_USER` | (optional) | For email notifications |
| `SMTP_PASS` | (optional) | For email notifications |

## 🔧 **Database Connection Fix:**

The IPv6 connection issue has been fixed in the code by:
- Adding proper connection timeouts
- Improving error handling
- Adding retry logic

## 🚀 **After Setting Variables:**

1. **Save the environment variables**
2. **Redeploy the service** (Render will auto-redeploy)
3. **Check the logs** for successful startup
4. **Test the application** at your Render URL

## ✅ **Expected Results:**

After setting the environment variables, you should see:
- ✅ No more "Missing required environment variable: JWT_SECRET" errors
- ✅ Successful database connection
- ✅ Server starting without errors
- ✅ Application accessible at your Render URL

## 🔍 **Troubleshooting:**

If you still see errors:
1. **Check Render logs** for specific error messages
2. **Verify environment variables** are set correctly
3. **Ensure Supabase connection string** is correct
4. **Redeploy** the service after setting variables

---

**Status**: Ready for environment variable setup
**Next Step**: Set the required environment variables in Render dashboard 