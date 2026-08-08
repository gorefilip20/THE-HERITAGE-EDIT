# Deploying THE HERITAGE EDIT on Hostinger (Business / Cloud — hPanel)

This app is a **Next.js server application** (SSR + API routes + Prisma/PostgreSQL).
It runs as a **Node.js app**, not as static files. Hostinger Business/Cloud plans
support this through **hPanel → Advanced → Node.js**.

> ⚠️ Reality check before you start
> - Standard/Premium *shared* hosting **cannot** run this — you need the **Node.js
>   App** feature (Business/Cloud) or a **VPS**.
> - Shared plans sometimes can't run `next build` (memory). If the build is killed,
>   see **§6 “If the build fails on the server.”**
> - This app needs a **PostgreSQL** database. Hostinger shared plans provide **MySQL**,
>   not Postgres — so use a free managed Postgres (**Neon**, **Supabase**, or Railway)
>   and paste its URL into `DATABASE_URL`. (Switching to MySQL would require schema/code
>   changes — not recommended.)

---

## 1. Provision a PostgreSQL database
1. Create a free Postgres at **neon.tech** or **supabase.com**.
2. Copy the connection string. It looks like:
   `postgresql://user:pass@host:5432/dbname?sslmode=require`
3. Keep it for `DATABASE_URL` below.

## 2. Get the code onto Hostinger
Two options:
- **Git (preferred):** In hPanel → **Git**, clone
  `https://github.com/gorefilip20/THE-HERITAGE-EDIT` into a folder such as
  `domains/yourdomain.com/heritage-edit`.
- **Upload:** Zip the project locally **excluding** `node_modules`, `.next`, `.env*`,
  and upload via **File Manager**, then extract.

## 3. Create the Node.js app
hPanel → **Advanced → Node.js → Create application**:
- **Node.js version:** 18 or 20 (LTS)
- **Application mode:** Production
- **Application root:** the folder from step 2 (e.g. `heritage-edit`)
- **Application startup file:** `server.js`  ← (included in this repo)
- **Application URL:** your domain

## 4. Set environment variables
In the Node.js app screen, add every variable from **`.env.production.example`**.
Minimum to boot and take payments:
- `DATABASE_URL` (from step 1)
- `NEXTAUTH_SECRET` — generate: `openssl rand -base64 48`
- `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` — `https://yourdomain.com`
- `NODE_ENV=production`
- `PAYSTACK_SECRET_KEY` — your live key
- `FLUTTERWAVE_SECRET_KEY` — your live Flutterwave key
- `FLUTTERWAVE_SECRET_HASH` — your webhook verification hash
- `RESEND_API_KEY` — for order confirmation emails
- (optional) `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` — for SMS notifications

## 5. Install, migrate, seed, build
Open the app’s terminal (the **“Run NPM Install”** button, or SSH into the account
and `source` the virtualenv shown at the top of the Node.js app page). Then:

```bash
npm install                 # installs deps + generates Prisma client (postinstall)
npx prisma migrate deploy   # creates tables in your Postgres
npx tsx scripts/seed-brands.ts   # seeds brands + categories (incl. Senator/Native/Footwear/Jewelry)
npm run build               # builds the production .next output
```

## 6. Start it
Back on the Node.js app page click **Restart**. Visit `https://yourdomain.com`.
Health check: `https://yourdomain.com/api/health`.

### If the build fails on the server (out of memory)
Build the exact same way on a **Linux** machine (or WSL) with Node 18/20, then upload
the generated `.next` folder — **but** you must still run `npm install` **on the
server** so native modules (Prisma engine, `sharp`, `bcryptjs`) match Linux.
Do **not** copy a Windows `node_modules` to the server.

> This repo sets `output: "standalone"` in `next.config.mjs`, which also produces a
> slimmed `.next/standalone/server.js`. That’s mainly useful for the VPS + PM2 path;
> for the hPanel Node.js app, the root `server.js` above is the simplest entry point.

