# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

WORKDIR /build

# Copy client package files
COPY client/package*.json ./client/

# Install client dependencies
WORKDIR /build/client
RUN npm ci

# Copy client source
COPY client/ ./

# Build frontend
RUN npm run build

# Stage 2: Production image
FROM node:20-alpine

# Install required packages and build dependencies for native modules
RUN apk add --no-cache \
    bash \
    jq \
    sqlite \
    python3 \
    make \
    g++

WORKDIR /app

# Copy server package files
COPY server/package*.json ./server/

# Install production dependencies only
WORKDIR /app/server
RUN npm ci --production

# Copy server source
WORKDIR /app
COPY server/ ./server/

# Copy built frontend from stage 1
COPY --from=frontend-builder /build/client/dist ./client/dist

# Create data directory
RUN mkdir -p /data

# Expose port
EXPOSE 3001

# Copy and set entrypoint
COPY run.sh /
RUN chmod +x /run.sh

# Set working directory
WORKDIR /app

# Start via run script
CMD ["/run.sh"]
