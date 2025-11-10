#!/bin/bash

# Este script te ayudará a subir el código a GitHub paso a paso

echo "🚀 SUBIENDO CÓDIGO A GITHUB"
echo "══════════════════════════════════════"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "server.js" ]; then
    echo "❌ Error: Ejecuta este script desde /agora-token-server/"
    exit 1
fi

echo "✅ Estamos en el directorio correcto"
echo ""

# Pedir usuario de GitHub
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PASO 1: Ingresa tu usuario de GitHub"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "¿Ya creaste el repositorio en GitHub?"
echo "(https://github.com/new con nombre: agora-token-server)"
echo ""
read -p "Presiona ENTER cuando hayas creado el repo..."
echo ""

read -p "Ingresa tu usuario de GitHub: " GITHUB_USER

if [ -z "$GITHUB_USER" ]; then
    echo "❌ Error: Debes ingresar tu usuario"
    exit 1
fi

echo ""
echo "Usuario: $GITHUB_USER"
echo ""

# Configurar remote
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PASO 2: Configurando remote de GitHub..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Remover remote anterior si existe
git remote remove origin 2>/dev/null

# Agregar nuevo remote
git remote add origin "https://github.com/$GITHUB_USER/agora-token-server.git"

echo "✅ Remote configurado: https://github.com/$GITHUB_USER/agora-token-server.git"
echo ""

# Configurar rama
echo "Configurando rama main..."
git branch -M main
echo "✅ Rama configurada"
echo ""

# Intentar push
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PASO 3: Subiendo código a GitHub..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Se te pedirá:"
echo "  Username: $GITHUB_USER"
echo "  Password: [tu token de GitHub - ghp_...]"
echo ""
echo "⚠️  IMPORTANTE: El password es el TOKEN, no tu contraseña"
echo ""
echo "Si no tienes token, créalo aquí:"
echo "  https://github.com/settings/tokens/new"
echo "  Scope: repo"
echo ""
read -p "Presiona ENTER para hacer push..."
echo ""

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ ¡CÓDIGO SUBIDO EXITOSAMENTE!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Verifica en: https://github.com/$GITHUB_USER/agora-token-server"
    echo ""
    echo "AHORA ejecuta el siguiente comando para continuar con Railway:"
    echo ""
    echo "  ./railway-simple.sh"
    echo ""
else
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "❌ ERROR AL HACER PUSH"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Posibles causas:"
    echo "1. No creaste el token de GitHub"
    echo "2. Usaste tu contraseña en lugar del token"
    echo "3. El repositorio ya existe con otro nombre"
    echo ""
    echo "Solución:"
    echo "1. Crea un token en: https://github.com/settings/tokens/new"
    echo "2. Scope: ☑️ repo"
    echo "3. Ejecuta de nuevo este script: ./subir-github.sh"
    echo ""
    exit 1
fi

