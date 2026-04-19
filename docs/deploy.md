# Deploy — gto.today

## Prerequisites
- Node 22+, pnpm 10+
- Vercel account (logged in via `pnpm vercel login`)
- GoDaddy access for gto.today (domain)

## One-time Vercel project setup

> Already done as of 2026-04-19: the project `gto-today` exists under team `jayj1990s-projects` on Vercel.

### Required: set Root Directory (monorepo)

Vercel needs to know the Next.js app lives in `apps/web`, not the monorepo root.

1. Go to <https://vercel.com/jayj1990s-projects/gto-today/settings>
2. Under **General → Root Directory**, click **Edit**
3. Enter **`apps/web`**
4. Check **"Include files outside of the Root Directory in the build step"** (critical for monorepo workspace deps)
5. Save

### Recommended: connect GitHub

On the same settings page, scroll to **Git** → click **Connect Git Repository** → select `jayj1990/gto-today`. This enables:
- Auto-deploy on every push to `main` (= production)
- Preview deploys on every PR / branch
- `vercel --prod` from CLI

## Deploying from CLI

```bash
# Preview (ephemeral URL, per deploy)
pnpm vercel deploy --yes

# Production (https://gto.today once domain is wired)
pnpm vercel deploy --prod --yes
```

Run from the repo root; the CLI picks up `.vercel/project.json` automatically.

## Domain connection (GoDaddy → Vercel)

### Option A — nameserver swap (recommended, full Vercel control)

1. In the Vercel dashboard, go to **Settings → Domains → Add** → enter `gto.today`
2. Vercel shows two nameservers, typically:
   - `ns1.vercel-dns.com`
   - `ns2.vercel-dns.com`
3. In **GoDaddy → DNS → Nameservers**, choose **"Change to custom"** and paste Vercel's two NS values
4. Save. Propagation: 1–24 hours (usually under 1h)

### Option B — keep GoDaddy nameservers (A + CNAME)

Use this only if other services on gto.today need custom DNS records (email, etc.):

1. In GoDaddy DNS, add:
   - `A` record → host `@` → value `76.76.21.21`
   - `CNAME` record → host `www` → value `cname.vercel-dns.com`
2. Back in Vercel, add `gto.today` and `www.gto.today`

## Environment variables

```bash
# Interactive
pnpm vercel env add

# From .env.local to all environments
pnpm vercel env pull .env.local
```

For the current Phase 6, no secrets are required — the app is static from Vercel's perspective. Real secrets arrive in Phase 5 (Upstash Redis, Anthropic API) and Phase 4 (Auth.js).

## Troubleshooting

- **"No Next.js version detected"** — Root Directory is not set; see "Required" above.
- **Build succeeds but routes 404** — check `outputDirectory` matches `apps/web/.next` or simply leave it blank after Root Directory is correct.
- **Workspace deps not found** — "Include files outside of the Root Directory" checkbox must be ON.
