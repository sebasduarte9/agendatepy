# ── 1. Builder: dependencias completas, cliente Prisma y compilación ──────────
# También se usa como imagen de herramientas (migraciones y seed) desde
# docker-compose.prod.yml (servicio "migrate", target: builder).
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm ci

RUN npx prisma generate

COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Variables públicas disponibles en build time
ENV NEXT_PUBLIC_ROOT_DOMAIN=agendatepy.com
ENV NEXT_PUBLIC_APP_URL=https://agendatepy.com

RUN npm run build && rm -rf .next/cache

# ── 2. Runtime: solo dependencias de producción + build ──────────────────────
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Cliente Prisma ya generado (el de npm ci --omit=dev es un stub sin el CLI)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/public ./public
COPY --from=builder --chown=node:node /app/.next ./.next

# Las imágenes subidas viven en un volumen montado acá; .next/cache la escribe next/image
RUN mkdir -p public/uploads && chown -R node:node public/uploads
USER node

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "run", "start"]
