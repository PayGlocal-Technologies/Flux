# Fix: Set basePath so Flux works under /flux-ui proxy

## Problem

This repo is proxied at `payglocal.in/flux-ui` via a Next.js rewrite. Without `basePath`, all
asset URLs (`/_next/static/...`) are root-relative and 404 when served through the proxy.

## Changes required

### 1. `next.config.js` (or `next.config.mjs`)

Add `basePath` and `assetPrefix`:

```js
const nextConfig = {
  basePath: "/flux-ui",
  assetPrefix: "/flux-ui",
  // ...rest of existing config
};
```

### 2. Internal `<Link>` and `<Image>` components

Next.js `<Link href="...">` and `<Image src="...">` automatically respect `basePath` — no changes needed.

### 3. Any hardcoded absolute paths

If any `fetch("/api/...")` calls or `src="/..."` attributes exist, prefix them with `/flux-ui` or
use a env var:

```js
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";
fetch(`${BASE}/api/something`);
```

Set in `.env.production`:
```
NEXT_PUBLIC_BASE_PATH=/flux-ui
```

### 4. Redeploy to Vercel

After the config change, redeploy. The rewrite on `payglocal.in` is already in place:

```
/flux-ui      → https://flux-docs-dusky.vercel.app/
/flux-ui/:path* → https://flux-docs-dusky.vercel.app/:path*
```

## Verification

1. Visit `payglocal.in/flux-ui` — page should load with styles and assets.
2. Visit `flux-docs-dusky.vercel.app/` directly — will 404 (expected, basePath set to /flux-ui).
   If direct access is needed, keep a separate deployment without basePath.
