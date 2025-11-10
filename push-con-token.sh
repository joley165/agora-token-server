#!/bin/bash

echo "🔑 CONFIGURACIÓN MANUAL DE GIT CON TOKEN"
echo "════════════════════════════════════════════"
echo ""

# Pedir usuario
read -p "Ingresa tu usuario de GitHub: " GITHUB_USER

if [ -z "$GITHUB_USER" ]; then
    echo "❌ Error: Debes ingresar tu usuario"
    exit 1
fi

echo ""
echo "Usuario: $GITHUB_USER"
echo ""

# Pedir token
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚠️  IMPORTANTE: Pega tu token de GitHub"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "El token debe empezar con: ghp_"
echo ""
read -sp "Pega el token aquí: " GITHUB_TOKEN
echo ""

if [ -z "$GITHUB_TOKEN" ]; then
    echo ""
    echo "❌ Error: Debes ingresar el token"
    exit 1
fi

echo ""
echo "✅ Token recibido"
echo ""

# Remover remote anterior
echo "Configurando remote..."
git remote remove origin 2>/dev/null

# Agregar remote con token incluido
git remote add origin "https://${GITHUB_USER}:${GITHUB_TOKEN}@github.com/${GITHUB_USER}/agora-token-server.git"

echo "✅ Remote configurado"
echo ""

# Configurar rama
git branch -M main

# Push
echo "Subiendo código a GitHub..."
echo ""

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ ¡CÓDIGO SUBIDO EXITOSAMENTE!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Verifica en: https://github.com/$GITHUB_USER/agora-token-server"
    echo ""
    echo "AHORA ejecuta:"
    echo "  ./railway-simple.sh"
    echo ""

    # Limpiar el token del remote por seguridad
    git remote remove origin 2>/dev/null
    git remote add origin "https://github.com/${GITHUB_USER}/agora-token-server.git"
    echo "✅ Credenciales limpiadas del historial"
    echo ""
else
    echo ""
    echo "❌ Error al hacer push"
    echo ""
    echo "Verifica que:"
    echo "1. El token sea correcto (empiece con ghp_)"
    echo "2. El repositorio exista en GitHub"
    echo "3. El token tenga permisos de 'repo'"
    echo ""
    exit 1
fi

