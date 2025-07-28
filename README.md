# 🍽️ Samna Salta Restaurant

A modern restaurant ordering system with both **complex** and **simple** versions.

## 🎯 Choose Your Version

### 🚀 **Simple Version (KISS) - Recommended**
- **5-minute setup**
- **10 files total**
- **8 dependencies**
- **Perfect for learning and quick deployment**

### 🏗️ **Complex Version (Full-featured)**
- **Monorepo structure**
- **100+ files**
- **50+ dependencies**
- **Full admin panel, analytics, payments**

---

## 🚀 Quick Start (Simple Version)

### 1. **Backend Setup**
```bash
cd simple-backend
npm install
cp env.example .env
npm start
```

### 2. **Frontend Setup**
```bash
cd simple-frontend
npm install
npm start
```

### 3. **Database Setup**
```sql
-- Run this in your PostgreSQL database
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  customer_name VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL
);

-- Add sample data
INSERT INTO products (name, price, description) VALUES
('Falafel Plate', 25.00, 'Fresh falafel with hummus and salad'),
('Shawarma', 30.00, 'Chicken shawarma with tahini'),
('Hummus', 15.00, 'Fresh hummus with olive oil');
```

### 4. **Environment Variables**
```env
NODE_ENV=development
PORT=3001
JWT_SECRET=your-secret-key
DATABASE_URL=postgresql://postgres:password@localhost:5432/samna_salta
```

### 5. **Access the App**
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **Login**: admin@sammasalta.com (any password in development)

---

## 🏗️ Full Version Setup

### 1. **Install Dependencies**
```bash
npm install
```

### 2. **Environment Setup**
```bash
cp apps/backend/env.example apps/backend/.env
```

### 3. **Database Setup**
```bash
# Using Docker (recommended)
docker-compose up db redis -d

# Or local PostgreSQL
createdb samna_salta
```

### 4. **Start Development**
```bash
npm run dev
```

### 5. **Access the App**
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **Admin**: admin@sammasalta.com

---

## 📊 Version Comparison

| Feature | Simple | Complex |
|---------|--------|---------|
| **Setup Time** | 5 minutes | 30 minutes |
| **Files** | 10 | 100+ |
| **Dependencies** | 8 | 50+ |
| **Environment Vars** | 4 | 20+ |
| **Features** | Core ordering | Full admin panel |
| **Deployment** | Simple | Complex |
| **Maintenance** | Low | High |

---

## 🎯 Features

### ✅ **Simple Version**
- User login
- Menu display
- Shopping cart
- Order placement
- Responsive design

### ✅ **Complex Version**
- Full admin panel
- Analytics dashboard
- Payment processing
- File uploads
- Email notifications
- SMS notifications
- User management
- Order tracking

---

## 🚀 Deployment

### **Simple Version (Render)**
```yaml
# render.yaml
services:
  - type: web
    name: samna-salta-simple
    env: node
    buildCommand: cd simple-backend && npm install
    startCommand: cd simple-backend && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        sync: false
      - key: JWT_SECRET
        sync: false
```

### **Complex Version (Render)**
```yaml
# render.yaml (included in repo)
services:
  - type: web
    name: samna-salta-app
    env: docker
    dockerfilePath: ./Dockerfile
```

---

## 🛠️ Development

### **Simple Version**
- Edit `simple-backend/server.js` for backend changes
- Edit `simple-frontend/src/App.js` for frontend changes
- Edit `simple-frontend/src/App.css` for styling

### **Complex Version**
- Backend: `apps/backend/src/`
- Frontend: `apps/frontend/src/`
- Shared: `packages/common/`

---

## 📁 Project Structure

### **Simple Version**
```
simple-backend/
├── server.js          # Single Express server
├── package.json       # Minimal dependencies
└── env.example        # 4 environment variables

simple-frontend/
├── src/
│   ├── App.js         # Single React component
│   ├── App.css        # Simple styles
│   └── index.js       # React entry point
└── package.json       # Minimal dependencies
```

### **Complex Version**
```
apps/
├── backend/           # Express.js API
├── frontend/          # React.js SPA
packages/
└── common/           # Shared utilities
```

---

## 🎉 Success!

Both versions provide a complete restaurant ordering system. Choose the **simple version** for quick deployment or learning, and the **complex version** for full-featured production use.

**Remember**: Start simple, add complexity only when needed! 🎯 