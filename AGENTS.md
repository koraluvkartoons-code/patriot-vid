# Base44 Dev Environment

## Stack
- Vite 5.4 + React 18 + TypeScript + Tailwind (Lovable-generated)
- Bun for dependency management (`bun.lockb`)
- Supabase as remote backend (hosted — not run locally)

## Running the app
```
docker compose -f docker-compose.base44.yml up -d
```
- Vite dev server runs inside `oven/bun:1.1`, bind-mounted at `/app`
- Serves on host port 3000 (container port 8080)
- Live reload enabled via `CHOKIDAR_USEPOLLING=true` (needed for bind mounts)

## Required environment variables
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` — Supabase anon/publishable key
- Placeholders in `.env.base44-defaults` let the app boot without real credentials
- Real values go in `/run/base44/app.env` (platform-managed) and override placeholders
- Without real credentials the UI renders but Supabase data calls fail silently (uses `Promise.allSettled`)

## Key config notes
- `vite.config.ts` uses `allowedHosts: true` and `host: "0.0.0.0"` so the preview proxy can reach the dev server (Vite 5.4 DNS-rebinding protection otherwise returns 403)
- The `oven/bun:1.1` image has no `curl`; healthcheck uses `bun -e` with `fetch()`
- Supabase edge functions live in `supabase/functions/` — deployed to Supabase, not run locally
