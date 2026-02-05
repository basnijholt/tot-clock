# Build stage
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --frozen-lockfile || bun install

# Copy source code
COPY . .

# Build the app
RUN bun run build

# Production stage - serve with Bun for API support
FROM oven/bun:1-slim

WORKDIR /app

# Copy built assets and server
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/package.json ./

# Create data directory for state persistence
RUN mkdir -p /data

# Expose port
EXPOSE 3000

# Environment variables
ENV PORT=3000
ENV DATA_DIR=/data

# Run the server
CMD ["bun", "run", "server.ts"]
