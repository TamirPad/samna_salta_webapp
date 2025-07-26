#!/bin/bash

echo "🚀 Setting up Samna Salta Development Environment"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file with development defaults..."
    cat > .env << EOF
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=samna_salta
DB_USER=postgres
DB_PASSWORD=password

# Redis Configuration
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=dev-secret-key-change-in-production

# Frontend Configuration
FRONTEND_URL=http://localhost:3000

# Environment
NODE_ENV=development
PORT=3001

# Optional: Stripe Configuration (for payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

# Optional: Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Optional: Twilio Configuration (for SMS)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Optional: SMTP Configuration (for emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_app_password
EOF
    echo "✅ .env file created successfully!"
else
    echo "✅ .env file already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo "📦 Installing frontend dependencies..."
cd apps/frontend && npm install && cd ../..

echo "📦 Installing backend dependencies..."
cd apps/backend && npm install && cd ../..

echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Start the frontend: npm run dev:frontend"
echo "2. Start the backend: npm run dev:backend"
echo "3. Or start both: npm run dev"
echo ""
echo "🌐 Frontend will be available at: http://localhost:3000"
echo "🔧 Backend API will be available at: http://localhost:3001"
echo "💚 Health check: http://localhost:3001/health" 