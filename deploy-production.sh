#!/bin/bash

# Production Deployment Script for Samna Salta
# This script handles the complete production deployment process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="samna-salta"
ENVIRONMENT="production"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Logging
LOG_FILE="deploy-${TIMESTAMP}.log"

echo -e "${BLUE}🚀 Starting production deployment for ${PROJECT_NAME}${NC}"
echo -e "${BLUE}📝 Logging to: ${LOG_FILE}${NC}"

# Function to log messages
log() {
    echo -e "$1" | tee -a "$LOG_FILE"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Pre-deployment checks
log "${YELLOW}🔍 Running pre-deployment checks...${NC}"

# Check required tools
if ! command_exists docker; then
    log "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

if ! command_exists docker-compose; then
    log "${RED}❌ Docker Compose is not installed${NC}"
    exit 1
fi

if ! command_exists node; then
    log "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

if ! command_exists npm; then
    log "${RED}❌ npm is not installed${NC}"
    exit 1
fi

log "${GREEN}✅ All required tools are available${NC}"

# Check environment file
if [ ! -f ".env.production" ]; then
    log "${RED}❌ Production environment file (.env.production) not found${NC}"
    log "${YELLOW}💡 Please copy env.production.example to .env.production and configure it${NC}"
    exit 1
fi

log "${GREEN}✅ Environment file found${NC}"

# Load environment variables
log "${YELLOW}📋 Loading environment variables...${NC}"
set -a
source .env.production
set +a

# Validate critical environment variables
log "${YELLOW}🔐 Validating environment variables...${NC}"

CRITICAL_VARS=(
    "JWT_SECRET"
    "DB_PASSWORD"
    "STRIPE_SECRET_KEY"
    "FRONTEND_URL"
)

for var in "${CRITICAL_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        log "${RED}❌ Critical environment variable $var is not set${NC}"
        exit 1
    fi
done

log "${GREEN}✅ Environment variables validated${NC}"

# Create necessary directories
log "${YELLOW}📁 Creating necessary directories...${NC}"
mkdir -p logs/nginx
mkdir -p backups
mkdir -p ssl

log "${GREEN}✅ Directories created${NC}"

# Run tests
log "${YELLOW}🧪 Running tests...${NC}"
if npm run test; then
    log "${GREEN}✅ All tests passed${NC}"
else
    log "${RED}❌ Tests failed. Aborting deployment${NC}"
    exit 1
fi

# Build applications
log "${YELLOW}🔨 Building applications...${NC}"

# Build frontend
log "${BLUE}📱 Building frontend...${NC}"
cd apps/frontend
npm run build
cd ../..

# Build backend
log "${BLUE}⚙️ Building backend...${NC}"
cd apps/backend
npm run build
cd ../..

log "${GREEN}✅ Applications built successfully${NC}"

# Security audit
log "${YELLOW}🔒 Running security audit...${NC}"
if npm audit --audit-level=moderate; then
    log "${GREEN}✅ Security audit passed${NC}"
else
    log "${YELLOW}⚠️ Security audit found issues. Review and fix if necessary${NC}"
    read -p "Continue with deployment? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "${RED}❌ Deployment aborted by user${NC}"
        exit 1
    fi
fi

# Database migration
log "${YELLOW}🗄️ Running database migrations...${NC}"
cd apps/backend
npm run migrate
cd ../..
log "${GREEN}✅ Database migrations completed${NC}"

# Stop existing containers
log "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose -f docker-compose.prod.yml down --remove-orphans || true
log "${GREEN}✅ Existing containers stopped${NC}"

# Build and start production containers
log "${YELLOW}🐳 Building and starting production containers...${NC}"
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be ready
log "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 30

# Health checks
log "${YELLOW}🏥 Running health checks...${NC}"

# Check backend health
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    log "${GREEN}✅ Backend health check passed${NC}"
else
    log "${RED}❌ Backend health check failed${NC}"
    docker-compose -f docker-compose.prod.yml logs backend
    exit 1
fi

# Check frontend health
if curl -f http://localhost/health > /dev/null 2>&1; then
    log "${GREEN}✅ Frontend health check passed${NC}"
else
    log "${RED}❌ Frontend health check failed${NC}"
    docker-compose -f docker-compose.prod.yml logs frontend
    exit 1
fi

# Check database connection
if docker-compose -f docker-compose.prod.yml exec -T db pg_isready -U $DB_USER -d $DB_NAME > /dev/null 2>&1; then
    log "${GREEN}✅ Database health check passed${NC}"
else
    log "${RED}❌ Database health check failed${NC}"
    exit 1
fi

# Check Redis connection
if docker-compose -f docker-compose.prod.yml exec -T redis redis-cli ping > /dev/null 2>&1; then
    log "${GREEN}✅ Redis health check passed${NC}"
else
    log "${RED}❌ Redis health check failed${NC}"
    exit 1
fi

log "${GREEN}✅ All health checks passed${NC}"

# Performance testing
log "${YELLOW}⚡ Running performance tests...${NC}"
cd apps/frontend
npm run performance || true
cd ../..
log "${GREEN}✅ Performance tests completed${NC}"

# Create backup
log "${YELLOW}💾 Creating backup...${NC}"
docker-compose -f docker-compose.prod.yml exec -T db pg_dump -U $DB_USER -d $DB_NAME > "backups/pre-deployment-backup-${TIMESTAMP}.sql"
log "${GREEN}✅ Backup created: backups/pre-deployment-backup-${TIMESTAMP}.sql${NC}"

# Final status check
log "${YELLOW}📊 Final status check...${NC}"
docker-compose -f docker-compose.prod.yml ps

# Deployment summary
log "${GREEN}🎉 Production deployment completed successfully!${NC}"
log "${BLUE}📋 Deployment Summary:${NC}"
log "  - Environment: ${ENVIRONMENT}"
log "  - Timestamp: ${TIMESTAMP}"
log "  - Frontend URL: ${FRONTEND_URL}"
log "  - Backend URL: http://localhost:3001"
log "  - Health Check: http://localhost:3001/health"
log "  - Log File: ${LOG_FILE}"

# Monitoring instructions
log "${BLUE}📈 Next Steps:${NC}"
log "  1. Monitor application logs: docker-compose -f docker-compose.prod.yml logs -f"
log "  2. Check application performance"
log "  3. Set up monitoring and alerting"
log "  4. Configure SSL certificates"
log "  5. Set up automated backups"

log "${GREEN}✅ Deployment script completed${NC}" 