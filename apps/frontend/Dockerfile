# Use Node.js 18 as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy root package.json and workspace config
COPY ../../package*.json ./
COPY ../../tsconfig.base.json ./

# Copy common package
COPY ../../packages/common ./packages/common

# Copy frontend package files
COPY package*.json ./apps/frontend/
COPY tsconfig.json ./apps/frontend/

# Install dependencies
RUN npm install

# Copy frontend source code
COPY src ./apps/frontend/src
COPY public ./apps/frontend/public

# Build the frontend app
RUN npm run build --workspace=apps/frontend

# Install serve to run the app
RUN npm install -g serve

# Expose port
EXPOSE 3000

# Start the app
CMD ["serve", "-s", "apps/frontend/build", "-l", "3000"] 