## 7. Point your domain
If the app root is under your primary domain, hPanel maps it automatically. Otherwise
set the domain/subdomain’s document root (or the Node.js app’s **Application URL**) to
this app. Allow DNS to propagate.

## 8. Configure webhooks (after the domain is live)
- **Paystack dashboard → Webhooks:** `https://yourdomain.com/api/webhooks/paystack`
- **Flutterwave dashboard → Webhooks:** `https://yourdomain.com/api/checkout/flutterwave` (PUT method)
  Set your secret hash in `FLUTTERWAVE_SECRET_HASH` env var, then Restart

---

## Post-deploy smoke test
1. `/` loads, `/shop` lists products (after seeding + adding products in `/admin`).
2. `/auth/register` → create an account → lands on `/account`.
3. `/account` → Profile edit saves; Orders/Wishlist/Addresses tabs load.
4. Add to bag → `/checkout` → Paystack redirect works.
5. Admin: log in as an `ADMIN` user → `/admin` dashboard.

## Making yourself an admin
New sign-ups are `CUSTOMER`. Promote your account once, via the DB:
```sql
UPDATE users SET role = 'SUPER_ADMIN' WHERE email = 'you@example.com';
```

---

## Hostinger VPS — full deployment (recommended path)
A VPS (KVM) gives you SSH + root, so it runs Next.js properly — no Passenger quirks,
no build-memory limits. This section installs everything **on the VPS itself**,
including PostgreSQL, so the whole stack lives on Hostinger.

SSH in as root (`ssh root@YOUR_VPS_IP`), then:

```bash
# 1. System packages (Ubuntu 22.04/24.04)
apt update && apt upgrade -y
apt install -y nginx postgresql postgresql-contrib git unzip
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -    # Node 20 LTS
apt install -y nodejs
npm install -g pm2

# 2. Create the PostgreSQL database (pick a strong password!)
sudo -u postgres psql <<'SQL'
CREATE DATABASE heritage;
CREATE USER heritage_user WITH ENCRYPTED PASSWORD 'CHANGE_ME_STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE heritage TO heritage_user;
ALTER DATABASE heritage OWNER TO heritage_user;
SQL
# → your DATABASE_URL is:
#   postgresql://heritage_user:CHANGE_ME_STRONG_PASSWORD@localhost:5432/heritage

# 3. Get the code into /var/www/heritage-edit
mkdir -p /var/www/heritage-edit && cd /var/www/heritage-edit
git clone https://github.com/gorefilip20/THE-HERITAGE-EDIT.git .
#   (or upload the ZIP with scp from your PC, then: unzip the-heritage-edit-deploy.zip)

# 4. Environment
cp .env.production.example .env.production
nano .env.production   # fill DATABASE_URL (above), NEXTAUTH_SECRET (openssl rand -base64 48),
                       # NEXT_PUBLIC_APP_URL=https://theheritageedit.shop, PAYSTACK_SECRET_KEY…

# 5. Install → schema → seed → build
npm install
npx prisma db push
npx tsx scripts/seed-brands.ts
npm run build

# 6. Run under PM2 (ecosystem.config.js forces NODE_ENV=production + port 3000)
pm2 start ecosystem.config.js
pm2 save && pm2 startup     # run the command it prints, so it survives reboots
```

Then put nginx in front and add HTTPS:
```nginx
# /etc/nginx/sites-available/heritage-edit  (symlink into sites-enabled)
server {
    listen 80;
    server_name theheritageedit.shop www.theheritageedit.shop;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```
```bash
sudo ln -s /etc/nginx/sites-available/heritage-edit /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d theheritageedit.shop -d www.theheritageedit.shop
```
Point the domain at the VPS by setting an **A record** (`@` and `www`) to the VPS IP
in hPanel → Domains → DNS. Redeploy after code changes with:
`git pull && npm install && npm run build && pm2 restart heritage-edit`.

### Make yourself an admin (after seeding + registering once)
```bash
sudo -u postgres psql -d heritage -c "UPDATE users SET role='SUPER_ADMIN' WHERE email='you@example.com';"
```
