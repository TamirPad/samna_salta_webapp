# Multi-stage build for production deployment
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY package-lock.json ./
COPY tsconfig.base.json ./

# Copy workspace configurations
COPY apps/frontend/package*.json ./apps/frontend/
COPY apps/backend/package*.json ./apps/backend/
COPY packages/common/package*.json ./packages/common/

# Install all dependencies
RUN npm install

# Copy source code
COPY apps/frontend/src ./apps/frontend/src
COPY apps/frontend/public ./apps/frontend/public
COPY apps/frontend/tsconfig.json ./apps/frontend/
COPY apps/backend/src ./apps/backend/src
COPY packages/common/src ./packages/common/src
COPY packages/common/tsconfig.json ./packages/common/

# Build common package first (required by frontend)
RUN npm run build --workspace=packages/common

# Build frontend
RUN npm run build:frontend

# Production stage
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy built frontend
COPY --from=builder --chown=nodejs:nodejs /app/apps/frontend/build ./frontend/build

# Copy backend source and dependencies
COPY --from=builder --chown=nodejs:nodejs /app/apps/backend ./apps/backend
COPY --from=builder --chown=nodejs:nodejs /app/packages ./packages
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Copy startup script
COPY start.sh ./

# Install serve for frontend
RUN npm install -g serve

# Switch to non-root user
USER nodejs

# Expose port (Render will set the port via PORT env var)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT:-3000}/health || exit 1

# Start the application
CMD ["dumb-init", "./start.sh"] 