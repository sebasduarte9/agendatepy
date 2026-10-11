#!/bin/bash
cd "$(dirname "$0")"

echo "=============================================="
echo "    Iniciando Landing Page de AgendatePY      "
echo "=============================================="
echo ""

if [ ! -d "node_modules" ]; then
  echo "Instalando dependencias de la landing..."
  npm install
fi

echo "Iniciando servidor de desarrollo en http://localhost:3005 ..."
echo "Presiona Ctrl + C para detener."
echo ""

# Abrir el navegador tras 2 segundos
(sleep 2 && open "http://localhost:3005") &

npm run dev
