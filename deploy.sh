#!/usr/bin/env bash
set -e

echo "========================================================"
echo "🚀 Despliegue de AgendatePY en Servidor (149.104.76.16)"
echo "========================================================"

# 0. Verificar archivo de configuración .env
if [ ! -f .env ]; then
    echo "⚠️ Archivo .env no encontrado."
    if [ -f frontend/.env.example ]; then
        echo "📝 Creando archivo .env base desde frontend/.env.example..."
        cp frontend/.env.example .env
    fi
fi

# 1. Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "📦 Instalando Docker y Docker Compose..."
    apt-get update -y
    apt-get install -y curl ca-certificates
    curl -fsSL https://get.docker.com | sh
fi

# 2. Configurar Firewall básico si ufw está disponible
if command -v ufw &> /dev/null; then
    echo "🛡️ Asegurando puertos con UFW (22, 80, 443)..."
    ufw allow 22/tcp || true
    ufw allow 80/tcp || true
    ufw allow 443/tcp || true
    ufw --force enable || true
fi

# 3. Levantar contenedores (PostgreSQL + Next.js App + Nginx)
echo "🏗️ Construyendo e iniciando contenedores de AgendatePY..."
docker compose -f docker-compose.prod.yml up -d --build

# 4. Esperar 8 segundos para inicialización de la base de datos
echo "⏳ Esperando arranque de PostgreSQL y la aplicación..."
sleep 8

# 5. Ejecutar migraciones de Prisma en la base de datos
echo "🔄 Aplicando migraciones de base de datos..."
docker compose -f docker-compose.prod.yml exec -T app npx prisma migrate deploy

# 6. Ejecutar seed para crear tenant inicial
echo "🌱 Poblando datos iniciales (Barbería Demo)..."
docker compose -f docker-compose.prod.yml exec -T app npx prisma db seed || true

echo "========================================================"
echo "✅ ¡AgendatePY está en vivo!"
echo "🌐 Web Principal: https://agendatepy.com"
echo "🌐 Local Demo:    https://barberia.agendatepy.com/reservar"
echo "🌐 Panel Dueño:   https://agendatepy.com/dashboard"
echo "========================================================"
