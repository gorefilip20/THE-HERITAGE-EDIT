#!/usr/bin/env bash
# =============================================================================
# THE HERITAGE EDIT — One-command launch deployment for Hostinger VPS (Ubuntu)
# =============================================================================
# Run as root:  ssh root@YOUR_VPS_IP
#   curl -sSL https://raw.githubusercontent.com/gorefilip20/THE-HERITAGE-EDIT/launch-fixes/deliverables/deploy.sh -o deploy.sh
#   chmod +x deploy.sh && ./deploy.sh
#
# It installs PostgreSQL + Node 20 + PM2 + nginx, provisions the database,
# clones the launch-fixes branch, installs, builds and starts the app.
# It then prints the remaining manual steps (env vars, SSL, DNS).
# =============================================================================
set -uo pipefail

read -r -p "Your domain (e.g. theheritageedit.shop): " DOMAIN
read -r -s -p "Database password (pick a strong one): " DB_PASS
echo
PAYSTACK_KEY=""
read -r -p "Paystack live secret key (sk_live_… — leave blank to set later): " PAYSTACK_KEY

APP_DIR="/var/www/heritage-edit"

echo "━━━ 1/8 System packages ━━━"
export DEBIAN_FRONTEND=noninteractive
apt update -y -qq && apt upgrade -y -qq
apt install -y -qq nginx postgresql postgresql-contrib git unzip curl build-essential
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - >/dev/null
apt install -y -qq nodejs
npm install -g pm2

echo "━━━ 2/8 PostgreSQL database ━━━"
systemctl enable postgresql --now
sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
CREATE DATABASE heritage;
CREATE USER heritage_user WITH ENCRYPTED PASSWORD '$DB_PASS';
GRANT ALL PRIVILEGES ON DATABASE heritage TO heritage_user;
ALTER DATABASE heritage OWNER TO heritage_user;
SQL
echo "✓ database=postgresql://heritage_user:<password>@localhost:5432/heritage"

echo "━━━ 3/8 Clone the code (launch-fixes branch) ━━━"
mkdir -p "$APP_DIR" && cd "$APP_DIR"
git clone --branch launch-fixes --single-branch https://github.com/gorefilip20/THE-HERITAGE-EDIT.git "$APP_DIR" || \
  { echo "Directory exists — pulling latest instead"; git pull; }

echo "━━━ 4/8 Environment file ━━━"
AUTH_SECRET="$(openssl rand -base64 48 | tr -d '\n')"
cp .env.production.example .env.production
sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"postgresql://heritage_user:$DB_PASS@localhost:5432/heritage\"|" .env.production
sed -i "s|^NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=\"$AUTH_SECRET\"|" .env.production
sed -i "s|^NEXTAUTH_URL=.*|NEXTAUTH_URL=\"https://$DOMAIN\"|" .env.production
sed -i "s|^NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=\"https://$DOMAIN\"|" .env.production
if [ -n "$PAYSTACK_KEY" ]; then
  sed -i "s|^PAYSTACK_SECRET_KEY=.*|PAYSTACK_SECRET_KEY=\"$PAYSTACK_KEY\"|" .env.production
fi
chmod 600 .env.production
echo "✓ NEXTAUTH_SECRET generated (random, unique to this server)"

echo "━━━ 5/8 Install, schema, seed, build ━━━"
npm install --legacy-peer-deps
npx prisma db push
echo "━━━ Seeding admin + demo accounts + brands/categories/products ━━━"
npx tsx prisma/seed.ts
npx tsx scripts/seed-brands.ts
npm run build

echo "━━━ 6/8 Start with PM2 ━━━"
pm2 start ecosystem.config.js --update-env
pm2 save && pm2 startup 2>/dev/null || true

echo "━━━ 7/8 nginx ━━━"
cat > /etc/nginx/sites-available/heritage-edit <<NGINX
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        client_max_body_size 10m;
    }
}
NGINX
ln -sfn /etc/nginx/sites-available/heritage-edit /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

echo "━━━ 8/8 SSL (HTTPS) ━━━"
apt install -y -qq certbot python3-certbot-nginx
certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos -m "admin@$DOMAIN" 2>/dev/null || \
  echo "⚠ certbot skipped — run manually after DNS points at this VPS:"
echo "   sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"

echo ""
echo "====================================================================="
echo " ✓ APP IS RUNNING on https://$DOMAIN (port 3000 via nginx)"
echo " ✓ Health check:   https://$DOMAIN/api/health  → database: \"connected\""
echo " ✓ Admin login:    https://$DOMAIN/admin"
echo "     admin@theheritageedit.com / HeritageAdmin2026!"
echo "     (CHANGE the password after first login: Settings → Profile)"
echo " ✓ Demo customer:  customer@demo.com / Customer2026!"
echo "====================================================================="
echo "
STILL TO DO (manual):"
VPS_IP="$(curl -s ifconfig.me || echo 'YOUR_VPS_IP')"
echo "  1. DNS: In hPanel → Domains → DNS set A records:  @ → $VPS_IP  and  www → $VPS_IP"
echo "  2. Finish SSL if step 8 skipped: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo "  3. Payments: paste your LIVE Paystack key into .env.production, then
        pm2 restart heritage-edit  (also set Stripe/Flutterwave keys if used)
  4. Webhooks: in payment dashboards register
        https://$DOMAIN/api/webhooks/paystack
        https://$DOMAIN/api/webhooks/flutterwave
        https://$DOMAIN/api/webhooks/stripe
  5. Email receipts (optional): add RESEND_API_KEY + FROM_EMAIL
  6. Upload real product photos via /admin → Products (seed has demo data)
  7. Delete demo accounts before announcing publicly:
     sudo -u postgres psql -d heritage -c \"DELETE FROM users WHERE email IN ('customer@demo.com');\""
echo ""
