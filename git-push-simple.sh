#!/bin/bash

echo "🚀 SUBIDA DIRECTA A GITHUB"
echo "══════════════════════════"
echo ""

# Solicitar datos
echo "Por favor ingresa la siguiente información:"
echo ""
echo -n "1. Tu usuario de GitHub: "
read usuario
echo ""
echo -n "2. Pega tu token (ghp_...): "
read -s token
echo ""
echo ""

# Validar
if [ -z "$usuario" ] || [ -z "$token" ]; then
    echo "❌ Error: Faltan datos"
    exit 1
fi

echo "✅ Datos recibidos"
echo "Usuario: $usuario"
echo ""

# Limpiar remote anterior
git remote remove origin 2>/dev/null

# Push directo con credenciales
echo "Subiendo a GitHub..."
echo ""

git remote add origin https://github.com/$usuario/agora-token-server.git
git branch -M main
git push https://$usuario:$token@github.com/$usuario/agora-token-server.git main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ ¡SUBIDO EXITOSAMENTE!"
    echo ""
    echo "Ahora ejecuta: ./railway-simple.sh"
    echo ""
else
    echo ""
    echo "❌ Error. Verifica:"
    echo "1. Que el repo exista: https://github.com/$usuario/agora-token-server"
    echo "2. Que el token sea correcto"
    echo ""
fi

