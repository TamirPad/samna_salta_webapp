# Samna Salta Webapp - Traditional Yemenite Food Ordering

A modern, responsive React webapp for ordering traditional Yemenite food products. Built with best practices, TypeScript, and ready for immediate deployment.

## 🎯 Features

### 🛒 **Customer Experience**
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Interactive Menu**: Beautiful product browsing with categories
- **Shopping Cart**: Add/remove items, modify quantities, real-time updates
- **Delivery Options**: Pickup (free) or delivery (+5₪) with address management
- **Order Tracking**: Real-time order status updates
- **Multi-language**: Hebrew and English support
- **Payment Integration**: Secure Stripe payment processing

### 👑 **Admin Dashboard**
- **Order Management**: View and manage all orders
- **Customer Database**: Track customer information and preferences
- **Analytics**: Sales reports and business insights
- **Product Management**: Add/edit products and categories
- **Real-time Updates**: Live order notifications

### 🍞 **Product Catalog**
- **Kubaneh** (Traditional Yemenite Bread) - 25₪
  - Classic, Seeded, Herb, Aromatic varieties
- **Samneh** (Clarified Butter) - 15₪
  - Smoked or Regular
- **Red Bisbas** (Spicy Sauce) - 12₪
  - Small or Large containers
- **Hilbeh** (Fenugreek Dip) - 18₪
  - Available Wednesday-Friday only
- **Hawaij Spices** - 8₪ each
  - Soup and Coffee varieties
- **White Coffee** (Traditional Drink) - 10₪

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Modern web browser

### Installation

```bash
# Clone the repository
git clone <your-repository>
cd samna-salta-webapp

# Install dependencies
npm install

# Start development server
npm start
```

The app will open at `http://localhost:3000`

### Build for Production

```bash
# Create production build
npm run build

# The build folder is ready for deployment
```

## 🏗️ Architecture

### **Frontend Stack**
- **React 18** with TypeScript
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Styled Components** for styling
- **Framer Motion** for animations
- **React Hook Form** for form handling
- **Axios** for API communication

### **Key Components**
```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── features/           # Redux slices and business logic
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── styles/             # Global styles and themes
└── assets/             # Images, icons, etc.
```

## 🚀 Deployment Options

### **Vercel (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts and your app will be live!
```

### **Netlify**
```bash
# Build the app
npm run build

# Deploy the build folder to Netlify
# Or connect your GitHub repository for automatic deployments
```

### **Firebase Hosting**
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and initialize
firebase login
firebase init hosting

# Build and deploy
npm run build
firebase deploy
```

### **Docker**
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## ⚙️ Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_key
REACT_APP_DEFAULT_LANGUAGE=he
REACT_APP_DELIVERY_CHARGE=5.00
REACT_APP_CURRENCY=ILS
```

### API Configuration
The app expects a backend API running on port 3001. Update the proxy in `package.json` or set `REACT_APP_API_URL` for production.

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

## 📱 Mobile Responsiveness

The app is fully responsive and optimized for:
- **Desktop**: Full-featured experience
- **Tablet**: Touch-optimized interface
- **Mobile**: Streamlined mobile-first design

## 🌐 Internationalization

- **Hebrew (RTL)**: Full right-to-left support
- **English (LTR)**: Left-to-right layout
- **Automatic Detection**: Detects user's preferred language
- **Fallback Support**: Graceful handling of missing translations

## 🔒 Security Features

- **Input Validation**: Client-side and server-side validation
- **XSS Protection**: React's built-in XSS protection
- **HTTPS**: Secure communication in production
- **Environment Variables**: Secure configuration management

## 📊 Performance

- **Code Splitting**: Automatic route-based code splitting with React.lazy()
- **Lazy Loading**: Components loaded on demand with Suspense
- **Memoization**: React.memo, useMemo, and useCallback for optimized re-renders
- **Service Worker**: Offline support and caching for better performance
- **Web Vitals**: Core Web Vitals monitoring and optimization
- **Image Optimization**: Optimized images and lazy loading
- **Caching**: Browser caching and service worker support
- **Performance Monitoring**: Built-in performance tracking utilities

## 🎨 Design System

### **Color Palette**
- Primary: #8B4513 (Saddle Brown)
- Secondary: #D2691E (Chocolate)
- Accent: #FFD700 (Gold)
- Background: #FFF8DC (Cornsilk)
- Text: #2F2F2F (Dark Gray)

### **Typography**
- Hebrew: Heebo, Noto Sans Hebrew
- English: Inter, system fonts
- Responsive font sizes
- Proper line heights and spacing

## 🔧 Development

### **Performance Optimizations**
- **React.memo**: Applied to Header component to prevent unnecessary re-renders
- **useMemo**: Optimized translations and data arrays in HomePage
- **useCallback**: Optimized event handlers in Header component
- **Lazy Loading**: All page components are lazy-loaded for better initial load time
- **Service Worker**: Added for offline support and caching
- **Web Vitals**: Integrated Core Web Vitals monitoring
- **Performance Utilities**: Created debounce, throttle, and performance tracking utilities

### **Code Quality**
```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

### **Available Scripts**
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App
- `npm run lint` - Run ESLint
- `npm run format` - Format with Prettier

## 📞 Support

For issues or questions:
- Check the browser console for errors
- Review the network tab for API issues
- Ensure all environment variables are set
- Verify the backend API is running

## 📄 License

MIT License - Perfect for commercial use.

---

**Modern React Webapp Solution**
*Built with best practices and ready for immediate deployment* 