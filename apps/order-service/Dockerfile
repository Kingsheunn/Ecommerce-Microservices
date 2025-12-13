# Builder stage: build the order-service with pre-built packages
FROM node:20-alpine AS builder

WORKDIR /app

# Enable Corepack and prepare pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Copy the entire monorepo (build context is repo root)
COPY . .

# Install dependencies and build packages
RUN pnpm install --no-frozen-lockfile

# Build all packages
RUN pnpm run build

# Now build the order-service
WORKDIR /app/apps/order-service
RUN pnpm run build

# Runtime stage: produce a slim image with production deps and built assets
FROM node:20-alpine AS runtime

WORKDIR /app

# Enable Corepack for pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy lockfile, workspace packages and built output from builder
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/order-service/package.json ./apps/order-service/
COPY --from=builder /app/apps/order-service/dist ./apps/order-service/dist

# Install production dependencies
RUN pnpm install --frozen-lockfile --prod

WORKDIR /app/apps/order-service

# Expose port
EXPOSE 8080

# Force cache invalidation for new deployment
RUN echo "Order service deployment v2"

# Start the application (uses compiled ES module dist)
CMD ["node", "dist/index.js"]
