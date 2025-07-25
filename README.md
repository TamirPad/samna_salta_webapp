# 🍞 Samna Salta - Traditional Yemenite Bakery

A modern web application for Samna Salta, a traditional Yemenite bakery offering fresh breads, pastries, and spices. Built with React, TypeScript, and Redux.

## 🚀 Features

### Customer Features
- **🍽️ Menu Browsing** - Browse products with categories and search
- **🛒 Shopping Cart** - Add items, manage quantities, and checkout
- **💳 Checkout Process** - Complete order placement with delivery options
- **📱 Order Tracking** - Real-time order status updates
- **🌐 Bilingual Support** - Hebrew and English interface
- **📱 Responsive Design** - Works on all devices

### Management Features
- **📊 Dashboard** - Business overview and analytics
- **🍽️ Product Management** - Add, edit, and manage products
- **📋 Order Management** - Track and update order statuses
- **👥 Customer Management** - View customer profiles and history
- **📈 Analytics** - Business insights and reporting

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript
- **State Management**: Redux Toolkit, Redux Persist
- **Styling**: Styled Components
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Notifications**: React Toastify
- **Form Handling**: React Hook Form

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
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development server**
   ```bash
   npm start
   ```

## 🚀 Deployment to Render

### Option 1: Using Render Dashboard (Recommended)

1. **Connect your GitHub repository**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Static Site"
   - Connect your GitHub account and select this repository

2. **Configure the deployment**
   - **Name**: `samna-salta-webapp`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
   - **Environment**: `Static Site`

3. **Set environment variables** (if needed)
   - `REACT_APP_API_URL`: Your backend API URL
   - `REACT_APP_ENVIRONMENT`: `production`

4. **Deploy**
   - Click "Create Static Site"
   - Render will automatically build and deploy your app

### Option 2: Using render.yaml (Advanced)

1. **Update render.yaml**
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

2. **Deploy via Git push**
   ```bash
   git add .
   git commit -m "Add Render deployment config"
   git push origin main
   ```

### Option 3: Using Docker

1. **Build and deploy with Docker**
   ```bash
   # Build the Docker image
   docker build -t samna-salta-webapp .
   
   # Run locally to test
   docker run -p 3000:3000 samna-salta-webapp
   ```

2. **Deploy to Render with Docker**
   - Use the Dockerfile in your Render service configuration
   - Set the Docker image as your deployment source

## 🔧 Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run deploy:render` - Build for Render deployment

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Header, Footer, etc.
│   └── LoadingSpinner.tsx
├── features/           # Redux slices and state management
│   ├── auth/          # Authentication
│   ├── cart/          # Shopping cart
│   ├── language/      # Internationalization
│   ├── orders/        # Order management
│   ├── products/      # Product management
│   ├── customers/     # Customer management
│   └── ui/            # UI state
├── hooks/             # Custom React hooks
├── pages/             # Page components
│   ├── admin/         # Management pages
│   └── ...            # Customer pages
├── store/             # Redux store configuration
├── styles/            # Global styles
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

## 🌐 Environment Variables

Create a `.env.local` file with the following variables:

```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_ENVIRONMENT=development
REACT_APP_VERSION=1.0.0
```

## 🔒 Security

- HTTPS enforced in production
- Security headers configured
- XSS protection enabled
- Content Security Policy implemented

## 📱 PWA Features

- Offline support (coming soon)
- Installable app
- Push notifications (coming soon)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Email**: info@sammasalta.co.il
- **Phone**: +972-3-123-4567
- **Address**: 123 Main Street, Tel Aviv, Israel

## 🙏 Acknowledgments

- Traditional Yemenite recipes and techniques
- React and TypeScript communities
- Open source contributors

---

**Made with ❤️ for Samna Salta Bakery** 