# Production Deployment Checklist

## ✅ Pre-Deployment Checklist

### Environment Variables (Set in Render Dashboard)

#### Single Web Service Environment Variables:
- [ ] `DATABASE_URL` - PostgreSQL connection string from Render
- [ ] `JWT_SECRET` - Strong random string for JWT token signing
- [ ] `NODE_ENV` - production (auto-set by render.yaml)
- [ ] `PORT` - 10000 (auto-set by render.yaml)
- [ ] `FRONTEND_URL` - https://samna-salta-webapp.onrender.com (auto-set)
- [ ] `LOG_LEVEL` - info (auto-set by render.yaml)

### Database Setup:
- [ ] PostgreSQL database created on Render
- [ ] Database connection string copied
- [ ] Database tables created (if using migrations)
- [ ] Initial data seeded (if needed)

### Security Checklist:
- [ ] JWT_SECRET is a strong random string (32+ characters)
- [ ] Database password is strong
- [ ] No sensitive data in code
- [ ] CORS properly configured
- [ ] Rate limiting enabled (built into server.js)

### Code Quality:
- [ ] All tests pass locally
- [ ] Build succeeds locally
- [ ] No console.log statements in production code
- [ ] Error handling implemented
- [ ] Logging configured

## 🚀 Deployment Steps

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for production deployment"
   git push origin main
   ```

2. **Deploy on Render**:
   - Go to Render Dashboard
   - Click "New" → "Blueprint"
   - Connect GitHub repository
   - Render will create the single web service

3. **Configure Environment Variables**:
   - Go to the web service in Render dashboard
   - Add `DATABASE_URL` environment variable
   - Add `JWT_SECRET` environment variable
   - Set your PostgreSQL connection string
   - Set a strong JWT secret

4. **Test Deployment**:
   - Check backend health: `https://samna-salta-webapp.onrender.com/health`
   - Test frontend: `https://samna-salta-webapp.onrender.com`
   - Verify API calls work

## 🔧 Post-Deployment

### Monitoring:
- [ ] Check Render logs for errors
- [ ] Monitor database connections
- [ ] Set up alerts (optional)

### Performance:
- [ ] Test API response times
- [ ] Check frontend loading speed
- [ ] Monitor memory usage

### Security:
- [ ] Test authentication flows
- [ ] Verify CORS is working
- [ ] Check rate limiting

## 🆘 Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check Node.js version compatibility
   - Verify all dependencies are in package.json
   - Check build logs in Render dashboard

2. **Database Connection**:
   - Verify DATABASE_URL format
   - Check if database is accessible
   - Test connection locally

3. **CORS Errors**:
   - Ensure FRONTEND_URL is correct
   - Check backend CORS configuration
   - Verify HTTPS URLs

4. **Environment Variables**:
   - Check variable names (case-sensitive)
   - Verify all required variables are set
   - Restart services after adding variables

## 📞 Support

- **Render Documentation**: https://docs.render.com
- **Render Support**: Available through dashboard
- **Community**: Render Discord and forums 