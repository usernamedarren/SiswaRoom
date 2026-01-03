# Stage 1: build static assets with Vite
FROM node:22-alpine AS builder
WORKDIR /app

# Build-time API base URL (passed via --build-arg VITE_API_URL=...)
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Stage 2: serve with Nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
