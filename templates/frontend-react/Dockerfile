# =========================
# Stage 1: Build React App
# =========================
FROM node:20-alpine AS builder

# Set working directory once
WORKDIR /app

# Copy package files first (for better layer caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source files
COPY . ./

# Build arguments (Vite envs)
ARG VITE_API_BASE_URL


# Set env vars for Vite build
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Build the app
RUN npm run build

# =========================
# Stage 2: Nginx
# =========================
FROM nginx:alpine

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Custom nginx config (SPA support)
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Copy built files from builder (dist is now at /app/dist)
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
