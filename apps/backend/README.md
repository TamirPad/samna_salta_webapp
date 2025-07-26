# Samna Salta Backend API

A comprehensive Node.js/Express backend API for the Samna Salta traditional Yemenite food ordering platform.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Product Management**: CRUD operations for products and categories
- **Order Management**: Complete order lifecycle with real-time updates
- **Payment Processing**: Stripe integration for online payments
- **Customer Management**: Customer profiles and order history
- **Analytics & Reporting**: Business insights and sales reports
- **File Upload**: Cloudinary integration for image management
- **Real-time Updates**: Socket.IO for live order status updates
- **Caching**: Redis for session management and data caching
- **Database**: PostgreSQL with proper indexing and relationships

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Authentication**: JWT + bcryptjs
- **Payment**: Stripe
- **File Storage**: Cloudinary
- **Real-time**: Socket.IO
- **Validation**: express-validator
- **Logging**: Winston
- **Testing**: Jest

## 📋 Prerequisites

- Node.js 18 or higher
- PostgreSQL 15
- Redis 7
- Stripe account
- Cloudinary account

## 🔧 Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=3001
   FRONTEND_URL=http://localhost:3000

   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=samna_salta
   DB_USER=postgres
   DB_PASSWORD=password

   # Redis Configuration
   REDIS_URL=redis://localhost:6379

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

   # Stripe Configuration
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Set up the database**
   ```bash
   # Create database
   createdb samna_salta
   
   # Run migrations
   npm run migrate
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 🗄️ Database Schema

### Users
- Authentication and user management
- Role-based access control (admin/user)

### Categories
- Product categorization
- Multi-language support (English, Hebrew)

### Products
- Product information with pricing
- Multi-language descriptions
- Image management
- Availability and popularity flags

### Customers
- Customer profiles
- Order history tracking

### Orders
- Complete order lifecycle
- Multiple payment methods
- Delivery/pickup options
- Status tracking

### Order Items
- Individual items in orders
- Quantity and pricing

### Order Status Updates
- Order status history
- Timestamp tracking

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Categories
- `GET /api/products/categories` - Get all categories
- `POST /api/products/categories` - Create category (admin)
- `PUT /api/products/categories/:id` - Update category (admin)
- `DELETE /api/products/categories/:id` - Delete category (admin)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details
- `GET /api/orders` - Get all orders (admin)
- `PATCH /api/orders/:id/status` - Update order status (admin)
- `POST /api/orders/:id/confirm-payment` - Confirm payment
- `POST /api/orders/:id/cancel` - Cancel order (admin)

### Customers
- `GET /api/customers` - Get all customers (admin)
- `GET /api/customers/:id` - Get customer details (admin)
- `PUT /api/customers/:id` - Update customer (admin)
- `DELETE /api/customers/:id` - Delete customer (admin)

### Analytics
- `GET /api/analytics/dashboard` - Dashboard analytics (admin)
- `GET /api/analytics/sales` - Sales reports (admin)
- `GET /api/analytics/products` - Product analytics (admin)
- `GET /api/analytics/customers` - Customer analytics (admin)

### File Upload
- `POST /api/upload/image` - Upload image (admin)
- `DELETE /api/upload/image/:public_id` - Delete image (admin)
- `GET /api/upload/image/:public_id` - Get image info (admin)

## 🔐 Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Admin Access
Admin routes require the `isAdmin` flag to be true in the user's JWT token.

## 💳 Payment Processing

The API integrates with Stripe for payment processing:

1. Create order with `payment_method: 'online'`
2. Receive payment intent from API
3. Process payment on frontend using Stripe Elements
4. Confirm payment with payment intent ID

## 📊 Real-time Updates

Socket.IO is used for real-time order status updates:

```javascript
// Join order room
socket.emit('join-order-room', orderId);

// Listen for updates
socket.on('order-update', (data) => {
  console.log('Order updated:', data);
});
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📝 Logging

The API uses Winston for structured logging:

- **Error logs**: `logs/error.log`
- **Combined logs**: `logs/combined.log`
- **Console output**: Development mode only

## 🚀 Deployment

### Docker
```bash
# Build image
docker build -t samna-salta-backend .

# Run container
docker run -p 3001:3001 samna-salta-backend
```

### Environment Variables
Make sure to set all required environment variables in production:

- `NODE_ENV=production`
- `JWT_SECRET` (strong secret key)
- Database credentials
- Redis URL
- Stripe keys
- Cloudinary credentials

## 🔧 Development

### Scripts
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with sample data
- `npm test` - Run tests

### Code Structure
```
src/
├── config/          # Database and Redis configuration
├── middleware/      # Express middleware
├── routes/          # API routes
├── utils/           # Utility functions
├── database/        # Database migrations and seeds
└── server.js        # Main server file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@sammasalta.com or create an issue in the repository. 