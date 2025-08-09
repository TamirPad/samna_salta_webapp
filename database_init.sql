-- =====================================================
-- Samna Salta Webapp Database Initialization
-- Schema: samna_salta_webapp
-- =====================================================

-- Create the schema
CREATE SCHEMA IF NOT EXISTS samna_salta_webapp;

-- Set the search path to use the new schema
SET search_path TO samna_salta_webapp, public;

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- CATEGORIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    name_he VARCHAR(100),
    description TEXT,
    description_en TEXT,
    description_he TEXT,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- PRODUCTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    name_he VARCHAR(100),
    description TEXT,
    description_en TEXT,
    description_he TEXT,
    price DECIMAL(10,2) NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    is_popular BOOLEAN DEFAULT false,
    is_new BOOLEAN DEFAULT false,
    preparation_time_minutes INTEGER DEFAULT 15,
    allergens TEXT[],
    nutritional_info JSONB,
    emoji VARCHAR(16),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- CUSTOMERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    telegram_id BIGINT,
    language VARCHAR(2) DEFAULT 'en' CHECK (language IN ('en', 'he')),
    delivery_address TEXT,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ORDERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_method VARCHAR(20) DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'online')),
    order_type VARCHAR(20) DEFAULT 'pickup' CHECK (order_type IN ('pickup', 'delivery')),
    delivery_address TEXT,
    delivery_instructions TEXT,
    notes TEXT,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    delivery_charge DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    stripe_payment_intent_id VARCHAR(255),
    estimated_delivery_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ORDER_ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    special_instructions TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ORDER_STATUS_UPDATES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS order_status_updates (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- PRODUCT_OPTIONS TABLE (for product customization)
-- =====================================================
CREATE TABLE IF NOT EXISTS product_options (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    name_he VARCHAR(100),
    price_adjustment DECIMAL(10,2) DEFAULT 0,
    is_required BOOLEAN DEFAULT false,
    max_selections INTEGER DEFAULT 1,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- PRODUCT_OPTION_VALUES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS product_option_values (
    id SERIAL PRIMARY KEY,
    option_id INTEGER REFERENCES product_options(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    name_he VARCHAR(100),
    price_adjustment DECIMAL(10,2) DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ORDER_ITEM_OPTIONS TABLE (to track selected options)
-- =====================================================
CREATE TABLE IF NOT EXISTS order_item_options (
    id SERIAL PRIMARY KEY,
    order_item_id INTEGER REFERENCES order_items(id) ON DELETE CASCADE,
    option_id INTEGER REFERENCES product_options(id) ON DELETE SET NULL,
    option_value_id INTEGER REFERENCES product_option_values(id) ON DELETE SET NULL,
    option_name VARCHAR(100) NOT NULL,
    option_value_name VARCHAR(100) NOT NULL,
    price_adjustment DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SESSIONS TABLE (for user sessions)
-- =====================================================
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ANALYTICS_EVENTS TABLE (for tracking user behavior)
-- =====================================================
CREATE TABLE IF NOT EXISTS analytics_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(display_order);

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_popular ON products(is_popular);
CREATE INDEX IF NOT EXISTS idx_products_display_order ON products(display_order);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- Customers indexes
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_telegram_id ON customers(telegram_id);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Order items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Order status updates indexes
CREATE INDEX IF NOT EXISTS idx_order_status_updates_order_id ON order_status_updates(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_updates_created_at ON order_status_updates(created_at);

-- Product options indexes
CREATE INDEX IF NOT EXISTS idx_product_options_product_id ON product_options(product_id);

-- Sessions indexes
CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- Analytics events indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Insert default admin user (password: admin123)
INSERT INTO users (name, email, password_hash, role) 
SELECT 'Admin User', 'admin@sammasalta.com', '$2b$10$rQZ8K9mN2pL4vX7cF1hJ3wE5tY6uI8oP9qR0sA1bC2dE3fG4hI5jK6lM7nO8pQ', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@sammasalta.com');

-- Insert default categories
INSERT INTO categories (name, name_en, name_he, description, display_order) 
SELECT 'Main Dishes', 'Main Dishes', 'מנות עיקריות', 'Traditional Yemenite main courses', 1
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Main Dishes');

INSERT INTO categories (name, name_en, name_he, description, display_order) 
SELECT 'Appetizers', 'Appetizers', 'מנות פתיחה', 'Fresh starters and salads', 2
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Appetizers');

INSERT INTO categories (name, name_en, name_he, description, display_order) 
SELECT 'Beverages', 'Beverages', 'משקאות', 'Hot and cold drinks', 3
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Beverages');

INSERT INTO categories (name, name_en, name_he, description, display_order) 
SELECT 'Desserts', 'Desserts', 'קינוחים', 'Sweet treats and desserts', 4
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Desserts');

-- Insert sample products
INSERT INTO products (name, name_en, name_he, description, description_en, description_he, price, category_id, is_popular, preparation_time_minutes, image_url, emoji) 
SELECT 'Shawarma', 'Shawarma', 'שווארמה', 'Traditional Yemenite shawarma with fresh vegetables', 'Traditional Yemenite shawarma with fresh vegetables', 'שווארמה תימנית מסורתית עם ירקות טריים', 25.00, 1, true, 15, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop', '🥙'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Shawarma');

INSERT INTO products (name, name_en, name_he, description, description_en, description_he, price, category_id, is_popular, preparation_time_minutes, image_url, emoji) 
SELECT 'Falafel Plate', 'Falafel Plate', 'פלאפל צלחת', 'Fresh falafel with hummus, tahini, and mixed salad', 'Fresh falafel with hummus, tahini, and mixed salad', 'פלאפל טרי עם חומוס, טחינה וסלט מעורב', 22.00, 1, true, 12, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop', '🧆'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Falafel Plate');

INSERT INTO products (name, name_en, name_he, description, description_en, description_he, price, category_id, is_popular, preparation_time_minutes, image_url, emoji) 
SELECT 'Hummus', 'Hummus', 'חומוס', 'Creamy hummus with olive oil and zaatar', 'Creamy hummus with olive oil and zaatar', 'חומוס קרמי עם שמן זית וזעתר', 15.00, 2, false, 5, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop', '🥣'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Hummus');

INSERT INTO products (name, name_en, name_he, description, description_en, description_he, price, category_id, is_popular, preparation_time_minutes, image_url, emoji) 
SELECT 'Fresh Salad', 'Fresh Salad', 'סלט טרי', 'Mixed vegetables with lemon dressing', 'Mixed vegetables with lemon dressing', 'ירקות מעורבים עם רוטב לימון', 12.00, 2, false, 3, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop', '🥗'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Fresh Salad');

INSERT INTO products (name, name_en, name_he, description, description_en, description_he, price, category_id, is_popular, preparation_time_minutes, image_url, emoji) 
SELECT 'Tea', 'Tea', 'תה', 'Traditional Yemenite tea', 'Traditional Yemenite tea', 'תה תימני מסורתי', 8.00, 3, false, 2, 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop', '☕'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Tea');

INSERT INTO products (name, name_en, name_he, description, description_en, description_he, price, category_id, is_popular, preparation_time_minutes, image_url, emoji) 
SELECT 'Coffee', 'Coffee', 'קפה', 'Strong Arabic coffee', 'Strong Arabic coffee', 'קפה ערבי חזק', 10.00, 3, false, 3, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop', '☕'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Coffee');

