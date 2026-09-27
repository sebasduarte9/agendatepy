---
name: nextjs-fullstack-expert
description: Best practices and architectural patterns for Next.js 15 App Router, React 19 Server Components, Prisma ORM queries, real-time database reactivity, Turbopack, and edge caching for multi-tenant SaaS applications.
---

# Next.js Fullstack & Prisma Architecture Skill

This skill guides fullstack development on Next.js 15+ and Prisma ORM within multi-tenant SaaS environments.

## 1. Server Components vs Client Components

- **Server Components (`app/page.tsx`, etc.):**
  - Run exclusively on Node.js runtime.
  - Direct database access via `import { prisma } from "@/lib/db"`.
  - Zero client JavaScript bundle impact for data fetching.
  - Use `export const dynamic = "force-dynamic"` when serving real-time live data.
- **Client Components (`"use client"`):**
  - Reserved for interactive UI: state toggles, modals, audio players, charts, animations.
  - Receive serializable props from parent Server Components.

## 2. Multi-Tenant Resolution
- In Next.js 16/15, host detection uses `request.headers.get("host")` or `proxy.ts`.
- Subdomain isolation: `barberia.agendatepy.com` routes internally to `/[tenant]/reservar`.
- Apex domain (`agendatepy.com` / `localhost:3000`) renders marketing and public showcase.

## 3. Prisma ORM Best Practices
- Never instantiate multiple `new PrismaClient()` instances in development: always use singleton pattern in `lib/db.ts`.
- Avoid N+1 queries by including relations:
  ```ts
  const staff = await prisma.staff.findMany({
    include: {
      services: { include: { service: true } },
      appointments: { include: { service: true } },
    },
  });
  ```
- Always calculate financial figures (PYG Guaraníes) with integer math (no floating point cents).
