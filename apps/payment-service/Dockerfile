# Builder stage: build the payment-service within the monorepo context
FROM node:18-alpine AS builder

WORKDIR /app

# Enable Corepack and prepare pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy the whole repository (build context must be the repo root)
COPY . .

# Install all workspace dependencies and build the payment service
RUN pnpm install --frozen-lockfile
WORKDIR /app/apps/payment-service
RUN pnpm run build

# Runtime stage: produce a slim image with production deps and built assets
FROM node:18-alpine AS runtime

WORKDIR /app

# Enable Corepack for pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy lockfile, workspace packages and built output from builder
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/payment-service/package.production.json ./apps/payment-service/package.json
COPY --from=builder /app/apps/payment-service/dist ./apps/payment-service/dist

# Install production dependencies only
RUN pnpm install --prod

WORKDIR /app/apps/payment-service

# Expose port
EXPOSE 8080

# Start the application (uses compiled dist)
CMD ["node", "dist/index.js"]
