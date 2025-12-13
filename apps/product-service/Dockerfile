# ============================================================================
# STAGE 1: Builder — build the TypeScript app with full workspace available
# ============================================================================
FROM node:18-alpine AS builder

WORKDIR /app

# Enable Corepack for pnpm (included in Node 18+)
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy the entire repository so the builder can access workspace packages
# and pnpm-lock.yaml for TypeScript resolution during the build.
COPY . .

# Install dependencies for the monorepo (respects pnpm-lock.yaml)
# Use --no-frozen-lockfile inside build to avoid lockfile config mismatch in CI
RUN pnpm install --no-frozen-lockfile

# Build the product-service
WORKDIR /app/apps/product-service
RUN npm run build

# ============================================================================
# STAGE 2: Runtime — slim image with only compiled code and production deps
# ============================================================================
FROM node:18-alpine AS runtime

WORKDIR /app

# Enable Corepack for pnpm (for consistency, though we'll use npm at runtime)
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy the entire repo structure (we'll use pnpm prune and selective copies to keep it lean)
# We need package.json, pnpm-lock.yaml, and the built dist/ folder from builder
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/product-service/package.json ./apps/product-service/
COPY --from=builder /app/apps/product-service/dist ./apps/product-service/dist

# Install production dependencies only for the whole workspace
# (pnpm will only install production deps and respect the lock file)
RUN pnpm install --frozen-lockfile --prod

# Remove unnecessary files to keep image small
RUN find . -type f -name "*.ts" -o -name "*.tsx" -o -name "tsconfig.json" | xargs rm -f 2>/dev/null || true
RUN find ./apps/product-service -type f \( -name "src" -o -name "*.map" \) -delete 2>/dev/null || true

WORKDIR /app/apps/product-service

# Expose the port your service listens on
EXPOSE 8080

# Start the application using the compiled dist/ folder
CMD ["node", "dist/index.js"]
