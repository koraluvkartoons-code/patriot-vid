# Base44 Setup Notes — ByteTicker

## Stack
- **Frontend**: Vite 5 + React 18 + TypeScript + shadcn-ui (Tailwind), served on port 8080 inside the container (mapped to host 3000).
- **Backend**: Hosted Supabase (Postgres + Storage + Realtime + Edge Functions). There is no local backend — all data goes through the Supabase JS client.
- **Package manager**: `bun.lockb` is committed, but the Base44 compose uses `npm install` (node:22-slim) which works fine from `package.json`.

## Running
```
docker compose -f docker-compose.base44.yml up -d --build
```
The web service runs `npm install` then `npx vite --host 0.0.0.0 --port 8080`. Source is bind-mounted, so edits hot-reload.

## Required env vars (all VITE_ prefixed, client-side)
| Var | Source |
|-----|--------|
| `VITE_SUPABASE_URL` | Supabase Dashboard → Project Settings → API → Project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase Dashboard → Project Settings → API → anon public key |
| `VITE_SUPABASE_PROJECT_ID` | Supabase Dashboard → Project Settings → General → Reference ID |

Development placeholders live in `.env.base44-defaults` (first env_file); real values from `/run/base44/app.env` override them. Without real Supabase credentials the UI renders but all data features (posts, streams, chat) return errors.

## Supabase project
- Project ID (from `supabase/config.toml`): `tklfsclrviluloczabpx`
- 8 migrations in `supabase/migrations/`
- 2 edge functions: `livekit-token` (needs LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_URL) and `chat-action` (needs SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY). These run on Supabase's infrastructure, not locally.

## Vite config
`allowedHosts: true` added to `vite.config.ts` so the preview proxy host is accepted.

## Healthcheck
Node-based `fetch` to `http://localhost:8080/` — no curl needed in the slim image.
