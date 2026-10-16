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

COMPOSE="docker compose -f docker-compose.prod.yml"

echo "🏗️ Construyendo las imágenes (app y herramientas de base de datos)..."
$COMPOSE --profile tools build app migrate

# 4. Base de datos primero: la app nueva no recibe tráfico hasta que el esquema esté migrado
echo "🐘 Iniciando PostgreSQL..."
$COMPOSE up -d --wait postgres

# 5. Migraciones ANTES de levantar la app nueva (si fallan, el deploy se corta acá)
echo "🔄 Aplicando migraciones de base de datos..."
$COMPOSE --profile tools run --rm migrate

# 6. Seed de demo: BORRA todas las tablas. Solo con SEED_DEMO=1 explícito (ej. servidor nuevo):
#    SEED_DEMO=1 ./deploy.sh
if [ "${SEED_DEMO:-0}" = "1" ]; then
    echo "🌱 SEED_DEMO=1: borrando datos y creando la Barbería Demo..."
    $COMPOSE --profile tools run --rm -e SEED_DEMO=1 migrate npx prisma db seed
else
    echo "🌱 Seed de demo omitido (usá SEED_DEMO=1 solo en un servidor nuevo: borra todos los datos)."
fi

# 7. Levantar (o reemplazar) la app, el programador de recordatorios y nginx
echo "🚀 Iniciando la aplicación y el programador de recordatorios..."
$COMPOSE up -d app reminder-cron nginx

echo "========================================================"
echo "✅ ¡AgendatePY está en vivo!"
echo "🌐 Web Principal: https://agendatepy.com"
echo "🌐 Local Demo:    https://barberia.agendatepy.com/reservar"
echo "🌐 Panel Dueño:   https://agendatepy.com/dashboard"
echo "========================================================"
