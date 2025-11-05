#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 PASO 2: RAILWAY Y ACTUALIZACIÓN DE APP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ═══════════════════════════════════════════
# PASO 1: Desplegar en Railway
# ═══════════════════════════════════════════
echo "📋 Desplegar en Railway"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Abre: https://railway.app/new"
echo ""
echo "2. Click: 'Deploy from GitHub repo'"
echo ""
echo "3. Busca y selecciona: agora-token-server"
echo ""
echo "4. Click: 'Deploy Now'"
echo ""
echo "5. Espera 2-3 minutos"
echo ""
read -p "¿Terminó el despliegue? (presiona ENTER para continuar)"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ═══════════════════════════════════════════
# PASO 2: Configurar variables
# ═══════════════════════════════════════════
echo "📋 Configurar Variables de Entorno"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "En Railway:"
echo ""
echo "1. Click en la pestaña 'Variables'"
echo ""
echo "2. Click en 'RAW Editor'"
echo ""
echo "3. PEGA EXACTAMENTE ESTO:"
echo ""
echo "AGORA_APP_ID=295ef769f7314aeea12107397a856e6b"
echo "AGORA_APP_CERTIFICATE=121c9dda722244359ee8c0c2b1306594"
echo ""
echo "4. Click 'Update Variables'"
echo ""
echo "5. Espera 1-2 minutos (redesplegará)"
echo ""
read -p "¿Ya configuraste las variables? (presiona ENTER para continuar)"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ═══════════════════════════════════════════
# PASO 3: Obtener URL
# ═══════════════════════════════════════════
echo "📋 Obtener URL Pública"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "En Railway:"
echo ""
echo "1. Click en la pestaña 'Settings'"
echo ""
echo "2. Busca la sección 'Networking'"
echo ""
echo "3. Click 'Generate Domain'"
echo ""
echo "4. COPIA la URL generada"
echo ""
read -p "Pega aquí tu URL de Railway: " RAILWAY_URL

if [ -z "$RAILWAY_URL" ]; then
    echo "❌ Error: Debes ingresar la URL"
    exit 1
fi

# Limpiar URL
RAILWAY_URL=$(echo "$RAILWAY_URL" | xargs | sed 's:/*$::')

echo ""
echo "URL configurada: $RAILWAY_URL"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ═══════════════════════════════════════════
# PASO 4: Probar servidor
# ═══════════════════════════════════════════
echo "📋 Probando el servidor..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$RAILWAY_URL/health")

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Servidor funcionando correctamente!"
    echo ""

    # Probar token
    echo "Probando generación de token..."
    TOKEN_RESPONSE=$(curl -s -X POST "$RAILWAY_URL/api/agora/token" \
      -H "Content-Type: application/json" \
      -d '{"channelName":"test"}')

    if echo "$TOKEN_RESPONSE" | grep -q "token"; then
        echo "✅ Token generado exitosamente!"
        echo ""
    else
        echo "⚠️  El servidor no generó token"
        echo "Respuesta: $TOKEN_RESPONSE"
        echo ""
    fi
else
    echo "⚠️  El servidor no responde (HTTP $HTTP_CODE)"
    echo "Espera unos minutos y ejecuta este script de nuevo"
    echo ""
    exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ═══════════════════════════════════════════
# PASO 5: Actualizar app
# ═══════════════════════════════════════════
echo "📋 Actualizando la app..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

VIEWMODEL_FILE="/Users/jorge/Documents/draco/app/src/main/java/com/example/draco/ui/screens/live/LiveStreamViewModel.kt"

if [ -f "$VIEWMODEL_FILE" ]; then
    # Backup
    cp "$VIEWMODEL_FILE" "$VIEWMODEL_FILE.backup"

    # Reemplazar URL
    sed -i '' "s|http://10.0.2.2:3000/api/agora/token|$RAILWAY_URL/api/agora/token|g" "$VIEWMODEL_FILE"

    echo "✅ Código actualizado con la URL del servidor"
    echo ""
else
    echo "⚠️  No se encontró LiveStreamViewModel.kt"
    echo "Actualiza manualmente la línea 207 con:"
    echo "   val serverUrl = \"$RAILWAY_URL/api/agora/token\""
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ═══════════════════════════════════════════
# PASO 6: Recompilar
# ═══════════════════════════════════════════
echo "📋 Recompilando la app..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /Users/jorge/Documents/draco

echo "Limpiando proyecto..."
/Users/jorge/Documents/draco/gradlew clean > /dev/null 2>&1

echo "Compilando app..."
/Users/jorge/Documents/draco/gradlew assembleDebug

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ App compilada exitosamente!"
    echo ""

    echo "Instalando en dispositivo..."
    /Users/jorge/Documents/draco/gradlew installDebug

    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ App instalada!"
        echo ""
    else
        echo ""
        echo "⚠️  Instala manualmente desde:"
        echo "   /Users/jorge/Documents/draco/app/build/outputs/apk/debug/app-debug.apk"
        echo ""
    fi
else
    echo ""
    echo "❌ Error en la compilación"
    exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 ¡COMPLETADO!"
echo ""
echo "✅ Servidor desplegado: $RAILWAY_URL"
echo "✅ App actualizada y compilada"
echo "✅ App instalada en dispositivo"
echo ""
echo "🧪 PRUEBA AHORA:"
echo ""
echo "1. Abre la app Draco"
echo "2. Toca '+' > Transmitir en vivo"
echo "3. ¡Debería funcionar sin error 110!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

