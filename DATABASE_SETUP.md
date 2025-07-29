# 🗄️ Database Setup Guide

This guide will help you set up the database for the Samna Salta webapp with the new `samna_salta_webapp` schema.

## 📋 Prerequisites

- PostgreSQL database (local or cloud)
- `psql` command-line tool installed
- Your database connection string

## 🚀 Quick Setup

### 1. Set Environment Variable

```bash
export DATABASE_URL="postgresql://username:password@host:port/database"
```

### 2. Run Database Initialization

```bash
./init_database.sh
```

Or manually:

```bash
psql "$DATABASE_URL" -f database_init.sql
```

## 📊 Database Schema

The new schema `samna_salta_webapp` includes the following tables:

### Core Tables
- **users** - User authentication and management
- **categories** - Product categories with multi-language support
- **products** - Menu items with pricing and descriptions
- **customers** - Customer profiles and information
- **orders** - Order management and tracking
- **order_items** - Individual items in orders

### Supporting Tables
- **order_status_updates** - Order status history
- **product_options** - Product customization options
- **product_option_values** - Available option values
- **order_item_options** - Selected options for order items
- **sessions** - User session management
- **analytics_events** - User behavior tracking

## 🔑 Default Credentials

After initialization, you'll have:

- **Admin User**: admin@sammasalta.com / admin123
- **Sample Products**: 7 traditional Yemenite dishes
- **Sample Categories**: Main Dishes, Appetizers, Beverages, Desserts

## 🔧 Backend Configuration

The backend is already configured to use the new schema. The database connection will automatically:

1. Set the search path to `samna_salta_webapp, public`
2. Use the new table names (products, categories, etc.)
3. Handle schema-specific queries

## 📈 Features Supported

### ✅ Menu Management
- Product listing with categories
- Multi-language support (English, Hebrew)
- Product images and descriptions
- Pricing and availability

### ✅ Order Management
- Order creation and tracking
- Multiple payment methods
- Delivery/pickup options
- Status updates

### ✅ Customer Management
- Customer profiles
- Order history
- Contact information

### ✅ Analytics
- Sales reports
- Popular products
- Revenue tracking
- Customer insights

### ✅ Admin Panel
- Product management
- Order management
- Customer management
- Analytics dashboard

## 🛠️ Troubleshooting

### Database Connection Issues

1. **Check DATABASE_URL format**:
   ```
   postgresql://username:password@host:port/database
   ```

2. **Test connection**:
   ```bash
   psql "$DATABASE_URL" -c "SELECT 1;"
   ```

3. **Check schema exists**:
   ```sql
   SELECT schema_name FROM information_schema.schemata;
   ```

### Permission Issues

If you get permission errors, ensure your database user has:

```sql
GRANT USAGE ON SCHEMA samna_salta_webapp TO your_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA samna_salta_webapp TO your_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA samna_salta_webapp TO your_user;
```

### Schema Migration

If you need to migrate from the old `public` schema:

1. **Backup existing data**:
   ```bash
   pg_dump "$DATABASE_URL" --schema=public > backup.sql
   ```

2. **Run initialization script** (creates new schema)

3. **Migrate data** (if needed):
   ```sql
   INSERT INTO samna_salta_webapp.products 
   SELECT * FROM public.products;
   ```

## 🔄 Development vs Production

### Development
- Uses sample data if no products exist
- Creates products from order items automatically
- Flexible schema updates

### Production
- Requires proper data migration
- Uses real customer and order data
- Strict schema validation

## 📝 Next Steps

1. **Start the backend server**:
   ```bash
   cd apps/backend && npm start
   ```

2. **Test the API endpoints**:
   ```bash
   curl http://localhost:3001/api/products
   curl http://localhost:3001/api/categories
   ```

3. **Start the frontend**:
   ```bash
   cd apps/frontend && npm start
   ```

4. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001
   - Admin: admin@sammasalta.com / admin123

## 🆘 Support

If you encounter issues:

1. Check the database logs
2. Verify the schema exists
3. Test individual table queries
4. Check the backend server logs

The application will automatically handle schema-specific queries and provide fallback data when needed. 