# MENACE Admin Portal — Production Cockpit

The **MENACE Admin Portal** is a high-density, real-time command center and order fulfillment cockpit for Gen Z apparel brand **MENACE**. Built with **Next.js 15 App Router**, **Cloudflare D1**, **Clerk RBAC**, **TanStack Table**, and **PWA Offline Sync**.

---

## ⚡ Architecture & Dual-Mode Viewport

The interface automatically switches between two distinct operational modes using CSS container & viewport queries (no fragile user-agent sniffing):

### 1. Desktop Mode (`>= 1024px`)
- **Dense & Fast**: Optimized for warehouse operators, dispatch stations, and inventory managers.
- **Fixed Sidebar**: Keyboard-first navigation with `G D` (Dashboard), `G O` (Orders), `G P` (Products), `G I` (Inventory), `G X` (Discounts), `G A` (Analytics), `G S` (Settings).
- **Command Palette**: Press `Cmd + K` or `Ctrl + K` anywhere to jump between views, search catalog items, or trigger actions.
- **Data Grids**: Powered by **TanStack Table** with multi-column sorting, pagination, and instantaneous search.

### 2. Mobile Mode (`< 1024px`)
- **Thumb-Friendly Bottom Tab Bar**: Home, Orders, Products, Alerts, and More.
- **Swipe-to-Fulfill Gestures**:
  - **Swipe Right** on an order → Marks order as **PACKED**.
  - **Swipe Left** on an order → Marks order as **SHIPPED**.
- **Floating Action Button (FAB)**: Rapid access to Add Product, Scan Barcode, Create Promo, and Search.
- **Native Share Sheet Printing**: Tapping "Print Label" opens the native OS print or share dialog.
- **Camera Sensor Integration**: Optical camera simulation for hangtag barcodes and R2 sample photography.

---

## 📲 Progressive Web App (PWA) & Offline Mode

- **Installable**: Full-screen standalone mode on iOS and Android home screens.
- **Shell Caching**: Core screens and assets are cached by `/public/sw.js`.
- **Offline Fallback Screen**: When connectivity is lost, displays `/app/offline/page.tsx` ("No signal. Try again.").
- **Background Sync Queue**: Status changes (e.g. marking orders shipped while offline) are queued in `localStorage` and automatically synchronized when signal returns.
- **Web Push Notifications**: Notification permission prompts & live test stubs for new drop orders, low stock warnings, and drop velocity.

---

## 🔐 Auth & Role Matrix

Shares the **SAME Clerk tenant** as the Menace Storefront.

| Capability / Screen | Unauthenticated / Customer | Staff Role | Admin Role |
|---|:---:|:---:|:---:|
| `/dashboard` Telemetry | ❌ (Redirect / Stealth 404) | ✅ | ✅ |
| `/orders` Fulfillment & Detail | ❌ (Stealth 404) | ✅ (View + Pack + Ship) | ✅ (Full + Cancel) |
| `/customers` Directory & LTV | ❌ (Stealth 404) | ✅ (View) | ✅ (Full) |
| `/products` Catalog & CRUD | ❌ (Stealth 404) | ❌ (Stealth 404) | ✅ (Full Access) |
| `/inventory` Stock Steppers | ❌ (Stealth 404) | ✅ (View) | ✅ (Full Steppers) |
| `/discounts` Coupon Codes | ❌ (Stealth 404) | ❌ (Stealth 404) | ✅ (Full Access) |
| `/analytics` Drop Curves | ❌ (Stealth 404) | ✅ (View) | ✅ (Full Access) |
| `/settings` Store Config & RBAC | ❌ (Stealth 404) | ❌ (Stealth 404) | ✅ (Full Access) |

### Bootstrap Admin Access
Set your email in `ADMIN_EMAILS` inside `.env.local` or `wrangler.toml`:
```bash
ADMIN_EMAILS="zamin@menace.store,admin@menace.store"
```
Or set `publicMetadata: { "role": "admin" }` in your Clerk Dashboard.

---

## 🗄️ Database & Cloudflare D1

Shares the exact schema with the storefront:
- `products`, `product_variants`, `product_images`
- `drops`, `orders`, `order_items`, `customers`
- `discount_codes`, `inventory_log`, `settings`, `audit_log`

### Lazy-Initialization
The database client (`/lib/db/index.ts`) initializes lazily on first query to **completely prevent Cloudflare 1102 cold-start errors**. Outside of Cloudflare Workers, it falls back seamlessly to an in-memory seeded store with authentic Menace silhouettes.

---

## 🛠️ Development & Deployment

### Local Development
```bash
# Start Next.js development server with Webpack & PWA
npm run dev

# Run typecheck & build
npm run build
```

### Cloudflare Deployment
```bash
# Build with OpenNext Cloudflare
npm run build:cloudflare

# Deploy to Cloudflare Workers
npm run deploy:cloudflare
```
