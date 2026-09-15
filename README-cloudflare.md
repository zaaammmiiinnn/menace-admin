# MENANCE Admin — Cloudflare Workers Deployment

> The admin panel runs on **Cloudflare Workers** via the OpenNext adapter, sharing the same D1 database as the storefront.

---

## Prerequisites

- Node.js 18+
- `@opennextjs/cloudflare` (already installed)
- Cloudflare account with D1 database `menace-db` provisioned
- `wrangler` CLI authenticated (`npx wrangler login`)

---

## Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌────────────────────┐
│  menace-admin    │────▶│  Cloudflare   │────▶│  D1: menace-db     │
│  (CF Workers)    │     │  Workers      │     │  (shared database) │
└─────────────────┘     └──────────────┘     └────────────────────┘
                                                       ▲
┌─────────────────┐     ┌──────────────┐               │
│  menace-store    │────▶│  Cloudflare   │───────────────┘
│  (CF Workers)    │     │  Workers      │
└─────────────────┘     └──────────────┘
```

Both the admin and storefront share the **same D1 database** (`5208d6ac-b7b7-41d2-bcd6-2a7a4962c8b0`).

---

## Build & Preview Locally

```bash
# Build the OpenNext bundle
npm run build:cloudflare

# Preview with local D1 (uses Miniflare)
npm run preview:cloudflare
```

The local preview runs at `http://localhost:8787` with a local D1 instance.

---

## Deploy to Cloudflare

```bash
# Deploy to production
npm run deploy:cloudflare
```

This deploys to:
```
https://menace-admin.<your-account>.workers.dev
```

---

## Verify After Deploy

1. **Products page**: Visit `/products` — should show products from D1
2. **Create product**: Use the admin form — should persist to D1
3. **Cross-check storefront**: Visit the storefront `/shop` — new product should appear
4. **Error boundary**: If D1 access fails, you'll see the actual error message (not "This page couldn't load")

---

## Environment Variables

The following are set in `wrangler.toml` under `[vars]`:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk auth public key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Sign-in redirect path |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | Post-login redirect |
| `ADMIN_EMAILS` | Comma-separated admin email allowlist |

For secrets (Clerk secret key), use:
```bash
npx wrangler secret put CLERK_SECRET_KEY
```

---

## D1 Database Bindings

Defined in `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "menace-db"
database_id = "5208d6ac-b7b7-41d2-bcd6-2a7a4962c8b0"
```

The admin accesses D1 via `getCloudflareContext().env.DB` (provided by `@opennextjs/cloudflare`).

---

## What to Do with Vercel

> **Pause the Vercel deployment — do NOT delete it.**

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select the `menace-admin` project
3. Go to **Settings → General → Pause Project**
4. This keeps the deployment history and config intact as a fallback

---

## Troubleshooting

### "D1 binding not found" or empty products page

- Verify `wrangler.toml` has the correct `database_id`
- Ensure `getCloudflareContext()` is being called in `lib/db/index.ts`
- Check that tables exist: `npx wrangler d1 execute menace-db --command "SELECT name FROM sqlite_master WHERE type='table'"`

### Build fails with "Cannot find module '@opennextjs/cloudflare'"

```bash
npm install @opennextjs/cloudflare
```

### Local preview shows fallback data instead of D1

This is expected — local preview uses Miniflare's local D1, which may not have seeded data. Deploy to production to see real D1 data.

### Migrations

Run pending migrations against the remote D1:
```bash
npx wrangler d1 migrations apply menace-db
```
