#!/bin/bash
# Ejecuta: bash push_con_token.sh  ghp_XXXXXXXXXXXXXXXXXX
TOKEN=$1
if [ -z "$TOKEN" ]; then
  echo "Uso: bash push_con_token.sh ghp_TU_TOKEN_AQUI"
  exit 1
fi
git remote set-url origin "https://joley165:${TOKEN}@github.com/joley165/agora-token-server.git"
git push origin main
git remote set-url origin "https://github.com/joley165/agora-token-server.git"
echo "✅ Push completado. Railway redesplegará automáticamente en ~2 minutos."
