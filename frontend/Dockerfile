FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# 1. Dependencias
COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm ci

# 2. Generar cliente Prisma
RUN npx prisma generate

# 3. Compilación
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Permitir que las variables públicas estén disponibles en build time
ENV NEXT_PUBLIC_ROOT_DOMAIN=agendatepy.com
ENV NEXT_PUBLIC_APP_URL=https://agendatepy.com

RUN npm run build

# 4. Servidor de Producción
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "run", "start"]
