# Samna Salta Web App - Render Deployment Guide

## 🚀 Overview

This guide will help you deploy the Samna Salta web application to Render as a **single web service** that serves both the backend API and frontend React app.

## 📋 Prerequisites

- GitHub repository with your code
- Render account (free tier available)
- PostgreSQL database (Render provides this)

## 🏗️ Architecture

**Single Service Deployment:**
- **Backend**: Node.js/Express API
- **Frontend**: React app (built and served by Express)
- **Database**: PostgreSQL
- **Platform**: Render (single web service)

## 📁 Project Structure

```
samna_salta_webapp/
├── apps/
│   ├── backend/          # Express API server
│   │   ├── src/
│   │   ├── package.json
│   │   └── .env
│   └── frontend/         # React application
│       ├── src/
│       ├── public/
│       └── package.json
├── render.yaml           # Render blueprint
└── package.json
```

## 🔧 Configuration Files

### 1. render.yaml (Root Level)

```yaml
services:
  # Single Web Service (Backend + Frontend)
  - type: web
    name: samna-salta-webapp
    env: node
    plan: free
    rootDir: apps/backend
    buildCommand: npm install && cd ../frontend && npm install && npm run build && cd ../backend
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: DATABASE_URL
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: FRONTEND_URL
        value: https://samna-salta-webapp.onrender.com
      - key: LOG_LEVEL
        value: info
```

### 2. Backend Server Configuration

The backend server (`apps/backend/src/server.js`) is configured to:
- Serve API routes under `/api/*`
- Serve frontend static files from `../frontend/build`
- Handle React routing with fallback to `index.html`

### 3. Frontend API Configuration

The frontend automatically detects the environment and uses:
- **Development**: `http://localhost:3001/api`
- **Production**: Same domain as the app (e.g., `https://samna-salta-webapp.onrender.com/api`)

## 🚀 Deployment Steps

### Step 1: Prepare Your Repository

1. **Ensure all files are committed:**
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **Verify your render.yaml is in the root directory**

### Step 2: Create Render Services

1. **Go to Render Dashboard:**
   - Visit https://dashboard.render.com
   - Sign in or create account

2. **Create Blueprint:**
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically create the web service

### Step 3: Configure Environment Variables

1. **Go to your web service in Render dashboard**

2. **Add required environment variables:**
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `JWT_SECRET` - Strong random string (32+ characters)

3. **Example JWT_SECRET:**
   ```
   your-super-secret-jwt-key-change-this-in-production-minimum-32-characters
   ```

### Step 4: Set Up Database

1. **Create PostgreSQL database on Render:**
   - Go to Render Dashboard
   - Click "New" → "PostgreSQL"
   - Choose your plan (free tier available)

2. **Copy the connection string:**
   - Format: `postgresql://username:password@host:port/database`
   - Add it as `DATABASE_URL` in your web service

### Step 5: Deploy

1. **Render will automatically:**
   - Install dependencies for both backend and frontend
   - Build the React app
   - Start the Express server
   - Serve both API and frontend from the same domain

2. **Your app will be available at:**
   - **Main app**: `https://samna-salta-webapp.onrender.com`
   - **API health check**: `https://samna-salta-webapp.onrender.com/health`
   - **API endpoints**: `https://samna-salta-webapp.onrender.com/api/*`

## 🔍 Testing Your Deployment

### 1. Health Check
```bash
curl https://samna-salta-webapp.onrender.com/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "service": "samna-salta-api"
}
```

### 2. Frontend Access
- Visit `https://samna-salta-webapp.onrender.com`
- Should load the React app
- Test navigation and functionality

### 3. API Testing
```bash
# Test authentication
curl -X POST https://samna-salta-webapp.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

## 🛠️ Troubleshooting

### Common Issues:

1. **Build Failures:**
   - Check Render logs for specific errors
   - Verify all dependencies are in package.json
   - Ensure Node.js version compatibility

2. **Database Connection:**
   - Verify DATABASE_URL format
   - Check if database is accessible
   - Test connection locally first

3. **Frontend Not Loading:**
   - Check if React build completed successfully
   - Verify static files are being served
   - Check browser console for errors

4. **API Errors:**
   - Verify JWT_SECRET is set
   - Check CORS configuration
   - Test API endpoints directly

### Debugging:

1. **Check Render Logs:**
   - Go to your service in Render dashboard
   - Click "Logs" tab
   - Look for error messages

2. **Test Locally:**
   ```bash
   # Backend
   cd apps/backend
   npm install
   npm start

   # Frontend (in another terminal)
   cd apps/frontend
   npm install
   npm start
   ```

## 🔒 Security Considerations

1. **Environment Variables:**
   - Never commit sensitive data to git
   - Use Render's environment variable system
   - Rotate JWT_SECRET regularly

2. **Database Security:**
   - Use strong passwords
   - Enable SSL connections
   - Restrict database access

3. **API Security:**
   - Rate limiting is enabled
   - CORS is configured
   - JWT tokens are used for authentication

## 📈 Monitoring

1. **Render Dashboard:**
   - Monitor service health
   - Check resource usage
   - View logs

2. **Application Monitoring:**
   - Health check endpoint
   - Error logging
   - Performance metrics

## 🔄 Updates and Maintenance

### Updating Your App:
1. Push changes to GitHub
2. Render automatically redeploys
3. Monitor logs for any issues

### Environment Variable Changes:
1. Update in Render dashboard
2. Service will restart automatically
3. Test functionality after restart

## 📞 Support

- **Render Documentation**: https://docs.render.com
- **Render Support**: Available through dashboard
- **Community**: Render Discord and forums

## 🎉 Success!

Your Samna Salta web application is now deployed as a single service on Render!

**Your app URL**: `https://samna-salta-webapp.onrender.com` 