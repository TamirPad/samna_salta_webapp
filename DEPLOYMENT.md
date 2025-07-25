# 🚀 Render Deployment Guide

This guide will help you deploy your Samna Salta webapp to Render.

## 📋 Prerequisites

- GitHub repository with your code
- Render account (free tier available)
- Node.js 18+ (for local testing)

## 🎯 Deployment Options

### Option 1: Static Site (Recommended)

**Best for**: Frontend-only applications with no server-side logic

1. **Go to Render Dashboard**
   - Visit [dashboard.render.com](https://dashboard.render.com)
   - Sign up/Login with your GitHub account

2. **Create New Static Site**
   - Click "New +" → "Static Site"
   - Connect your GitHub repository

3. **Configure Settings**
   ```
   Name: samna-salta-webapp
   Build Command: npm install && npm run build
   Publish Directory: build
   ```

4. **Environment Variables** (Optional)
   ```
   REACT_APP_API_URL=https://your-backend-api.onrender.com/api
   REACT_APP_ENVIRONMENT=production
   ```

5. **Deploy**
   - Click "Create Static Site"
   - Wait for build to complete (2-3 minutes)

### Option 2: Web Service (Docker)

**Best for**: Applications that need custom server configuration

1. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Settings**
   ```
   Name: samna-salta-webapp
   Environment: Docker
   Build Command: (leave empty - uses Dockerfile)
   Start Command: (leave empty - uses Dockerfile)
   ```

3. **Deploy**
   - Click "Create Web Service"
   - Render will use the Dockerfile automatically

## 🔧 Configuration Files

### render.yaml (Option 1)
```yaml
services:
  - type: web
    name: samna-salta-webapp
    env: static
    buildCommand: npm install && npm run build
    staticPublishPath: ./build
    envVars:
      - key: REACT_APP_API_URL
        value: https://your-backend-api.onrender.com/api
```

### Dockerfile (Option 2)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]
```

## 🌐 Custom Domain (Optional)

1. **Add Custom Domain**
   - Go to your service settings
   - Click "Custom Domains"
   - Add your domain (e.g., `app.sammasalta.co.il`)

2. **Configure DNS**
   - Add CNAME record pointing to your Render URL
   - Wait for DNS propagation (up to 24 hours)

## 🔒 Security & Performance

### Security Headers
The app includes security headers in `nginx.conf`:
- X-Frame-Options
- X-XSS-Protection
- X-Content-Type-Options
- Content-Security-Policy

### Performance Optimizations
- Gzip compression enabled
- Static asset caching (1 year)
- Optimized bundle splitting
- Lazy loading for pages

## 📊 Monitoring

### Health Check
- Endpoint: `/health`
- Returns: `200 OK` with "healthy" message

### Build Logs
- Available in Render dashboard
- Real-time build status
- Error reporting

## 🚨 Troubleshooting

### Build Failures
1. **Check Node.js version**
   ```bash
   node --version  # Should be 18+
   ```

2. **Verify dependencies**
   ```bash
   npm install
   npm run build
   ```

3. **Check environment variables**
   - Ensure all required env vars are set
   - Check for typos in variable names

### Runtime Issues
1. **Check application logs**
   - Available in Render dashboard
   - Look for error messages

2. **Verify API endpoints**
   - Test API connectivity
   - Check CORS settings

3. **Test locally first**
   ```bash
   npm run build
   npx serve -s build
   ```

## 📈 Scaling

### Free Tier Limits
- 750 hours/month
- 512MB RAM
- Shared CPU
- Sleep after 15 minutes of inactivity

### Paid Plans
- Always-on services
- More RAM and CPU
- Custom domains included
- Priority support

## 🔄 Continuous Deployment

### Automatic Deploys
- Enabled by default
- Deploys on every push to main branch
- Manual deploys available

### Branch Deploys
- Preview deployments for pull requests
- Test changes before merging

## 📱 PWA Features

### Service Worker
- Offline support (coming soon)
- Cache strategies
- Background sync

### Manifest
- Installable app
- App icons
- Splash screen

## 🎯 Best Practices

1. **Environment Variables**
   - Never commit secrets to Git
   - Use Render's environment variable system
   - Use different values for dev/prod

2. **Build Optimization**
   - Keep bundle size under 500KB
   - Use code splitting
   - Optimize images

3. **Performance**
   - Enable gzip compression
   - Use CDN for static assets
   - Implement caching strategies

## 📞 Support

### Render Support
- [Documentation](https://render.com/docs)
- [Community Forum](https://community.render.com)
- [Status Page](https://status.render.com)

### Application Support
- Check build logs for errors
- Verify environment configuration
- Test locally before deploying

## 🎉 Success Checklist

- [ ] Build completes successfully
- [ ] Application loads without errors
- [ ] All routes work correctly
- [ ] API calls function properly
- [ ] Mobile responsiveness verified
- [ ] Performance metrics acceptable
- [ ] Security headers in place
- [ ] Custom domain configured (if needed)

---

**Your Samna Salta webapp is now live on Render! 🚀** 