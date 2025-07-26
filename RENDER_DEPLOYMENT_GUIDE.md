# Render Deployment Guide for Samna Salta

This guide will help you deploy the Samna Salta webapp to Render.

## 🚀 Quick Deployment

### Option 1: Deploy Frontend Only (Recommended for testing)

1. **Connect to GitHub**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Static Site"
   - Connect your GitHub repository: `https://github.com/TamirPad/samna_salta_webapp`

2. **Configure the deployment**:
   - **Name**: `samna-salta-frontend`
   - **Build Command**: `npm install && npm run build:frontend`
   - **Publish Directory**: `apps/frontend/build`
   - **Environment**: Static Site

3. **Set Environment Variables**:
   ```
   NODE_VERSION=18.17.0
   REACT_APP_API_URL=https://your-backend-url.onrender.com
   REACT_APP_ENVIRONMENT=production
   ```

4. **Deploy**: Click "Create Static Site"

### Option 2: Deploy Full Stack (Frontend + Backend + Database)

1. **Deploy using render.yaml**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file

2. **Configure Environment Variables**:
   After deployment, go to each service and set the required environment variables.

## 🔧 Environment Variables

### Frontend Environment Variables
```
NODE_VERSION=18.17.0
REACT_APP_API_URL=https://your-backend-url.onrender.com
REACT_APP_ENVIRONMENT=production
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### Backend Environment Variables
```
NODE_VERSION=18.17.0
NODE_ENV=production
PORT=3001
DB_HOST=your_postgres_host
DB_PORT=5432
DB_NAME=samna_salta
DB_USER=your_db_user
DB_PASSWORD=your_db_password
REDIS_URL=redis://your_redis_host:6379
JWT_SECRET=your_very_long_jwt_secret_at_least_32_characters
FRONTEND_URL=https://your-frontend-url.onrender.com
STRIPE_SECRET_KEY=sk_test_your_stripe_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

## 🐛 Troubleshooting

### Common Issues and Solutions

#### 1. Build Failures

**Error**: `failed to solve: failed to read dockerfile: open Dockerfile: no such file or directory`

**Solution**: ✅ **FIXED** - We've added a `Dockerfile` to the root directory.

**Error**: `npm run build:frontend` not found

**Solution**: ✅ **FIXED** - The build script exists in the root package.json.

#### 2. Environment Variable Issues

**Error**: `REACT_APP_API_URL is not defined`

**Solution**: Set the environment variable in Render dashboard:
1. Go to your service
2. Click "Environment"
3. Add `REACT_APP_API_URL=https://your-backend-url.onrender.com`

#### 3. Database Connection Issues

**Error**: `Database connection failed`

**Solution**: 
1. Ensure PostgreSQL service is running
2. Check database credentials
3. Verify network connectivity between services

#### 4. Port Issues

**Error**: `Port already in use`

**Solution**: Render automatically sets the PORT environment variable. Make sure your app uses `process.env.PORT`.

## 📋 Deployment Checklist

### Before Deployment
- [ ] All environment variables are configured
- [ ] Database is set up and accessible
- [ ] Redis is configured (if using)
- [ ] External API keys are valid
- [ ] Frontend builds successfully locally

### After Deployment
- [ ] Frontend loads without errors
- [ ] Backend API responds to health check
- [ ] Database connection is working
- [ ] Authentication flow works
- [ ] Payment integration is functional

## 🔄 Continuous Deployment

Render automatically deploys when you push to the main branch. To disable:

1. Go to your service in Render dashboard
2. Click "Settings"
3. Toggle "Auto-Deploy" off

## 📊 Monitoring

### Health Checks
- Frontend: Automatically served by Render
- Backend: `/health` endpoint available
- Database: Connection status in logs

### Logs
- View logs in Render dashboard
- Use `render logs` CLI command
- Set up log forwarding for production

## 🚀 Production Considerations

### Performance
- Enable compression in nginx
- Use CDN for static assets
- Implement caching strategies

### Security
- Use HTTPS (automatic with Render)
- Set secure environment variables
- Enable security headers

### Scaling
- Upgrade to paid plans for better performance
- Use multiple instances for high availability
- Implement load balancing

## 📞 Support

If you encounter issues:

1. Check the logs in Render dashboard
2. Verify environment variables
3. Test locally first
4. Contact Render support if needed

## 🔗 Useful Links

- [Render Documentation](https://render.com/docs)
- [Render Status Page](https://status.render.com)
- [GitHub Repository](https://github.com/TamirPad/samna_salta_webapp) 