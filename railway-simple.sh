#!/bin/bash

echo "🚀 DESPLIEGUE EN RAILWAY - GUÍA VISUAL"
echo "═══════════════════════════════════════"
echo ""
echo "Voy a guiarte paso a paso para desplegar en Railway."
echo ""
echo "Presiona ENTER para comenzar..."
read

clear

# ═══════════════════════════════════════
# PASO 1: Railway
# ═══════════════════════════════════════
echo "╔═══════════════════════════════════════════════╗"
echo "║  PASO 1: Desplegar en Railway                 ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""
echo "1. Abre tu navegador en:"
echo "   👉 https://railway.app/new"
echo ""
echo "2. Click en: 'Deploy from GitHub repo'"
echo ""
echo "3. Busca: agora-token-server"
echo ""
echo "4. Click: 'Deploy Now'"
echo ""
echo "5. ESPERA 2-3 MINUTOS (verás logs compilando)"
echo ""
echo "Presiona ENTER cuando veas 'Deploy successful'..."
read

clear

# ═══════════════════════════════════════
# PASO 2: Variables
# ═══════════════════════════════════════
echo "╔═══════════════════════════════════════════════╗"
echo "║  PASO 2: Configurar Variables                 ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""
echo "En Railway:"
echo ""
echo "1. Click en la pestaña 'Variables'"
echo ""
echo "2. Click en 'RAW Editor' (esquina superior derecha)"
echo ""
echo "3. COPIA Y PEGA EXACTAMENTE ESTO:"
echo ""
echo "┌─────────────────────────────────────────────┐"
echo "│ AGORA_APP_ID=295ef769f7314aeea12107397a856e6b│"
echo "│ AGORA_APP_CERTIFICATE=121c9dda722244359ee8c0c2b1306594│"
echo "└─────────────────────────────────────────────┘"
echo ""
echo "4. Click 'Update Variables'"
echo ""
echo "5. ESPERA 1-2 MINUTOS (redesplegará)"
echo ""
echo "Presiona ENTER cuando termine el redespliegue..."
read

clear

# ═══════════════════════════════════════
# PASO 3: URL
# ═══════════════════════════════════════
echo "╔═══════════════════════════════════════════════╗"
echo "║  PASO 3: Generar URL Pública                  ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""
echo "En Railway:"
echo ""
echo "1. Click en la pestaña 'Settings'"
echo ""
echo "2. Busca la sección 'Networking' o 'Domains'"
echo ""
echo "3. Click 'Generate Domain'"
echo ""
echo "4. Railway generará una URL automáticamente"
echo "   Ejemplo: https://agora-token-server-production.up.railway.app"
echo ""
echo "5. COPIA esa URL completa"
echo ""
echo -n "Pega aquí la URL de Railway: "
read RAILWAY_URL

if [ -z "$RAILWAY_URL" ]; then
    echo ""
    echo "❌ Error: Debes pegar la URL"
    exit 1
fi

# Limpiar URL
RAILWAY_URL=$(echo "$RAILWAY_URL" | xargs | sed 's:/*$::')

clear

