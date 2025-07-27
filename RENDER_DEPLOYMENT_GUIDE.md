# 🚀 Render Deployment Guide for Samna Salta

This guide will help you deploy your Samna Salta application to Render using your existing Supabase database.

## 📋 Prerequisites

- [Render account](https://render.com)
- [Supabase project](https://supabase.com) (already configured)
- GitHub repository with your code

## 🔧 Configuration Changes Made

### 1. Updated `render.yaml`

The `render.yaml` file has been updated to:
- ✅ Use Supabase database instead of local PostgreSQL
- ✅ Remove PostgreSQL and Redis services (using Supabase + in-memory fallback)
- ✅ Fix build commands for monorepo structure
- ✅ Add all necessary environment variables

### 2. Key Changes:
- **Database**: Using `SUPABASE_CONNECTION_STRING` instead of local PostgreSQL
- **Build Commands**: Simplified to work with monorepo structure
- **Environment Variables**: Added comprehensive list for all services

## 🚀 Deployment Steps

### Step 1: Connect Your Repository

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Blueprint"
3. Connect your GitHub repository
4. Select the repository containing your Samna Salta code

### Step 2: Configure Environment Variables

In your Render dashboard, you'll need to set these environment variables:

#### Backend Service Environment Variables:

```bash
# Database
SUPABASE_CONNECTION_STRING=postgresql://postgres:5fBBhV7x6qzqRMff@db.kwrwxtccbnvadqedaqdd.supabase.co:5432/postgres

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Redis (optional - will use in-memory fallback if not set)
REDIS_URL=your-redis-url-if-needed

# Payment Processing
STRIPE_SECRET_KEY=your-stripe-secret-key

# File Upload (Cloudinary)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# SMS/Communication (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# Email (SMTP)
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password

# Additional CORS origins (optional)
ADDITIONAL_CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

#### Frontend Service Environment Variables:

```bash
# Payment Processing
REACT_APP_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

# Maps (optional)
REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### Step 3: Deploy

1. Render will automatically detect the `render.yaml` file
2. It will create:
   - **Frontend Service**: Static site hosting
   - **Backend Service**: Node.js API service
3. The services will be linked automatically
4. Frontend will get the backend URL automatically

## 🔍 Verification Steps

### 1. Check Backend Health

```bash
curl https://your-backend-service.onrender.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-07-27T22:00:00.000Z",
  "service": "samna-salta-api"
}
```

### 2. Test Database Connection

```bash
curl https://your-backend-service.onrender.com/api/products
```

Should return your existing products from Supabase.

### 3. Test Frontend

Visit your frontend URL and verify:
- ✅ Products load correctly
- ✅ Login works with admin@sammasalta.com
- ✅ Cart functionality works
- ✅ Order creation works

## 🛠️ Troubleshooting

### Common Issues:

#### 1. Build Failures
```bash
# Check build logs in Render dashboard
# Common fixes:
npm install --legacy-peer-deps
```

#### 2. Database Connection Issues
```bash
# Verify Supabase connection string
# Check if database is accessible from Render
```

#### 3. Environment Variables
```bash
# Ensure all required variables are set
# Check for typos in variable names
```

#### 4. CORS Issues
```bash
# Add your frontend URL to ADDITIONAL_CORS_ORIGINS
# Or update FRONTEND_URL in backend service
```

### Debug Commands:

```bash
# Check backend logs
curl https://your-backend-service.onrender.com/api/health

# Test database connection
curl https://your-backend-service.onrender.com/api/products

# Check environment variables
curl https://your-backend-service.onrender.com/api/debug/env
```

## 📊 Monitoring

### Render Dashboard Features:
- ✅ **Logs**: Real-time application logs
- ✅ **Metrics**: CPU, memory, response times
- ✅ **Alerts**: Automatic health checks
- ✅ **Scaling**: Auto-scaling based on traffic

### Health Checks:
- Backend: `/api/health`
- Frontend: Automatic static file serving
- Database: Connection test on startup

## 🔄 Continuous Deployment

### Automatic Deployments:
- ✅ **GitHub Integration**: Automatic deployments on push to main
- ✅ **Preview Deployments**: Automatic preview deployments on pull requests
- ✅ **Rollback**: Easy rollback to previous versions

### Manual Deployments:
```bash
# Trigger manual deployment from Render dashboard
# Or push to trigger automatic deployment
git push origin main
```

## 💰 Cost Optimization

### Free Tier Limits:
- **Backend**: 750 hours/month (free tier)
- **Frontend**: Unlimited (static hosting)
- **Database**: Using Supabase (separate billing)

### Scaling Options:
- **Backend**: Upgrade to paid plan for more resources
- **Database**: Supabase has generous free tier
- **CDN**: Automatic CDN for static assets

## 🔐 Security Considerations

### Environment Variables:
- ✅ All secrets stored in Render environment variables
- ✅ No secrets in code repository
- ✅ Automatic encryption at rest

### Database Security:
- ✅ Supabase handles database security
- ✅ Connection string encrypted
- ✅ Row Level Security (RLS) available

### API Security:
- ✅ JWT authentication
- ✅ Rate limiting
- ✅ CORS protection
- ✅ Input validation

## 📞 Support

### Render Support:
- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com)
- [Render Status](https://status.render.com)

### Application Support:
- Check logs in Render dashboard
- Test endpoints manually
- Verify environment variables

## 🎉 Success Checklist

- [ ] Repository connected to Render
- [ ] Environment variables configured
- [ ] Backend service deployed successfully
- [ ] Frontend service deployed successfully
- [ ] Database connection working
- [ ] API endpoints responding
- [ ] Frontend loading correctly
- [ ] Login functionality working
- [ ] Product browsing working
- [ ] Order creation working
- [ ] Admin panel accessible

## 🚀 Next Steps

1. **Monitor**: Watch logs and metrics
2. **Test**: Verify all functionality
3. **Optimize**: Adjust resources as needed
4. **Scale**: Upgrade plans if needed
5. **Backup**: Set up database backups
6. **Domain**: Configure custom domain

---

**🎉 Congratulations! Your Samna Salta application is now deployed on Render!** 