INSERT INTO products (name, name_en, name_he, description, description_en, description_he, price, category_id, is_popular, preparation_time_minutes, image_url, emoji) 
SELECT 'Baklava', 'Baklava', 'בקלווה', 'Sweet pastry with nuts and honey', 'Sweet pastry with nuts and honey', 'מאפה מתוק עם אגוזים ודבש', 18.00, 4, false, 5, 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop', '🍰'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Baklava');

-- Insert sample customer
INSERT INTO customers (name, email, phone, language) 
SELECT 'John Doe', 'john@example.com', '+972501234567', 'en'
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE email = 'john@example.com');

-- Insert sample orders
INSERT INTO orders (order_number, customer_id, customer_name, customer_phone, customer_email, status, payment_status, payment_method, order_type, total, delivery_address, notes, created_at) 
SELECT 'ORD-001', 1, 'John Doe', '+972501234567', 'john@example.com', 'delivered', 'paid', 'cash', 'pickup', 47.00, NULL, 'Extra tahini please', NOW() - INTERVAL '2 days'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE order_number = 'ORD-001');

INSERT INTO orders (order_number, customer_id, customer_name, customer_phone, customer_email, status, payment_status, payment_method, order_type, total, delivery_address, notes, created_at) 
SELECT 'ORD-002', 1, 'John Doe', '+972501234567', 'john@example.com', 'delivered', 'paid', 'card', 'delivery', 35.00, '123 Main St, Tel Aviv', 'No onions', NOW() - INTERVAL '1 day'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE order_number = 'ORD-002');

