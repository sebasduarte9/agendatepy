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

# 0.1 Crear secretos si el archivo base los dejó vacíos
if ! command -v openssl &> /dev/null; then
    apt-get update -y
    apt-get install -y openssl
fi

ensure_secret() {
    local key="$1"
    local current_value
    current_value="$(sed -n "s/^${key}=//p" .env | tail -n 1 | tr -d '\"' | tr -d "'")"
    if [ -z "$current_value" ] || [ "$current_value" = "tu_clave_evolution" ]; then
        local generated_value
        generated_value="$(openssl rand -hex 32)"
        if grep -q "^${key}=" .env; then
            sed -i "s#^${key}=.*#${key}=${generated_value}#" .env
        else
            printf '\n%s=%s\n' "$key" "$generated_value" >> .env
        fi
    fi
}

ensure_secret "EVOLUTION_API_KEY"
ensure_secret "CRON_SECRET"

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

# 3. Levantar Evolution y luego la aplicación
echo "📲 Iniciando la pasarela de WhatsApp..."
docker compose -f docker-compose.evolution.yml up -d

echo "🏗️ Construyendo e iniciando la aplicación y el programador de recordatorios..."
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
