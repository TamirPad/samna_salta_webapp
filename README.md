# Samna Salta - Traditional Yemenite Food Ordering Webapp

A modern, full-stack web application for ordering traditional Yemenite food, built with React, TypeScript, Node.js, and PostgreSQL.

## 🚀 Features

- **Multi-language Support**: Hebrew and English
- **Real-time Order Tracking**: Socket.IO integration
- **Secure Authentication**: JWT with session management
- **Responsive Design**: Mobile-first approach
- **Admin Dashboard**: Order management and analytics
- **Payment Integration**: Stripe payment processing
- **Image Upload**: Cloudinary integration
- **Caching**: Redis for performance optimization
- **Comprehensive Testing**: Unit and integration tests

## 🏗️ Architecture

```
samna_salta_webapp/
├── apps/
│   ├── frontend/          # React TypeScript application
│   └── backend/           # Node.js Express API
├── packages/
│   └── common/            # Shared types and utilities
├── docker-compose.yml     # Development environment
├── nginx.conf            # Production reverse proxy
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Styled Components** for styling
- **Framer Motion** for animations
- **Axios** for API communication

### Backend
- **Node.js** with Express
- **PostgreSQL** database
- **Redis** for caching and sessions
- **JWT** for authentication
- **Socket.IO** for real-time features
- **Winston** for logging
- **Jest** for testing

### DevOps
- **Docker** containerization
- **Nginx** reverse proxy
- **PM2** process management
- **GitHub Actions** CI/CD

## 📋 Prerequisites

- Node.js 18+ 
- npm 8+
- Docker and Docker Compose
- PostgreSQL 15+
- Redis 7+

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/samna-salta-webapp.git
cd samna-salta-webapp
```

### 2. Environment Setup

Copy the environment example file:

```bash
cp env.example .env
```

Update the `.env` file with your configuration:

```env
# Application Configuration
NODE_ENV=development
PORT=3001

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=samna_salta
DB_USER=postgres
DB_PASSWORD=your_secure_password_here

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_minimum_32_characters

# Frontend Configuration
FRONTEND_URL=http://localhost:3000
REACT_APP_API_URL=http://localhost:3001

# Optional: External Services
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 3. Install Dependencies

```bash
npm run install:all
```

### 4. Database Setup

#### Option A: Using Docker (Recommended)

```bash
# Start PostgreSQL and Redis
docker-compose up db redis -d

# Run database migrations
npm run migrate --workspace=apps/backend
```

#### Option B: Local Installation

1. Install PostgreSQL and Redis locally
2. Create database: `createdb samna_salta`
3. Run migrations: `npm run migrate --workspace=apps/backend`

### 5. Start Development Servers

```bash
# Start both frontend and backend
npm run dev

# Or start individually
npm run dev:frontend
npm run dev:backend
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

## 🧪 Testing

### Run All Tests

```bash
npm run test
```

### Frontend Tests

```bash
npm run test:frontend
```

### Backend Tests

```bash
npm run test:backend
```

### Test Coverage

```bash
npm run test:coverage
```

## 🐳 Docker Development

### Start All Services

```bash
docker-compose up
```

### Build Images

```bash
docker-compose build
```

### View Logs

```bash
docker-compose logs -f
```

## 🏭 Production Deployment

### 1. Environment Configuration

Create a production `.env` file with secure values:

```env
NODE_ENV=production
JWT_SECRET=your_very_long_and_secure_jwt_secret_at_least_32_characters
DB_HOST=your_production_db_host
DB_PASSWORD=your_secure_db_password
REDIS_URL=redis://your_redis_host:6379
FRONTEND_URL=https://your-domain.com
```

### 2. Database Setup

```bash
# Run migrations
npm run migrate --workspace=apps/backend

# Optional: Seed data
npm run seed --workspace=apps/backend
```

### 3. Build for Production

```bash
# Build all applications
npm run build

# Or build individually
npm run build:frontend
npm run build:backend
```

### 4. Deployment Options

#### Option A: Docker Production

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

#### Option B: Manual Deployment

1. **Backend Deployment**:
   ```bash
   cd apps/backend
   npm install --production
   npm start
   ```

2. **Frontend Deployment**:
   ```bash
   cd apps/frontend
   npm install --production
   npm run build
   # Serve build folder with nginx or similar
   ```

#### Option C: Cloud Platforms

- **Vercel**: Frontend deployment
- **Railway**: Full-stack deployment
- **Render**: Full-stack deployment
- **Heroku**: Full-stack deployment

## 🔒 Security Considerations

### Environment Variables
- Use strong, unique JWT secrets (32+ characters)
- Never commit `.env` files to version control
- Use different secrets for development and production
- Rotate secrets regularly

### Database Security
- Use strong database passwords
- Enable SSL connections in production
- Restrict database access to application servers
- Regular database backups

### API Security
- Rate limiting enabled
- CORS properly configured
- Input validation on all endpoints
- SQL injection prevention with parameterized queries
- XSS protection with helmet

### Frontend Security
- Content Security Policy (CSP) headers
- HTTPS only in production
- Secure cookie settings
- Input sanitization

## 📊 Monitoring and Logging

### Application Logs
- Winston logger configured
- Log rotation enabled
- Error tracking and alerting
- Performance monitoring

### Health Checks
- `/health` endpoint for monitoring
- Database connection status
- Redis connection status
- Memory usage monitoring

## 🔧 Development Guidelines

### Code Style
- ESLint and Prettier configured
- TypeScript strict mode enabled
- Consistent naming conventions
- Comprehensive error handling

### Git Workflow
- Feature branch workflow
- Conventional commits
- Pull request reviews
- Automated testing on PR

### Testing Strategy
- Unit tests for utilities and components
- Integration tests for API endpoints
- E2E tests for critical user flows
- Test coverage requirements

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check database credentials
   - Ensure PostgreSQL is running
   - Verify network connectivity

2. **Redis Connection Failed**
   - Check Redis server status
   - Verify Redis URL configuration
   - Application will fallback to in-memory storage

3. **Build Failures**
   - Clear node_modules and reinstall
   - Check TypeScript compilation errors
   - Verify all dependencies are installed

4. **Test Failures**
   - Ensure test database is configured
   - Check test environment variables
   - Verify test data setup

### Debug Mode

Enable debug logging:

```bash
LOG_LEVEL=debug npm run dev
```

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Product Endpoints
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Order Endpoints
- `GET /api/orders` - Get orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details
- `PATCH /api/orders/:id/status` - Update order status

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact: support@sammasalta.com
- Documentation: [Wiki](https://github.com/yourusername/samna-salta-webapp/wiki)

## 🙏 Acknowledgments

- Traditional Yemenite recipes and inspiration
- Open source community contributions
- Modern web development best practices 