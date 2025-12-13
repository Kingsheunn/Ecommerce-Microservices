#!/bin/bash

# === SAFETY HEADER ===
set -e
echo "🧩 Setting up Microservices E-Commerce App (cross-platform edition)..."

# --- DETECT OS ---
OS="$(uname -s)"
case "$OS" in
  Linux*)   platform="linux";;
  Darwin*)  platform="mac";;
  MINGW*|MSYS*|CYGWIN*) platform="windows";;
  *)        platform="unknown";;
esac

# --- HELPER FUNCTION ---
install_docker() {
  echo "🐋 Installing Docker..."
  if [[ "$platform" == "mac" ]]; then
    echo "Please install Docker Desktop manually from https://www.docker.com/products/docker-desktop/"
    open https://www.docker.com/products/docker-desktop/
  elif [[ "$platform" == "linux" ]]; then
    curl -fsSL https://get.docker.com | sudo bash
    sudo systemctl enable docker
    sudo systemctl start docker
  elif [[ "$platform" == "windows" ]]; then
    echo "Please install Docker Desktop for Windows from:"
    echo "👉 https://www.docker.com/products/docker-desktop/"
    explorer "https://www.docker.com/products/docker-desktop/"
  else
    echo "❌ Unsupported OS. Install Docker manually."
  fi
}

# --- CHECK TOOLS ---
echo "🔍 Checking dependencies..."
declare -a tools=("git" "node" "pnpm" "docker")
for t in "${tools[@]}"; do
  if ! command -v $t &>/dev/null; then
    echo "⚠️  $t not found."
    if [[ "$t" == "docker" ]]; then
      install_docker
    elif [[ "$t" == "pnpm" ]]; then
      npm install -g pnpm
    else
      echo "❌ Please install $t and rerun the script."
      exit 1
    fi
  fi
done

# --- INSTALL DEPENDENCIES ---
echo "📦 Installing pnpm dependencies..."
pnpm install

# --- ENV FILE CREATION ---
echo "🧾 Creating .env files..."


# Client
mkdir -p apps/client
cat > apps/client/.env <<EOL
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY=$CLERK_SECRET_KEY
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
EOL

# Admin
mkdir -p apps/admin
cat > apps/admin/.env <<EOL
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY=$CLERK_SECRET_KEY
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
EOL

# Product Service
mkdir -p apps/product-service
cat > apps/product-service/.env <<EOL
PORT=8000
PRODUCT_DB_URL=postgresql://admin:123456@localhost:5432/products
EOL

# Order Service
mkdir -p apps/order-service
cat > apps/order-service/.env <<EOL
PORT=8001
MONGO_URL=mongodb://localhost:27017/orders
EOL

# Payment Service
mkdir -p apps/payment-service
cat > apps/payment-service/.env <<EOL
PORT=8002
EOL

# Email Service
mkdir -p apps/email-service
cat > apps/email-service/.env <<EOL
PORT=8003
NODE_ENV=development
KAFKA_BROKERS=localhost:9094
CLERK_PUBLISHABLE_KEY=$CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY=$CLERK_SECRET_KEY
EOL

# Auth Service
mkdir -p apps/auth-service
cat > apps/auth-service/.env <<EOL
PORT=8004
CLERK_PUBLISHABLE_KEY=$CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY=$CLERK_SECRET_KEY
EOL

echo "✅ .env files created successfully."

# --- START DOCKER ---
echo "🐘 Starting PostgreSQL..."
docker stop product-db &>/dev/null || true
docker rm product-db &>/dev/null || true
docker run -d \
  --name product-db \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD= \
  -e POSTGRES_DB=products \
  -p 5432:5432 postgres:15

echo "⏳ Waiting for PostgreSQL to initialize..."
sleep 8

# --- RUN PRISMA MIGRATIONS ---
if [ -d "packages/product-db" ]; then
  echo "🧱 Running Prisma migrations..."
  cd packages/product-db
  pnpm prisma migrate dev --name init
  pnpm prisma generate
  cd ../../
else
  echo "⚠️  product-db package not found; skipping Prisma migration."
fi

# --- RUN DEV SERVERS ---
echo "🚀 Starting all services using Turborepo..."
pnpm turbo dev
