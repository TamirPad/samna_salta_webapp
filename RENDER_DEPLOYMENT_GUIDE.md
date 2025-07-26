# Render Deployment Guide for Samna Salta Webapp

## Overview
This guide explains how to deploy the Samna Salta monorepo to Render using the updated `render.yaml` configuration.

## Deployment Architecture

### Services Configured:
1. **Frontend (Static Site)** - React app served as static files
2. **Backend (Web Service)** - Node.js API server
3. **PostgreSQL Database** - Managed database service
4. **Redis Cache** - Managed Redis service

## Prerequisites

1. **Render Account** - Sign up at [render.com](https://render.com)
2. **GitHub Repository** - Your code must be in a Git repository
3. **Environment Variables** - Prepare all required environment variables

## Environment Variables Setup

### Frontend Environment Variables
Set these in the Render dashboard for the frontend service:

```bash
REACT_APP_API_URL=https://your-backend-service-name.onrender.com
REACT_APP_ENVIRONMENT=production
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Backend Environment Variables
Set these in the Render dashboard for the backend service:

```bash
NODE_ENV=production
DB_HOST=your-postgres-service-name.onrender.com
DB_PORT=5432
DB_NAME=samna_salta
DB_USER=your_db_user
DB_PASSWORD=your_db_password
REDIS_URL=redis://your-redis-service-name.onrender.com:6379
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=https://your-frontend-service-name.onrender.com
STRIPE_SECRET_KEY=sk_test_...
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

## Deployment Steps

### 1. Connect Repository
1. Go to your Render dashboard
2. Click "New +" and select "Blueprint"
3. Connect your GitHub repository
4. Render will automatically detect the `render.yaml` file

### 2. Configure Services
The `render.yaml` file will automatically create:
- Frontend static site
- Backend web service
- PostgreSQL database
- Redis cache

### 3. Set Environment Variables
1. For each service, go to the "Environment" tab
2. Add all required environment variables
3. Make sure to use the correct service URLs for database and Redis connections

### 4. Deploy
1. Render will automatically start the deployment
2. Monitor the build logs for any issues
3. Wait for all services to be healthy

## Service URLs

After deployment, your services will be available at:
- **Frontend**: `https://samna-salta-frontend.onrender.com`
- **Backend**: `https://samna-salta-backend.onrender.com`
- **Database**: `samna-salta-db.onrender.com:5432`
- **Redis**: `samna-salta-redis.onrender.com:6379`

## Troubleshooting

### Common Issues:

1. **Build Failures**
   - Check that all dependencies are properly installed
   - Verify Node.js version compatibility
   - Check build logs for specific error messages

2. **Database Connection Issues**
   - Verify database credentials
   - Check that the database service is running
   - Ensure proper network connectivity

3. **Environment Variable Issues**
   - Double-check all environment variable names
   - Ensure sensitive data is properly set
   - Verify API URLs are correct

4. **Frontend API Calls Failing**
   - Check that `REACT_APP_API_URL` points to the correct backend URL
   - Verify CORS settings in the backend
   - Check network tab for specific error messages

### Health Checks
- Backend health check: `https://samna-salta-backend.onrender.com/health`
- Frontend should serve the React app at the root URL

## Alternative Deployment Options

### Docker Deployment
If you prefer to use Docker, you can:
1. Use the `Dockerfile.prod` file
2. Change the backend service type to `docker` in `render.yaml`
3. Set `dockerfilePath: ./Dockerfile.prod`

### Manual Service Creation
You can also create services manually:
1. Create each service individually in Render
2. Use the build commands and environment variables from `render.yaml`
3. Connect them using the service URLs

## Monitoring and Maintenance

### Logs
- Monitor service logs in the Render dashboard
- Set up log aggregation if needed
- Check for errors and performance issues

### Scaling
- Upgrade service plans as needed
- Monitor resource usage
- Consider auto-scaling for high traffic

### Updates
- Push changes to your Git repository
- Render will automatically redeploy
- Test thoroughly before pushing to production

## Security Considerations

1. **Environment Variables**
   - Never commit sensitive data to Git
   - Use Render's secure environment variable storage
   - Rotate secrets regularly

2. **Database Security**
   - Use strong passwords
   - Enable SSL connections
   - Restrict access to necessary IPs only

3. **API Security**
   - Implement proper authentication
   - Use HTTPS for all communications
   - Validate all inputs

## Cost Optimization

1. **Free Tier Limits**
   - Free services have usage limits
   - Monitor usage to avoid unexpected charges
   - Upgrade only when necessary

2. **Resource Management**
   - Right-size your services
   - Use appropriate instance types
   - Monitor and optimize resource usage

## Support

For Render-specific issues:
- Check Render documentation
- Contact Render support
- Use Render community forums

For application-specific issues:
- Check application logs
- Review error messages
- Test locally first 