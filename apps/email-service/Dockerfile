# Builder stage: build the email-service within the monorepo context
FROM node:18-alpine AS builder

WORKDIR /app

# Enable Corepack and prepare pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy the whole repository (build context must be the repo root)
COPY . .

# Install all workspace dependencies and build the email service
RUN pnpm install --frozen-lockfile
WORKDIR /app/apps/email-service
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
COPY --from=builder /app/apps/email-service/package.json ./apps/email-service/
COPY --from=builder /app/apps/email-service/dist ./apps/email-service/dist

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

WORKDIR /app/apps/email-service

# Expose port
EXPOSE 8080

# Start the application (uses compiled dist)
CMD ["node", "dist/index.js"]
