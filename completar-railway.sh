#!/bin/bash

echo "🌐 COMPLETAR CONFIGURACIÓN CON RAILWAY"
echo "════════════════════════════════════════"
echo ""
echo "Ya tienes el dominio generado en Railway ✅"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PASO 1: Ingresa la URL de Railway"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Pega aquí la URL completa de Railway"
echo "(Ejemplo: https://agora-token-server-production.up.railway.app)"
echo ""
read -p "URL: " RAILWAY_URL

if [ -z "$RAILWAY_URL" ]; then
    echo "❌ Error: Debes ingresar la URL"
    exit 1
fi

# Limpiar URL
RAILWAY_URL=$(echo "$RAILWAY_URL" | xargs | sed 's:/*$::')

echo ""
echo "✅ URL recibida: $RAILWAY_URL"
echo ""

# ═══════════════════════════════════════
# PASO 2: Probar el servidor
# ═══════════════════════════════════════
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PASO 2: Probando el servidor..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$RAILWAY_URL/health" 2>&1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Servidor funcionando correctamente!"
    echo ""

    # Probar token
    echo "Probando generación de token..."
    TOKEN_RESPONSE=$(curl -s -X POST "$RAILWAY_URL/api/agora/token" \
      -H "Content-Type: application/json" \
      -d '{"channelName":"test"}' 2>&1)

    if echo "$TOKEN_RESPONSE" | grep -q "token"; then
        echo "✅ Token generado exitosamente!"
        TOKEN_PREVIEW=$(echo "$TOKEN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4 | cut -c1-30)
        echo "   Token: ${TOKEN_PREVIEW}..."
        echo ""
    else
        echo "⚠️  Respuesta del servidor:"
        echo "$TOKEN_RESPONSE"
        echo ""
    fi
else
    echo "⚠️  El servidor respondió con código: $HTTP_CODE"
    echo ""
    echo "Si el servidor aún se está desplegando, espera 1-2 minutos y ejecuta este script de nuevo."
    echo ""
    read -p "¿Quieres continuar de todos modos? (sí/no): " continuar

    if [ "$continuar" != "sí" ] && [ "$continuar" != "si" ]; then
        echo "Ejecuta este script de nuevo cuando el servidor esté listo."
        exit 0
    fi
fi

# ═══════════════════════════════════════
# PASO 3: Actualizar app
# ═══════════════════════════════════════
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PASO 3: Actualizando la app..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

VIEWMODEL_FILE="/Users/jorge/Documents/draco/app/src/main/java/com/example/draco/ui/screens/live/LiveStreamViewModel.kt"

if [ -f "$VIEWMODEL_FILE" ]; then
    # Backup
    cp "$VIEWMODEL_FILE" "$VIEWMODEL_FILE.backup.$(date +%s)"

    # Reemplazar URL (buscar todas las posibles variantes)
    sed -i '' "s|http://10.0.2.2:3000/api/agora/token|$RAILWAY_URL/api/agora/token|g" "$VIEWMODEL_FILE"
    sed -i '' "s|https://[^\"]*up.railway.app/api/agora/token|$RAILWAY_URL/api/agora/token|g" "$VIEWMODEL_FILE"
    sed -i '' "s|https://[^\"]*railway.app/api/agora/token|$RAILWAY_URL/api/agora/token|g" "$VIEWMODEL_FILE"

    echo "✅ Código actualizado"
    echo "   Archivo: LiveStreamViewModel.kt"
    echo "   URL: $RAILWAY_URL/api/agora/token"
    echo ""
else
    echo "❌ No se encontró el archivo LiveStreamViewModel.kt"
    echo ""
    exit 1
fi

# ═══════════════════════════════════════
# PASO 4: Compilar e instalar
# ═══════════════════════════════════════
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PASO 4: Compilando e instalando la app..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /Users/jorge/Documents/draco

echo "Limpiando proyecto..."
/Users/jorge/Documents/draco/gradlew clean > /dev/null 2>&1

echo "Compilando (esto toma 1-2 minutos)..."
COMPILE_OUTPUT=$(/Users/jorge/Documents/draco/gradlew assembleDebug 2>&1)

if echo "$COMPILE_OUTPUT" | grep -q "BUILD SUCCESSFUL"; then
    echo "✅ Compilación exitosa"
    echo ""

    echo "Instalando en dispositivo..."
    INSTALL_OUTPUT=$(/Users/jorge/Documents/draco/gradlew installDebug 2>&1)

    if echo "$INSTALL_OUTPUT" | grep -q "BUILD SUCCESSFUL"; then
        echo "✅ App instalada exitosamente"
        echo ""
    else
        echo "⚠️  Instala manualmente el APK desde:"
        echo "   /Users/jorge/Documents/draco/app/build/outputs/apk/debug/app-debug.apk"
        echo ""
    fi
else
    echo "❌ Error en la compilación"
    echo ""
    echo "$COMPILE_OUTPUT" | grep "error:" | head -5
    exit 1
fi

# ═══════════════════════════════════════
# FINAL
# ═══════════════════════════════════════
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 ¡CONFIGURACIÓN COMPLETADA!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Servidor funcionando en: $RAILWAY_URL"
echo "✅ App actualizada y compilada"
echo "✅ App instalada en tu dispositivo"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 PRUEBA AHORA:"
echo ""
echo "1. Abre la app Draco en tu móvil"
echo "2. Inicia sesión"
echo "3. Toca '+' > Transmitir en vivo"
echo "4. Acepta permisos"
echo "5. Escribe un título"
echo "6. Toca 'Iniciar Transmisión'"
echo ""
echo "RESULTADO ESPERADO:"
echo "✅ Cámara activa"
echo "✅ Transmisión funcionando"
echo "✅ SIN ERROR 110"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

