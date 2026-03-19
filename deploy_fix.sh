#!/bin/bash
# =====================================================
# Deploy del fix del servidor Agora a Railway
# Funciona aunque uses Google para entrar a GitHub
# =====================================================

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  PASO 1 — Crea tu token de GitHub en Safari"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  1. Abre este enlace en Safari (ya estarás logueado con Google):"
echo ""
echo "     https://github.com/settings/tokens/new"
echo ""
echo "  2. En 'Note' escribe:  railway-deploy"
echo "  3. En 'Expiration' elige:  30 days"
echo "  4. Marca el checkbox:  ✅ repo  (el primero de la lista)"
echo "  5. Baja al final y click en:  Generate token"
echo "  6. COPIA el token que aparece (empieza con ghp_...)"
echo "     ⚠️  Solo se muestra UNA VEZ"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  PASO 2 — Pega el token aquí"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "  Tu usuario de GitHub: " GITHUB_USER
if [ -z "$GITHUB_USER" ]; then
    echo "❌ Ingresa tu usuario de GitHub"
    exit 1
fi

echo ""
# Leer el token sin mostrarlo en pantalla
read -s -p "  Pega tu token (ghp_...): " GITHUB_TOKEN
echo ""

if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ Necesitas pegar el token"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Subiendo a GitHub..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ✅ Usar token en la URL → no pide contraseña interactiva
REMOTE_URL="https://${GITHUB_USER}:${GITHUB_TOKEN}@github.com/${GITHUB_USER}/agora-token-server.git"
git remote set-url origin "$REMOTE_URL"

git push origin main 2>&1

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ ¡Servidor actualizado en GitHub!"
    echo "   Railway lo redesplegará automáticamente en ~2 minutos."
    echo ""
    echo "   Verifica el deploy en: https://railway.app"
else
    echo ""
    echo "❌ Error al subir. Posibles causas:"
    echo "   - El token no tiene el scope 'repo'"
    echo "   - El usuario de GitHub es incorrecto"
    echo "   - El token fue copiado incompleto"
fi

# Limpiar el token de la URL por seguridad
git remote set-url origin "https://github.com/${GITHUB_USER}/agora-token-server.git"
