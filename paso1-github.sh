#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 GUÍA PASO A PASO - DESPLIEGUE EN RAILWAY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ═══════════════════════════════════════════
# PASO 1: Crear repositorio en GitHub
# ═══════════════════════════════════════════
echo "📋 PASO 1: Crear repositorio en GitHub"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Abre en tu navegador: https://github.com/new"
echo ""
echo "2. Configura así:"
echo "   Repository name: agora-token-server"
echo "   Public: ☑️"
echo "   (NO marques nada más)"
echo ""
echo "3. Click 'Create repository'"
echo ""
echo "4. NO CIERRES la página de GitHub"
echo ""
read -p "¿Ya creaste el repositorio? (presiona ENTER para continuar)"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ═══════════════════════════════════════════
# PASO 2: Obtener usuario de GitHub
# ═══════════════════════════════════════════
echo "📋 PASO 2: Configurar repositorio"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "Ingresa tu usuario de GitHub: " GITHUB_USER

if [ -z "$GITHUB_USER" ]; then
    echo "❌ Error: Debes ingresar tu usuario"
    exit 1
fi

echo ""
echo "Configurando remote para: $GITHUB_USER/agora-token-server"

# Remover remote anterior si existe
git remote remove origin 2>/dev/null

# Agregar nuevo remote
git remote add origin "https://github.com/$GITHUB_USER/agora-token-server.git"

echo "✅ Remote configurado"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ═══════════════════════════════════════════
# PASO 3: Push a GitHub
# ═══════════════════════════════════════════
echo "📋 PASO 3: Subir código a GitHub"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Intentando push..."
echo ""

git branch -M main
git push -u origin main

if [ $? -ne 0 ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "⚠️  NECESITAS AUTENTICACIÓN"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "GitHub requiere un Personal Access Token."
    echo ""
    echo "Sigue estos pasos:"
    echo ""
    echo "1. Abre: https://github.com/settings/tokens/new"
    echo ""
    echo "2. Configura:"
    echo "   Note: Railway Deploy"
    echo "   Expiration: 90 days"
    echo "   Scopes: ☑️ repo (marca solo este)"
    echo ""
    echo "3. Click 'Generate token'"
    echo ""
    echo "4. COPIA el token (comienza con ghp_...)"
    echo ""
    echo "5. Ejecuta este comando:"
    echo ""
    echo "   git push -u origin main"
    echo ""
    echo "   Username: $GITHUB_USER"
    echo "   Password: [pega tu token aquí]"
    echo ""
    echo "6. Después de hacer push exitoso, ejecuta:"
    echo "   ./paso2-railway.sh"
    echo ""
    exit 1
fi

echo ""
echo "✅ ¡Código subido a GitHub exitosamente!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ═══════════════════════════════════════════
# PASO 4: Guía para Railway
# ═══════════════════════════════════════════
echo "📋 PASO 4: Desplegar en Railway"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "AHORA ejecuta el siguiente script:"
echo ""
echo "   ./paso2-railway.sh"
echo ""
echo "Ese script te guiará para:"
echo "  - Desplegar en Railway"
echo "  - Obtener la URL"
echo "  - Actualizar y compilar la app"
echo ""

