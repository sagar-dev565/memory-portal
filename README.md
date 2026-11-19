# Memory Portal

> Your memories deserve more than a box in the attic.

Memory Portal turns VHS tapes, DVDs, photos, film reels and cassettes into a private
family portal — a digital family heirloom where "our family story lives."

## Product levels

The product is split into four levels. See [`docs/architecture.md`](docs/architecture.md) for details.

| Level | Product | Stack | Folder | Status |
|---|---|---|---|---|
| 0 | Public Website & landing pages | Astro | `apps/website` | ✅ Landing page |
| 1 | Customer Portal (families) | Next.js | `apps/portal` → `/app` | Planned |
| 2 | Studio Portal (partners) | Next.js | `apps/portal` → `/studio` | Planned |
| 3 | Admin Portal (operations) | Next.js | `apps/portal` → `/admin` | Planned |

All levels share one design language in `packages/tokens` (warm ivory, charcoal, beige & gold;
Fraunces serif headings + Inter UI text).

## Getting started

Requires Node.js 18.20+ (20 or 22 recommended).

```bash
npm install            # installs all workspaces
npm run dev:website    # http://localhost:4321
npm run build:website  # static build → apps/website/dist
```

## Editing the website

- **Copy, services, pricing, FAQ:** `apps/website/src/data/site.ts`
- **Sections:** `apps/website/src/components/*.astro`
- **Colours, fonts, spacing:** `packages/tokens/tokens.css`

> Prices in `site.ts` are placeholders — update them before launch.
> Photo areas use warm placeholder tones — replace with authentic family photography.

## Structure

```
memory-portal/
├── apps/
│   ├── website/        Level 0 — Astro public website
│   └── portal/         Levels 1–3 — Next.js dashboards (next)
├── packages/
│   └── tokens/         Shared design tokens
└── docs/
    └── architecture.md
```