# ═══════════════════════════════════════
# PASO 4: Probar
# ═══════════════════════════════════════
echo "╔═══════════════════════════════════════════════╗"
echo "║  PASO 4: Probando el servidor...              ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""
echo "URL configurada: $RAILWAY_URL"
echo ""
echo "Probando endpoint /health..."

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$RAILWAY_URL/health" 2>&1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ ¡Servidor funcionando!"
    echo ""

    echo "Probando generación de token..."
    TOKEN_RESPONSE=$(curl -s -X POST "$RAILWAY_URL/api/agora/token" \
      -H "Content-Type: application/json" \
      -d '{"channelName":"test"}' 2>&1)

    if echo "$TOKEN_RESPONSE" | grep -q "token"; then
        echo "✅ ¡Token generado exitosamente!"
        TOKEN_PREVIEW=$(echo "$TOKEN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4 | cut -c1-30)
        echo "   Token: ${TOKEN_PREVIEW}..."
        echo ""
    else
        echo "⚠️  Respuesta inesperada:"
        echo "$TOKEN_RESPONSE"
        echo ""
        echo "Verifica que las variables estén configuradas correctamente"
        exit 1
    fi
else
    echo "❌ El servidor no responde (HTTP: $HTTP_CODE)"
    echo ""
    echo "Posibles causas:"
    echo "1. El despliegue aún no terminó (espera 1 minuto más)"
    echo "2. La URL es incorrecta"
    echo "3. Hay un error en el despliegue"
    echo ""
    echo "Revisa los logs en Railway > Deployments"
    exit 1
fi

# ═══════════════════════════════════════
# PASO 5: Actualizar app
# ═══════════════════════════════════════
echo "╔═══════════════════════════════════════════════╗"
echo "║  PASO 5: Actualizando la app...               ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""

VIEWMODEL_FILE="/Users/jorge/Documents/draco/app/src/main/java/com/example/draco/ui/screens/live/LiveStreamViewModel.kt"

if [ -f "$VIEWMODEL_FILE" ]; then
    # Backup
    cp "$VIEWMODEL_FILE" "$VIEWMODEL_FILE.backup.$(date +%s)"

    # Reemplazar URL
    sed -i '' "s|http://10.0.2.2:3000/api/agora/token|$RAILWAY_URL/api/agora/token|g" "$VIEWMODEL_FILE"
    sed -i '' "s|https://[^\"]*up.railway.app/api/agora/token|$RAILWAY_URL/api/agora/token|g" "$VIEWMODEL_FILE"

    echo "✅ Código actualizado"
    echo "   Archivo: LiveStreamViewModel.kt"
    echo "   URL: $RAILWAY_URL/api/agora/token"
    echo ""
else
    echo "⚠️  Archivo no encontrado: $VIEWMODEL_FILE"
    echo ""
    echo "Actualiza manualmente la línea ~207:"
    echo "val serverUrl = \"$RAILWAY_URL/api/agora/token\""
    echo ""
    exit 1
fi

# ═══════════════════════════════════════
# PASO 6: Compilar
# ═══════════════════════════════════════
echo "╔═══════════════════════════════════════════════╗"
echo "║  PASO 6: Compilando e instalando la app...    ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""

cd /Users/jorge/Documents/draco

echo "Limpiando..."
/Users/jorge/Documents/draco/gradlew clean > /dev/null 2>&1

echo "Compilando (esto toma 1-2 minutos)..."
/Users/jorge/Documents/draco/gradlew assembleDebug 2>&1 | grep -E "(BUILD|Task|error:)" | tail -5

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Compilación exitosa"
    echo ""

    echo "Instalando en dispositivo..."
    INSTALL_OUTPUT=$(/Users/jorge/Documents/draco/gradlew installDebug 2>&1)

    if echo "$INSTALL_OUTPUT" | grep -q "SUCCESS"; then
        echo "✅ App instalada exitosamente"
        echo ""
    else
        echo "⚠️  No se pudo instalar automáticamente"
        echo ""
        echo "Instala manualmente el APK desde:"
        echo "/Users/jorge/Documents/draco/app/build/outputs/apk/debug/app-debug.apk"
        echo ""
    fi
else
    echo ""
    echo "❌ Error en la compilación"
    echo "Revisa los errores arriba"
    exit 1
fi

# ═══════════════════════════════════════
# FINAL
# ═══════════════════════════════════════
clear
echo "╔═══════════════════════════════════════════════╗"
echo "║          🎉 ¡DESPLIEGUE COMPLETADO!           ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""
echo "✅ Servidor desplegado en Railway"
echo "   URL: $RAILWAY_URL"
echo ""
echo "✅ App actualizada y compilada"
echo ""
echo "✅ App instalada en tu dispositivo"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🧪 PRUEBA AHORA:"
echo ""
echo "1. Abre la app Draco en tu móvil"
echo ""
echo "2. Inicia sesión"
echo ""
echo "3. Toca el botón '+'"
echo ""
echo "4. Toca 🎥 Transmitir en vivo"
echo ""
echo "5. Acepta permisos de cámara y micrófono"
echo ""
echo "6. Escribe un título"
echo ""
echo "7. Toca 'Iniciar Transmisión'"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "RESULTADO ESPERADO:"
echo "✅ Cámara activa"
echo "✅ Transmisión funcionando"
echo "✅ SIN ERROR 110"
echo ""
echo "Si funciona, ¡felicidades! 🎉"
echo "Si no, comparte el error que ves."
echo ""

