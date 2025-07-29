#!/bin/bash

# Samna Salta Webapp Database Initialization Script
# This script will create the new schema and all required tables

echo "🚀 Initializing Samna Salta Webapp Database..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set"
    echo "Please set DATABASE_URL before running this script"
    echo "Example: export DATABASE_URL='postgresql://user:password@host:port/database'"
    exit 1
fi

echo "📊 Using database: $DATABASE_URL"

# Run the SQL initialization script
echo "🔧 Creating schema and tables..."
psql "$DATABASE_URL" -f database_init.sql

if [ $? -eq 0 ]; then
    echo "✅ Database initialization completed successfully!"
    echo ""
    echo "📋 Summary:"
    echo "  - Schema: samna_salta_webapp"
    echo "  - Tables created: users, categories, products, customers, orders, order_items, etc."
    echo "  - Sample data inserted"
    echo "  - Indexes created for performance"
    echo ""
    echo "🔑 Default admin credentials:"
    echo "  - Email: admin@sammasalta.com"
    echo "  - Password: admin123"
    echo ""
    echo "🌐 You can now start your application!"
else
    echo "❌ Database initialization failed!"
    echo "Please check your DATABASE_URL and try again"
    exit 1
fi 