INSERT INTO orders (order_number, customer_id, customer_name, customer_phone, customer_email, status, payment_status, payment_method, order_type, total, delivery_address, notes, created_at) 
SELECT 'ORD-003', 1, 'John Doe', '+972501234567', 'john@example.com', 'preparing', 'paid', 'cash', 'pickup', 28.00, NULL, 'Extra spicy', NOW() - INTERVAL '2 hours'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE order_number = 'ORD-003');

INSERT INTO orders (order_number, customer_id, customer_name, customer_phone, customer_email, status, payment_status, payment_method, order_type, total, delivery_address, notes, created_at) 
SELECT 'ORD-004', 1, 'John Doe', '+972501234567', 'john@example.com', 'pending', 'pending', 'cash', 'pickup', 42.00, NULL, 'Extra hummus', NOW() - INTERVAL '30 minutes'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE order_number = 'ORD-004');

-- Insert sample order items
INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, notes) 
SELECT 1, 1, 1, 25.00, 25.00, 'Extra tahini'
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 1 AND product_id = 1);

INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, notes) 
SELECT 1, 3, 1, 15.00, 15.00, NULL
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 1 AND product_id = 3);

INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, notes) 
SELECT 1, 5, 1, 7.00, 7.00, NULL
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 1 AND product_id = 5);

INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, notes) 
SELECT 2, 2, 1, 22.00, 22.00, 'No onions'
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 2 AND product_id = 2);

INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, notes) 
SELECT 2, 4, 1, 12.00, 12.00, NULL
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 2 AND product_id = 4);

INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, notes) 
SELECT 2, 6, 1, 1.00, 1.00, NULL
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 2 AND product_id = 6);

INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, notes) 
SELECT 3, 1, 1, 25.00, 25.00, 'Extra spicy'
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 3 AND product_id = 1);

INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, notes) 
SELECT 3, 5, 1, 3.00, 3.00, NULL
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 3 AND product_id = 5);

INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, notes) 
SELECT 4, 2, 1, 22.00, 22.00, 'Extra hummus'
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 4 AND product_id = 2);

INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, notes) 
SELECT 4, 3, 1, 15.00, 15.00, NULL
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 4 AND product_id = 3);

INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, notes) 
SELECT 4, 5, 1, 5.00, 5.00, NULL
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 4 AND product_id = 5);

-- =====================================================
-- GRANTS AND PERMISSIONS
-- =====================================================

-- Grant permissions to the schema (adjust as needed for your database user)
-- GRANT USAGE ON SCHEMA samna_salta_webapp TO your_db_user;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA samna_salta_webapp TO your_db_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA samna_salta_webapp TO your_db_user;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify tables were created
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'samna_salta_webapp'
ORDER BY table_name;

-- Verify sample data
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Categories', COUNT(*) FROM categories
UNION ALL
SELECT 'Products', COUNT(*) FROM products
UNION ALL
SELECT 'Customers', COUNT(*) FROM customers
UNION ALL
SELECT 'Orders', COUNT(*) FROM orders
UNION ALL
SELECT 'Order Items', COUNT(*) FROM order_items;

-- =====================================================
-- END OF DATABASE INITIALIZATION
-- ===================================================== 