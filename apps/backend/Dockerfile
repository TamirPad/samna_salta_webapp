# Use Node.js 18 as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy root package.json and workspace config
COPY ../../package*.json ./
COPY ../../tsconfig.base.json ./

# Copy common package
COPY ../../packages/common ./packages/common

# Copy backend package files
COPY package*.json ./apps/backend/

# Install dependencies
RUN npm install

# Copy backend source code
COPY src ./apps/backend/src

# Build common package
RUN npm run build --workspace=packages/common

# Expose port
EXPOSE 3001

# Start the backend app
CMD ["npm", "run", "start", "--workspace=apps/backend"] 