FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose internal port (not exposed to host, only to docker network)
EXPOSE 4000

# Health check with longer timeout for DB initialization
HEALTHCHECK --interval=30s --timeout=15s --start-period=60s --retries=3 \
    CMD node -e "http.get('http://localhost:4000/api/integration/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

CMD ["npm", "start"]
