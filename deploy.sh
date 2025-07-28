#!/bin/bash

# Samna Salta Deployment Script for Render
echo "🚀 Samna Salta Deployment Script"
echo "=================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Error: This is not a git repository"
    echo "Please initialize git and push to GitHub first"
    exit 1
fi

# Check if remote origin exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "❌ Error: No remote origin found"
    echo "Please add a GitHub remote: git remote add origin <your-github-repo-url>"
    exit 1
fi

echo "✅ Git repository found"

# Check if all files are committed
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Warning: You have uncommitted changes"
    echo "Please commit your changes before deploying:"
    echo "  git add ."
    echo "  git commit -m 'Prepare for deployment'"
    echo "  git push origin main"
    exit 1
fi

echo "✅ All changes are committed"

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main

echo ""
echo "🎉 Ready for Render deployment!"
echo ""
echo "Next steps:"
echo "1. Go to https://dashboard.render.com"
echo "2. Click 'New' → 'Blueprint'"
echo "3. Connect your GitHub repository"
echo "4. Render will automatically create both services"
echo ""
echo "Don't forget to set up your environment variables:"
echo "- DATABASE_URL (PostgreSQL connection string)"
echo "- JWT_SECRET (secure random string)"
echo ""
echo "Your app will be available at:"
echo "- Frontend: https://samna-salta-frontend.onrender.com"
echo "- Backend: https://samna-salta-backend.onrender.com" 