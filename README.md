# 🍞 Samna Salta - Restaurant Delivery Webapp

A modern, responsive restaurant delivery webapp built with React, TypeScript, and Redux Toolkit. This application provides a complete ordering system for Samna Salta, a traditional Yemenite bakery and restaurant.

## ✨ Features

### Customer Features
- **Beautiful Homepage** - Showcase restaurant offerings with hero section and featured products
- **Interactive Menu** - Browse products by category with search and filtering
- **Shopping Cart** - Add/remove items, adjust quantities, and manage delivery options
- **Checkout Process** - Complete order form with customer details and payment options
- **Order Tracking** - Real-time order status updates with progress indicators
- **Bilingual Support** - Full Hebrew and English language support
- **Responsive Design** - Optimized for mobile, tablet, and desktop

### Admin Features
- **Dashboard Analytics** - Overview of orders, revenue, and customer metrics
- **Order Management** - View and manage all customer orders
- **Product Management** - Add, edit, and manage menu items
- **Customer Management** - View customer information and order history
- **Analytics & Reports** - Detailed business insights and performance metrics

## 🚀 Tech Stack

- **Frontend**: React 18, TypeScript, Styled Components
- **State Management**: Redux Toolkit with Redux Persist
- **Routing**: React Router DOM
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Forms**: React Hook Form
- **Notifications**: React Toastify
- **HTTP Client**: Axios

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/samna-salta-webapp.git
   cd samna-salta-webapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   Edit `.env.local` and add your configuration:
   ```env
   REACT_APP_API_URL=http://localhost:3001/api
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Header, Footer, etc.
│   └── LoadingSpinner.tsx
├── features/           # Redux slices and state management
│   ├── auth/          # Authentication state
│   ├── cart/          # Shopping cart state
│   ├── language/      # Language switching
│   ├── orders/        # Order management
│   ├── products/      # Product management
│   ├── customers/     # Customer management
│   └── ui/            # UI state (modals, notifications)
├── pages/             # Page components
│   ├── admin/         # Admin dashboard pages
│   ├── HomePage.tsx   # Landing page
│   ├── MenuPage.tsx   # Product catalog
│   ├── CartPage.tsx   # Shopping cart
│   ├── CheckoutPage.tsx # Order checkout
│   └── OrderTrackingPage.tsx # Order status
├── hooks/             # Custom React hooks
├── store/             # Redux store configuration
├── types/             # TypeScript type definitions
├── utils/             # Utility functions and API service
└── styles/            # Global styles
```

## 🎨 Design System

The app uses a consistent design system with:

- **Primary Colors**: Brown (#8B4513) and Orange (#D2691E)
- **Typography**: Modern, readable fonts with proper hierarchy
- **Spacing**: Consistent 8px grid system
- **Components**: Reusable styled components with variants
- **Animations**: Smooth transitions and micro-interactions

## 🌐 Internationalization

The app supports both Hebrew and English:

- **Hebrew (RTL)**: Full right-to-left layout support
- **English (LTR)**: Standard left-to-right layout
- **Dynamic Language Switching**: Toggle between languages
- **Localized Content**: All text and dates are properly localized

## 📱 Responsive Design

The app is fully responsive and optimized for:

- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

## 🔧 Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier

## 🚀 Deployment

### Netlify
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Deploy!

### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts

### Docker
```bash
# Build the image
docker build -t samna-salta-webapp .

# Run the container
docker run -p 3000:3000 samna-salta-webapp
```

## 🔌 API Integration

The app is designed to work with a RESTful API. Update the API endpoints in `src/utils/api.ts` to connect to your backend.

### Required API Endpoints

- `GET /api/products` - Get all products
- `GET /api/categories` - Get product categories
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status
- `GET /api/analytics` - Get business analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email info@samnasalta.com or create an issue in this repository.

## 🙏 Acknowledgments

- Traditional Yemenite recipes and culinary heritage
- React and TypeScript communities
- All contributors and supporters

---

**Made with ❤️ for Samna Salta** 