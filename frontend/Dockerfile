# ==========================================================
# STAGE 1: Build the React + Vite application
# ==========================================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package definition files to leverage Docker layer caching
COPY package*.json ./

# Install dependencies clean (npm ci is faster and deterministic)
RUN npm ci

# Copy the entire frontend source code
COPY . .

# Build the static production bundle (Vite outputs to /app/dist)
RUN npm run build

# ==========================================================
# STAGE 2: Serve the application using Nginx
# ==========================================================
FROM nginx:1.25-alpine

# Copy the build artifacts from Stage 1 to Nginx public folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy a custom Nginx configuration to support SPA routing (React Router)
# and proxy requests to backend API gateway (configured for port 3000)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
