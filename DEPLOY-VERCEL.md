# Go live: Vercel + your Hostinger domain (theheritageedit.shop)

Recommended path. You keep the domain on Hostinger; the app runs on Vercel (free
Hobby tier), deployed straight from GitHub. ~20 minutes.

Three things only **you** can do (accounts / secrets / auth): create the Vercel +
database accounts, enter the secret keys, click the final deploy. Everything else is
wiring you can follow below.

---

## 1. Create the Postgres database (free)
1. Go to **neon.tech** → sign up (GitHub login is fine).
2. Create a project → copy the **connection string** (starts `postgresql://…?sslmode=require`).
   Keep it — this is `DATABASE_URL`.

## 2. Import the repo into Vercel
1. Go to **vercel.com** → sign up with **GitHub**.
2. **Add New… → Project** → import `gorefilip20/THE-HERITAGE-EDIT`.
3. Framework preset auto-detects **Next.js**. Leave build settings default
   (`prisma generate && next build`). Don't deploy yet — set env vars first (step 3).

## 3. Add environment variables (Vercel → Project → Settings → Environment Variables)
Minimum to launch (see `.env.production.example` for the full list):

| Key | Value |
|-----|-------|
| `DATABASE_URL` | the Neon string from step 1 |
| `NEXTAUTH_SECRET` | run `openssl rand -base64 48` and paste the result |
| `NEXT_PUBLIC_APP_URL` | `https://theheritageedit.shop` |
| `NEXTAUTH_URL` | `https://theheritageedit.shop` |
| `PAYSTACK_SECRET_KEY` | your live Paystack secret key |

Optional (add when ready): Stripe keys, `RESEND_API_KEY`, `ANTHROPIC_API_KEY`,
Cloudinary. The app runs without them (AI falls back to built-in copy; Redis has an
in-memory fallback).

## 4. Create the database tables + seed (run once, locally)
On your machine, point at the Neon DB and push the schema:
```bash
# from the project folder
# temporarily set the Neon URL for these two commands:
#   PowerShell:  $env:DATABASE_URL="postgresql://…"
#   Git Bash:    export DATABASE_URL="postgresql://…"
npx prisma db push                 # creates all tables in Neon
npx tsx scripts/seed-brands.ts     # seeds brands + categories
```

## 5. Deploy
Back in Vercel, click **Deploy**. When it finishes you'll get a
`…vercel.app` URL — open it and confirm the site loads.

## 6. Connect your Hostinger domain
1. Vercel → Project → **Settings → Domains** → add `theheritageedit.shop`
   **and** `www.theheritageedit.shop`.
2. Vercel shows the exact DNS records. They are normally:
   - **A record** — Host `@` → `76.76.21.21`
   - **CNAME** — Host `www` → `cname.vercel-dns.com`
   *(Use whatever Vercel shows if it differs — it's authoritative.)*
3. In **Hostinger hPanel → Domains → theheritageedit.shop → DNS / Nameservers**:
   - Delete the existing parking A/CNAME records.
   - Add the two records above.
   - Keep the nameservers as Hostinger's default (`…dns-parking`/Hostinger NS) — you
     manage the records here. (Don't switch nameservers unless you choose Vercel NS.)
4. Wait for DNS to propagate (minutes–a couple hours). Vercel auto-issues HTTPS.

## 7. Point payment webhooks at the live domain
- **Paystack → Settings → Webhooks:** `https://theheritageedit.shop/api/webhooks/paystack`
- **Stripe → Webhooks** (if used): `https://theheritageedit.shop/api/webhooks/stripe`
  → copy the signing secret into `STRIPE_WEBHOOK_SECRET` in Vercel → redeploy.

## 8. Make yourself an admin
Sign up on the live site at `/auth/register`, then in the Neon SQL editor:
```sql
UPDATE users SET role = 'SUPER_ADMIN' WHERE email = 'you@example.com';
```
Now `/admin` is yours to add products.

---

### Smoke test (after DNS is live)
`/` loads → `/auth/register` creates an account → `/account` works →
add to bag → `/checkout` → Paystack redirect → `/admin` after promotion.
