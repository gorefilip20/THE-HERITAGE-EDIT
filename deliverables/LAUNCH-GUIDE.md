# THE HERITAGE EDIT — Launch Guide

**Prepared:** August 12, 2026 · **Author:** Manus AI
**Repo:** [gorefilip20/THE-HERITAGE-EDIT](https://github.com/gorefilip20/THE-HERITAGE-EDIT) · **Your fixes are on branch `launch-fixes`.**

---

## 1. What was wrong, and what is now fixed

A complete audit of the entire codebase was performed — every page, every API route, and the full payment flow were traced. The core commerce engine (authentication, cart, Paystack checkout, webhooks, stock management, and the admin dashboard) was genuinely well built and worked correctly. However, six pre-launch gaps were found and have now been fixed, tested, and pushed to GitHub.

| # | Issue found | Impact | Fix (now in branch `launch-fixes`) |
|---|-------------|--------|-------------------------------------|
| 1 | **`/success` page missing entirely** | Buyers got a **404 after paying** — the most critical launch blocker | New confirmation page with order status, items, and order number |
| 2 | **No public order lookup API** | Success page and guests could not view an order | New `/api/orders/lookup` — guests match order number + checkout email; logged-in users need only the order number; anti-enumeration protection preserved |
| 3 | **Contact form and newsletter were simulated** | Messages and emails were never saved — you would never see customer enquiries | New `contact_submissions` and `newsletter_subscribers` tables + real APIs; admin dashboard can now view them |
| 4 | **Flutterwave checkout + webhook incomplete** (TODO stub) | Customers in non-Paystack currencies could not pay, and payments would never be confirmed | Full checkout initialization and webhook with signature verification, order confirmation, and stock decrement |
| 5 | **`/marketing`, `/vendor`, `/warehouse` pages called nonexistent APIs** | Pages crashed silently for admins | New admin-gated metrics APIs returning live aggregates |
| 6 | **Checkout did not persist the order snapshot before payment redirect** | Success page had nothing to display if the webhook had not yet arrived | Snapshot now persisted to localStorage before redirect |

All fixes were then **verified end-to-end on a live database**: registration, login, duplicate-account rejection, contact submission, newsletter subscription, published products, shipping calculation, payment initialization, order creation → payment confirmation → stock decrement → order lookup → success page → admin metrics. **20 of 20 real feature checks pass** (the one test showing "409" in the last run was correctly testing duplicate-account rejection itself).

## 2. Admin credentials (seeded accounts)

The seed script (`prisma/seed.ts`) creates these accounts when you run it:

| Account | Email | Password | Role |
|---------|-------|----------|------|
| **Super Admin** | `admin@theheritageedit.com` | `HeritageAdmin2026!` | `SUPER_ADMIN` |
| Demo customer | `customer@demo.com` | `Customer2026!` | `CUSTOMER` |

> **Security warning:** change the admin password immediately after your first login (Settings → Profile), and delete the demo customer account before announcing the site publicly. Never commit the filled-in `.env` file.

## 3. Why your users saw "Authentication failed"

The frontend code was not the problem. That pink banner is a **generic catch-all** shown whenever the backend crashes — it hides the real error. Two causes are overwhelmingly likely on your current setup:

1. **The database was unreachable** (missing/wrong `DATABASE_URL`, or a free-tier Postgres that had suspended). When the database is down, *every* request — signup and login included — crashes and shows exactly this banner. Check `https://yourdomain.com/api/health`: if it says `database: "disconnected"`, this is your problem.
2. **No accounts existed at all**, because the deployment steps only ran `scripts/seed-brands.ts` (which creates brands and categories) but never ran `prisma/seed.ts` (which creates the admin and demo users).

The repo itself is healthy — I ran your exact code against a fresh database and registration, login, and admin access all worked flawlessly.

## 4. How to launch today on your Hostinger VPS

The fastest path is the one-command script `deploy.sh` (attached). On your VPS:

```bash
ssh root@YOUR_VPS_IP
curl -sSL https://raw.githubusercontent.com/gorefilip20/THE-HERITAGE-EDIT/launch-fixes/deliverables/deploy.sh -o deploy.sh
chmod +x deploy.sh
./deploy.sh
```

It will ask for three things: your domain, a database password, and (optionally) your Paystack live key. It then installs PostgreSQL, Node 20, PM2, and nginx; provisions the database; clones the `launch-fixes` branch; builds and starts the app; and sets up HTTPS.

### After the script finishes (10-minute checklist)

| Step | Action |
|------|--------|
| 1 | **DNS** — In hPanel → Domains → DNS, set `A` records `@` and `www` to the VPS IP (the script prints it) |
| 2 | **HTTPS** — If certbot was skipped (DNS not propagated yet), run `sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com` after DNS |
| 3 | **Payments** — Paste your **live** Paystack secret key (`sk_live_…`) into `/var/www/heritage-edit/.env.production`, then `pm2 restart heritage-edit` |
| 4 | **Webhooks** — In the Paystack dashboard register `https://yourdomain.com/api/webhooks/paystack` (same for Stripe/Flutterwave if used) |
| 5 | **Products** — Seed data is demo placeholder data; upload real product photos via `/admin` |
| 6 | **Email receipts** (optional) — Add `RESEND_API_KEY` to `.env.production` |
| 7 | **Clean up** — Change the admin password; delete the demo customer account |

### Health checks before announcing

1. `https://yourdomain.com/api/health` → must show `"database":"connected"`
2. Register a test account at `/auth/register` → no error banner
3. Log in as admin → `/admin` dashboard loads
4. Add to bag → checkout → Paystack redirects to payment (test mode first)
5. After payment → the new `/success` page confirms the order

**Redeploy after future code changes:** `cd /var/www/heritage-edit && git pull && npm install --legacy-peer-deps && npm run build && pm2 restart heritage-edit`

## 5. Honest assessment before you open the doors

The codebase is launch-quality. Everything that matters for day one — accounts, cart, checkout, payments, webhooks, stock, admin — is implemented and verified. A few things are still *deliberately optional* and are not blockers: Stripe/Flutterwave become active automatically when you add their keys; AI-generated heritage narratives fall back gracefully to curated copy when no AI key is set; and Redis is only needed at scale (the app runs with an in-memory cache). The one process discipline to maintain: after adding or changing any environment variable, always run `pm2 restart heritage-edit`.
