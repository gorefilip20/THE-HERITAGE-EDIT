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
- (optional) Stripe, Resend, Cloudinary, AI keys

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
- **Stripe dashboard → Webhooks:** `https://yourdomain.com/api/webhooks/stripe`
  (copy the signing secret into `STRIPE_WEBHOOK_SECRET`, then Restart)

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

### Alternative if Hostinger’s Node.js app gives you trouble
Next.js on shared Node.js hosting can be finicky (Passenger quirks, build limits).
The most robust Hostinger option is a **VPS** (KVM), where you run
`npm run build && pm2 start server.js` behind an nginx reverse proxy with a free
Let’s Encrypt certificate. Ask and I’ll write that VPS runbook + nginx config too.
You can also keep the Hostinger domain and point its DNS at a Next.js-native host.
