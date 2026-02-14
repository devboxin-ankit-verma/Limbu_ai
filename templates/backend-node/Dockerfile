# =========================
# Stage 1: Build the server
# =========================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy server package files
COPY package*.json ./

# Install dependencies (including dev deps for build)
# Using npm install instead of npm ci for more flexibility
RUN npm install

# Copy server source code
COPY . ./

# Build the server (tsc outputs to dist/)
RUN npm run build

# Stage 2: Production runtime
FROM node:20-alpine

# Install curl for health checks
RUN apk add --no-cache curl

WORKDIR /app

# Copy server package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy built server output from builder (dist/app.js and related)
COPY --from=builder /app/dist ./dist

# Expose the port
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Start the application
CMD ["node", "dist/app.js"]
