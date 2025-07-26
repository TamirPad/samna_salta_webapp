# Samna Salta - Traditional Yemenite Food Ordering Webapp

A modern, full-stack web application for ordering traditional Yemenite food, built with React, TypeScript, Node.js, and Express in a monorepo structure.

## 🏗️ Project Structure

```
samna-salta-webapp/
├── apps/
│   ├── frontend/          # React frontend application
│   │   ├── src/
│   │   ├── public/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── backend/           # Node.js/Express backend API
│       ├── src/
│       ├── package.json
│       └── Dockerfile
├── packages/
│   └── common/            # Shared types, utilities, and constants
│       ├── src/
│       ├── package.json
│       └── tsconfig.json
├── scripts/               # Build and deployment scripts
├── package.json           # Root workspace configuration
├── tsconfig.base.json     # Base TypeScript configuration
├── docker-compose.yml     # Docker services configuration
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0
- Docker (optional, for containerized development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd samna-salta-webapp
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install app-specific dependencies
   npm run install:all
   ```

3. **Build shared packages**
   ```bash
   npm run build --workspace=packages/common
   ```

4. **Set up environment variables**
   ```bash
   # Copy environment examples
   cp env.example .env
   cp apps/backend/env.example apps/backend/.env
   
   # Edit the files with your configuration
   ```

### Development

#### Start both frontend and backend
```bash
npm run dev
```

#### Start individual services
```bash
# Frontend only
npm run dev:frontend

# Backend only
npm run dev:backend
```

#### Build for production
```bash
# Build all apps
npm run build

# Build individual apps
npm run build:frontend
npm run build:backend
```

### Testing

```bash
# Run all tests
npm run test

# Run tests for specific apps
npm run test:frontend
npm run test:backend
```

### Linting and Type Checking

```bash
# Lint all code
npm run lint

# Fix linting issues
npm run lint:fix

# Type check all code
npm run type-check
```

## 🐳 Docker Development

### Start all services
```bash
docker-compose up
```

### Build and start specific services
```bash
# Frontend only
docker-compose up frontend

# Backend only
docker-compose up backend

# Database and Redis
docker-compose up db redis
```

### Stop all services
```bash
docker-compose down
```

## 📦 Package Structure

### Frontend (`apps/frontend/`)
- **React 18** with TypeScript
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Styled Components** for styling
- **Framer Motion** for animations
- **React Hook Form** for form handling

### Backend (`apps/backend/`)
- **Node.js** with Express
- **PostgreSQL** database
- **Redis** for caching and sessions
- **JWT** authentication
- **Stripe** payment processing
- **Multer** for file uploads
- **Winston** for logging

### Common Package (`packages/common/`)
- **Shared TypeScript types** for User, Product, Order, etc.
- **Utility functions** for validation, formatting, etc.
- **Constants** for API endpoints, error messages, etc.
- **Reusable code** between frontend and backend

## 🔧 Available Scripts

### Root Level
- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build all applications
- `npm run test` - Run tests for all applications
- `npm run lint` - Lint all code
- `npm run type-check` - Type check all code
- `npm run clean` - Clean build artifacts
- `npm run setup` - Complete setup including backend initialization

### Frontend (`apps/frontend/`)
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run type-check` - Type check

### Backend (`apps/backend/`)
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with sample data

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Orders
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order status (admin)

### Admin
- `GET /api/admin/analytics` - Get analytics data
- `GET /api/admin/customers` - Get all customers
- `GET /api/admin/orders` - Get all orders

## 🗄️ Database Schema

### Users
- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `name` (String)
- `role` (Enum: 'customer', 'admin')
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### Products
- `id` (UUID, Primary Key)
- `name` (String)
- `description` (Text)
- `price` (Decimal)
- `category` (String)
- `image_url` (String, Optional)
- `available` (Boolean)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### Orders
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `total` (Decimal)
- `status` (Enum: 'pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')
- `delivery_address` (Text, Optional)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### Order Items
- `id` (UUID, Primary Key)
- `order_id` (UUID, Foreign Key)
- `product_id` (UUID, Foreign Key)
- `quantity` (Integer)
- `price` (Decimal)

## 🔐 Environment Variables

### Root Level
- `NODE_ENV` - Environment (development, production, test)

### Frontend
- `REACT_APP_API_URL` - Backend API URL
- `REACT_APP_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `REACT_APP_GOOGLE_MAPS_API_KEY` - Google Maps API key

### Backend
- `PORT` - Server port (default: 3001)
- `DB_HOST` - Database host
- `DB_PORT` - Database port
- `DB_NAME` - Database name
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `REDIS_URL` - Redis connection URL
- `JWT_SECRET` - JWT secret key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `CLOUDINARY_URL` - Cloudinary connection URL

## 🚀 Deployment

### Frontend Deployment
The frontend can be deployed to:
- **Netlify** (configured with `netlify.toml`)
- **Vercel** (configured with `vercel.json`)
- **Render** (configured with `render.yaml`)

### Backend Deployment
The backend can be deployed to:
- **Render** (configured with `render.yaml`)
- **Heroku** (using the provided Dockerfile)
- **AWS ECS** (using the provided Dockerfile)

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose -f docker-compose.yml up -d

# Or build individual services
docker build -f apps/frontend/Dockerfile -t samna-salta-frontend .
docker build -f apps/backend/Dockerfile -t samna-salta-backend .
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@samna-salta.com or create an issue in the repository.

## 🔄 Changelog

### v1.0.0 - Initial Release
- Monorepo structure with React frontend and Node.js backend
- User authentication and authorization
- Product catalog and ordering system
- Admin dashboard for order management
- Payment integration with Stripe
- Docker support for development and deployment 