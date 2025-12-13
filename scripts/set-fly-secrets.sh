#!/usr/bin/env bash
set -euo pipefail

# Usage: run from repo root. Requires flyctl installed and authenticated.
# This script reads per-app .env files and sets Fly secrets for each corresponding app.
# Review the commands before running in shared environments — secrets will be passed on the CLI.

ROOT=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT"

function set_secrets_for() {
  local app_dir="$1";
  local fly_app="$2";
  local env_file="$app_dir/.env";

  if [ ! -f "$env_file" ]; then
    echo "Skipping $fly_app — no $env_file"
    return
  fi

  echo "Setting secrets for $fly_app from $env_file"

  # Helper to read an env var value from the .env (first match)
  get() {
    local key="$1";
    awk -F'=' -v k="$key" '$1==k { $1=""; sub(/^=/,""); print substr($0,2); exit }' "$env_file" || true
  }

  case "$fly_app" in
    ecom-auth-service)
      flyctl secrets set \
        DATABASE_URL="$(get DATABASE_URL)" \
        CLERK_PUBLISHABLE_KEY="$(get CLERK_PUBLISHABLE_KEY)" \
        CLERK_SECRET_KEY="$(get CLERK_SECRET_KEY)" \
        QSTASH_TOKEN="$(get QSTASH_TOKEN)" \
        QSTASH_SIGNING_KEY="$(get QSTASH_CURRENT_SIGNING_KEY)" \
        MESSAGE_BUS=qs \
        --app $fly_app
      ;;

    ecom-product-service)
      flyctl secrets set \
        DATABASE_URL="$(get DATABASE_URL)" \
        CLERK_PUBLISHABLE_KEY="$(get CLERK_PUBLISHABLE_KEY)" \
        CLERK_SECRET_KEY="$(get CLERK_SECRET_KEY)" \
        QSTASH_TOKEN="$(get QSTASH_TOKEN)" \
        QSTASH_SIGNING_KEY="$(get QSTASH_CURRENT_SIGNING_KEY)" \
        MESSAGE_BUS=qs \
        --app $fly_app
      ;;

    ecom-order-service)
      flyctl secrets set \
        MONGO_URL="$(get MONGO_URL)" \
        MONGODB_URI="$(get MONGO_URL)" \
        CLERK_PUBLISHABLE_KEY="$(get CLERK_PUBLISHABLE_KEY)" \
        CLERK_SECRET_KEY="$(get CLERK_SECRET_KEY)" \
        QSTASH_TOKEN="$(get QSTASH_TOKEN)" \
        QSTASH_SIGNING_KEY="$(get QSTASH_CURRENT_SIGNING_KEY)" \
        MESSAGE_BUS=qs \
        --app $fly_app
      ;;

    ecom-payment-service)
      flyctl secrets set \
        DATABASE_URL="$(get DATABASE_URL)" \
        CLERK_PUBLISHABLE_KEY="$(get CLERK_PUBLISHABLE_KEY)" \
        CLERK_SECRET_KEY="$(get CLERK_SECRET_KEY)" \
        STRIPE_SECRET_KEY="$(get STRIPE_SECRET_KEY)" \
        QSTASH_TOKEN="$(get QSTASH_TOKEN)" \
        QSTASH_SIGNING_KEY="$(get QSTASH_CURRENT_SIGNING_KEY)" \
        MESSAGE_BUS=qs \
        --app $fly_app
      ;;

    ecom-email-service)
      flyctl secrets set \
        DATABASE_URL="$(get DATABASE_URL)" \
        SMTP_PASSWORD="$(get SMTP_PASSWORD)" \
        CLERK_PUBLISHABLE_KEY="$(get CLERK_PUBLISHABLE_KEY)" \
        CLERK_SECRET_KEY="$(get CLERK_SECRET_KEY)" \
        QSTASH_TOKEN="$(get QSTASH_TOKEN)" \
        QSTASH_SIGNING_KEY="$(get QSTASH_CURRENT_SIGNING_KEY)" \
        MESSAGE_BUS=qs \
        --app $fly_app
      ;;

    *)
      echo "No mapping for $fly_app"
      ;;
  esac
}

set_secrets_for "apps/auth-service" "ecom-auth-service"
set_secrets_for "apps/product-service" "ecom-product-service"
set_secrets_for "apps/order-service" "ecom-order-service"
set_secrets_for "apps/payment-service" "ecom-payment-service"
set_secrets_for "apps/email-service" "ecom-email-service"

echo "All done. Verify with 'flyctl secrets list --app <app>'" 
