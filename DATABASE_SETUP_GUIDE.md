# 🔧 Database Connection Setup Guide

## 🚨 **Current Issue:**
The application is failing to connect to the database, causing login failures and menu items not loading.

## 🔍 **Root Cause:**
The database environment variables are not configured in Render. The `render.yaml` file has `sync: false` for database variables, which means they need to be manually set in the Render dashboard.

## ✅ **Solution: Configure Supabase Database in Render**

### **Step 1: Get Your Supabase Connection String**

1. **Go to your Supabase project dashboard**
2. **Navigate to Settings → Database**
3. **Copy the connection string** (it looks like this):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.kwrwxtccbnvadqedaqdd.supabase.co:5432/postgres
   ```

### **Step 2: Configure Environment Variables in Render**

1. **Go to your Render dashboard**
2. **Select your `samna-salta-app` service**
3. **Go to Environment tab**
4. **Add these environment variables:**

#### **Required Database Variables:**
```
SUPABASE_CONNECTION_STRING = postgresql://postgres:[YOUR-PASSWORD]@db.kwrwxtccbnvadqedaqdd.supabase.co:5432/postgres
DB_PASSWORD = [YOUR-SUPABASE-PASSWORD]
JWT_SECRET = [YOUR-JWT-SECRET-MINIMUM-32-CHARACTERS]
```

#### **Optional Variables (for full functionality):**
```
REDIS_URL = [YOUR-REDIS-URL-IF-AVAILABLE]
STRIPE_SECRET_KEY = [YOUR-STRIPE-SECRET-KEY]
STRIPE_PUBLISHABLE_KEY = [YOUR-STRIPE-PUBLISHABLE-KEY]
```

### **Step 3: Deploy the Changes**

1. **Save the environment variables**
2. **Redeploy your application** (Render will auto-deploy)
3. **Wait for deployment to complete**

## 🧪 **Testing Steps:**

### **1. Check Deployment Logs:**
Look for these messages in Render logs:
```
✅ Database connection established successfully
✅ Connected to PostgreSQL database
```

### **2. Test API Endpoints:**
- **Health Check:** `https://samna-salta-webapp.onrender.com/api/test`
- **Login:** Try logging in with test credentials
- **Menu Items:** Navigate to menu page

### **3. Expected Behavior:**
- ✅ Login should work
- ✅ Menu items should load
- ✅ No database connection errors

## 🔍 **Debugging Information:**

### **If Database Still Fails:**

#### **Check Environment Variables:**
```bash
# In Render logs, look for:
🔧 Database configuration: {
  hasConnectionString: true/false,
  hasDBHost: true/false,
  hasDBPassword: true/false,
  nodeEnv: production
}
```

#### **Common Issues:**

1. **Wrong Password:**
   ```
   ❌ Database connection failed: password authentication failed
   ```
   **Fix:** Double-check your Supabase password

2. **Invalid Connection String:**
   ```
   ❌ Database connection failed: invalid connection string
   ```
   **Fix:** Ensure the connection string format is correct

3. **Network Issues:**
   ```
   ❌ Database connection failed: connect ENETUNREACH
   ```
   **Fix:** Check if Supabase is accessible from Render

### **If Login Still Fails:**

1. **Check if users table exists:**
   - The database might be empty
   - You may need to create test users

2. **Create a test user:**
   ```sql
   INSERT INTO users (name, email, password_hash, is_admin, created_at, updated_at)
   VALUES ('Test User', 'test@example.com', '$2a$12$...', false, NOW(), NOW());
   ```

## 🚀 **Quick Fix Commands:**

### **For Immediate Testing:**
1. **Set environment variables in Render**
2. **Redeploy the application**
3. **Test the endpoints**

### **If You Need to Create Test Data:**
1. **Connect to your Supabase database**
2. **Run the migration scripts**
3. **Create test users**

## 📊 **Expected Results:**

### **Before Fix:**
```
❌ Database connection failed: password authentication failed
❌ Login fails with database errors
❌ Menu items don't load
```

### **After Fix:**
```
✅ Database connection established successfully
✅ Login works correctly
✅ Menu items load properly
```

## 🔧 **Alternative Solutions:**

### **If Supabase is Not Working:**

1. **Use Local PostgreSQL:**
   - Set up a local PostgreSQL database
   - Update environment variables accordingly

2. **Use Another Cloud Database:**
   - AWS RDS
   - Google Cloud SQL
   - Azure Database for PostgreSQL

3. **Use SQLite (for development):**
   - Switch to SQLite for simpler setup
   - Update database configuration

## 📞 **Troubleshooting:**

### **Environment Variable Issues:**
1. **Check Render dashboard** for correct variable names
2. **Ensure no extra spaces** in values
3. **Verify connection string format**

### **Database Permission Issues:**
1. **Check Supabase database permissions**
2. **Ensure user has proper access**
3. **Verify database exists and is accessible**

### **Network Connectivity:**
1. **Check if Render can reach Supabase**
2. **Verify firewall settings**
3. **Test connection from different locations**

---

**Status:** Database connection configuration needed
**Priority:** High - Core functionality depends on database
**Confidence:** High - Clear configuration issue 