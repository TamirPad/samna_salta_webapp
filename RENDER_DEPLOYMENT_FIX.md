# Render Deployment Fix Guide

## 🚨 Current Issues

1. **Database Connection Failure**: Supabase IPv6 connection issues
2. **Port Conflict**: Backend trying to use port 10000 instead of PORT env var
3. **Startup Script Issues**: Poor error handling in start.sh

## 🔧 Fixes Applied

### 1. Database Configuration (`apps/backend/src/config/database.js`)

**Changes Made:**
- Improved Supabase connection handling
- Added IPv4-specific configuration
- Increased connection timeouts for production
- Reduced connection pool size for Render limits
- Better error handling for production environment

**Key Improvements:**
```javascript
// Force IPv4 connection for Supabase
if (connectionString.includes('db.kwrwxtccbnvadqedaqdd.supabase.co')) {
  const separator = connectionString.includes('?') ? '&' : '?';
  connectionString += `${separator}sslmode=require&connect_timeout=30&application_name=samna_salta`;
  
  return {
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    max: 10, // Reduced for Render's limits
    host: 'db.kwrwxtccbnvadqedaqdd.supabase.co',
    port: 5432,
    database: 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
  };
}
```

### 2. Server Startup (`apps/backend/src/server.js`)

**Changes Made:**
- Added proper PORT environment variable handling
- Added error handling for port conflicts
- Improved graceful shutdown

**Key Improvements:**
```javascript
const port = process.env.PORT || 3001;

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    logger.error(`Port ${port} is already in use. Trying port ${port + 1}`);
    server.listen(port + 1);
  } else {
    logger.error('Server error:', error);
    process.exit(1);
  }
});
```

### 3. Startup Script (`start.sh`)

**Changes Made:**
- Better port handling
- Process monitoring and restart logic
- Proper signal handling
- Improved error reporting

**Key Improvements:**
```bash
# Set default port if not provided
export PORT=${PORT:-3000}

# Check if backend is running
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "Backend failed to start. Checking for port conflicts..."
    PORT=$((PORT + 1)) npm run start:backend &
    BACKEND_PID=$!
fi
```

## 🛠️ Environment Variables for Render

### Required Variables:
```env
NODE_ENV=production
PORT=3000
SUPABASE_CONNECTION_STRING=postgresql://postgres:[PASSWORD]@db.kwrwxtccbnvadqedaqdd.supabase.co:5432/postgres
DB_HOST=db.kwrwxtccbnvadqedaqdd.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=[YOUR-SUPABASE-PASSWORD]
JWT_SECRET=[32+ CHARACTER SECRET]
```

### Optional Variables:
```env
REDIS_URL=redis://your-redis-url
STRIPE_SECRET_KEY=sk_test_...
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 📋 Deployment Steps

1. **Update Environment Variables in Render:**
   - Go to your Render dashboard
   - Navigate to your service
   - Go to Environment tab
   - Add/update the variables above

2. **Redeploy the Application:**
   - Trigger a new deployment in Render
   - Monitor the logs for any remaining issues

3. **Verify the Fix:**
   - Check that the backend starts without port conflicts
   - Verify database connection is established
   - Test the application functionality

## 🔍 Monitoring

### Check Logs for Success:
```
✅ Database connection established
✅ Server running on port 3000
✅ Redis connection established (if configured)
```

### Common Issues to Watch For:
- **Database Connection**: Should show "Database connection established"
- **Port Conflicts**: Should automatically try alternative ports
- **Memory Usage**: Monitor for memory leaks in production

## 🚀 Next Steps

1. **Test the Application**: Verify all features work correctly
2. **Monitor Performance**: Watch for any performance issues
3. **Set Up Monitoring**: Consider adding application monitoring
4. **Backup Strategy**: Ensure database backups are configured

## 📞 Support

If issues persist:
1. Check Render logs for specific error messages
2. Verify environment variables are correctly set
3. Test database connection manually
4. Contact support with specific error details 