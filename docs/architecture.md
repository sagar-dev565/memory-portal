# Memory Portal — Product Levels & Architecture

Memory Portal is split into **levels**. Each level has its own audience, purpose and
tech stack, but all levels share one design language (`packages/tokens`).

| Level | Name | Who it's for | Purpose | Stack | Lives in |
|---|---|---|---|---|---|
| 0 | **Public Website** | Visitors, families, studios | Explain services, build trust, convert ("Preserve My Memories") | Astro | `apps/website` |
| 1 | **Customer Portal** | Families / customers | View, organise and share memories — emotional first | Next.js | `apps/portal` → `/app` |
| 2 | **Studio Portal** | Studio partners & their team | Create client portals, upload at volume, deliver, earn | Next.js | `apps/portal` → `/studio` |
| 3 | **Admin Portal** | Memory Portal operations | Customers, studios, orders, digitization, storage, payments | Next.js | `apps/portal` → `/admin` |

## Why two stacks

- **Astro (Level 0)** — the public site is mostly content. Astro ships almost no
  JavaScript, so pages load fast and rank well in search.
- **Next.js (Levels 1–3)** — the portals are authenticated, interactive apps
  (timeline, video player, uploads, permissions). One Next.js app with three
  route groups keeps auth, components and data access in one place.

## How the levels feel different

| | Website | Customer | Studio | Admin |
|---|---|---|---|---|
| Tone | Warm, persuasive | Emotional, calm | Fast, practical | Data-dense, precise |
| Primary goal | Convert | Relive & share | Deliver projects | Operate the business |
| Density | Spacious | Spacious | Medium | Compact |
| Serif headings | Yes | Yes | Sparingly | No |

## Repository layout

```
memory-portal/
├── apps/
│   ├── website/        Level 0 — Astro public website
│   └── portal/         Levels 1–3 — Next.js dashboards (coming next)
├── packages/
│   └── tokens/         Shared colours, type, spacing, radius, elevation
└── docs/
    └── architecture.md
```

## V1 build order (from the design brief, section 33)

1. Level 0 — Landing page, services, pricing ✅ (started)
2. Level 1 — Signup/login, dashboard, family timeline, event page, photo gallery, video player, upload, family members
3. Level 2 — Studio landing, dashboard, clients, create portal, upload center, preview, delivery
4. Level 3 — Admin dashboard, order & digitization tracking
