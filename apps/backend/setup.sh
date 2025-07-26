#!/bin/bash

# Samna Salta Backend Setup Script
# This script sets up the backend API with all necessary dependencies and configurations

set -e

echo "🚀 Setting up Samna Salta Backend API..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18 or higher."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18 or higher is required. Current version: $(node -v)"
        exit 1
    fi
    
    print_success "Node.js $(node -v) is installed"
}

# Check if npm is installed
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
    
    print_success "npm $(npm -v) is installed"
}

# Check if PostgreSQL is installed and running
check_postgres() {
    if ! command -v psql &> /dev/null; then
        print_warning "PostgreSQL is not installed. Please install PostgreSQL 15 or higher."
        print_warning "You can install it from: https://www.postgresql.org/download/"
        return 1
    fi
    
    # Check if PostgreSQL service is running
    if ! pg_isready -q; then
        print_warning "PostgreSQL service is not running. Please start PostgreSQL service."
        return 1
    fi
    
    print_success "PostgreSQL is installed and running"
    return 0
}

# Check if Redis is installed and running
check_redis() {
    if ! command -v redis-cli &> /dev/null; then
        print_warning "Redis is not installed. Please install Redis 7 or higher."
        print_warning "You can install it from: https://redis.io/download"
        return 1
    fi
    
    # Check if Redis service is running
    if ! redis-cli ping &> /dev/null; then
        print_warning "Redis service is not running. Please start Redis service."
        return 1
    fi
    
    print_success "Redis is installed and running"
    return 0
}

# Install dependencies
install_dependencies() {
    print_status "Installing npm dependencies..."
    npm install
    print_success "Dependencies installed successfully"
}

# Create environment file
setup_environment() {
    if [ ! -f .env ]; then
        print_status "Creating .env file from template..."
        cp env.example .env
        print_success ".env file created"
        print_warning "Please edit .env file with your configuration before starting the server"
    else
        print_status ".env file already exists"
    fi
}

# Create logs directory
create_logs_directory() {
    if [ ! -d logs ]; then
        print_status "Creating logs directory..."
        mkdir -p logs
        print_success "Logs directory created"
    else
        print_status "Logs directory already exists"
    fi
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    # Check if database exists
    if psql -lqt | cut -d \| -f 1 | grep -qw samna_salta; then
        print_status "Database 'samna_salta' already exists"
    else
        print_status "Creating database 'samna_salta'..."
        createdb samna_salta
        print_success "Database created successfully"
    fi
    
    # Run migrations
    print_status "Running database migrations..."
    npm run migrate
    print_success "Database migrations completed"
}

# Generate JWT secret
generate_jwt_secret() {
    if [ ! -f .env ]; then
        print_error ".env file not found. Please run setup again."
        exit 1
    fi
    
    # Check if JWT_SECRET is already set
    if grep -q "JWT_SECRET=your-super-secret-jwt-key-change-this-in-production" .env; then
        print_status "Generating JWT secret..."
        JWT_SECRET=$(openssl rand -base64 64)
        sed -i.bak "s/JWT_SECRET=your-super-secret-jwt-key-change-this-in-production/JWT_SECRET=$JWT_SECRET/" .env
        print_success "JWT secret generated and updated in .env"
    else
        print_status "JWT secret already configured"
    fi
}

# Main setup function
main() {
    print_status "Starting Samna Salta Backend setup..."
    
    # Check prerequisites
    check_node
    check_npm
    
    # Check optional services
    POSTGRES_AVAILABLE=false
    REDIS_AVAILABLE=false
    
    if check_postgres; then
        POSTGRES_AVAILABLE=true
    fi
    
    if check_redis; then
        REDIS_AVAILABLE=true
    fi
    
    # Install dependencies
    install_dependencies
    
    # Setup environment
    setup_environment
    
    # Create logs directory
    create_logs_directory
    
    # Generate JWT secret
    generate_jwt_secret
    
    # Setup database if PostgreSQL is available
    if [ "$POSTGRES_AVAILABLE" = true ]; then
        setup_database
    else
        print_warning "Skipping database setup. Please install and start PostgreSQL, then run: npm run migrate"
    fi
    
    print_success "Setup completed successfully!"
    
    echo ""
    echo "📋 Next steps:"
    echo "1. Edit .env file with your configuration"
    echo "2. Install and start PostgreSQL if not already done"
    echo "3. Install and start Redis if not already done"
    echo "4. Run 'npm run migrate' to set up the database"
    echo "5. Run 'npm run dev' to start the development server"
    echo ""
    echo "🔧 Available commands:"
    echo "  npm run dev     - Start development server"
    echo "  npm start       - Start production server"
    echo "  npm run migrate - Run database migrations"
    echo "  npm test        - Run tests"
    echo ""
    echo "📚 For more information, see README.md"
}

# Run main function
main "$@" 