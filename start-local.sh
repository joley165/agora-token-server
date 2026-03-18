#!/bin/bash
# ✅ Inicia el servidor de tokens Agora localmente
# Ejecuta: bash start-local.sh

echo "🚀 Iniciando servidor de tokens Agora..."
cd "$(dirname "$0")"

# Instalar dependencias si no existen
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

# Matar cualquier proceso en puerto 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null

echo "✅ Servidor iniciado en http://localhost:3000"
echo "   Presiona Ctrl+C para detener"
node server.js
