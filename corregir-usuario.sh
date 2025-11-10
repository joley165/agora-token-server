#!/bin/bash

echo "🔧 CORRECCIÓN DE USUARIO DE GITHUB"
echo "═══════════════════════════════════"
echo ""
echo "Veo que se configuró con un email: joley165@gmail.com"
echo "Pero GitHub necesita tu USUARIO, no tu email."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PASO 1: Encuentra tu usuario"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Ve a: https://github.com/settings/profile"
echo ""
echo "Busca la sección 'Public profile'"
echo "Tu usuario está ahí (NO es tu email)"
echo ""
echo "Ejemplo: si tu perfil es https://github.com/joleydev"
echo "Tu usuario es: joleydev"
echo ""
read -p "Presiona ENTER cuando sepas tu usuario..."
echo ""

read -p "Ingresa tu USUARIO de GitHub (NO el email): " USUARIO

if [ -z "$USUARIO" ]; then
    echo "❌ Error: Debes ingresar tu usuario"
    exit 1
fi

echo ""
echo "Usuario: $USUARIO"
echo ""

read -p "¿Tienes el token listo para pegar? (sí/no): " respuesta

if [ "$respuesta" != "sí" ] && [ "$respuesta" != "si" ]; then
    echo ""
    echo "Ve a: https://github.com/settings/tokens"
    echo "Busca el token que creaste (Railway)"
    echo "O crea uno nuevo en: https://github.com/settings/tokens/new"
    echo ""
    exit 1
fi

echo ""
read -sp "Pega el token: " TOKEN
echo ""

if [ -z "$TOKEN" ]; then
    echo ""
    echo "❌ Error: Debes pegar el token"
    exit 1
fi

echo ""
echo "✅ Datos recibidos"
echo ""

# Limpiar remote
echo "Limpiando configuración anterior..."
git remote remove origin 2>/dev/null

# Hacer push con credenciales correctas
echo "Subiendo a GitHub con el usuario correcto..."
echo ""

git push https://$USUARIO:$TOKEN@github.com/$USUARIO/agora-token-server.git main --set-upstream

if [ $? -eq 0 ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ ¡SUBIDO CORRECTAMENTE!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    # Configurar remote sin credenciales
    git remote add origin https://github.com/$USUARIO/agora-token-server.git

    echo "Verifica en: https://github.com/$USUARIO/agora-token-server"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "AHORA EJECUTA:"
    echo "  ./railway-simple.sh"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
else
    echo ""
    echo "❌ Error. Posibles causas:"
    echo "1. El usuario '$USUARIO' no es correcto"
    echo "2. El repositorio no existe en: https://github.com/$USUARIO/agora-token-server"
    echo "3. El token no es válido"
    echo ""
    echo "Verifica tu usuario en: https://github.com/settings/profile"
    echo ""
fi

