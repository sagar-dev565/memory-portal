# apps/portal — Levels 1–3 (Next.js)

This app will hold all three signed-in dashboards, separated by route group:

| Route | Level | Audience |
|---|---|---|
| `/app/*` | 1 — Customer Portal | Families |
| `/studio/*` | 2 — Studio Portal | Studio partners |
| `/admin/*` | 3 — Admin Portal | Memory Portal operations |

Planned structure:

```
apps/portal/
└── src/app/
    ├── (auth)/          login, signup, invitations
    ├── app/             Customer: dashboard, timeline, events, photos, videos, people, family, legacy
    ├── studio/          Studio: dashboard, clients, upload center, portal builder, preview, delivery
    └── admin/           Admin: dashboard, orders, digitization, storage, payments
```

It will import the same design tokens as the website:

```css
@import "@memory-portal/tokens/tokens.css";
```

Not scaffolded yet — the public website (Level 0) is being built first.
