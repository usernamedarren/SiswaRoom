FROM node:22-alpine

WORKDIR /app

# Install wget for health checks
RUN apk add --no-cache wget

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --legacy-peer-deps --production

# Copy source code
COPY . .

# Expose internal port (not exposed to host, only to docker network)
EXPOSE 4000

# Health check with longer timeout for DB initialization
HEALTHCHECK --interval=30s --timeout=15s --start-period=60s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:4000/api/health || exit 1

CMD ["npm", "start"]
