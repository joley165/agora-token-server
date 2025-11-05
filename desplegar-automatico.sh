echo -e "${BLUE}🔨 Compilando app...${NC}"
/Users/jorge/Documents/draco/gradlew assembleDebug

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ ¡App compilada exitosamente!${NC}"
    echo ""

    echo -e "${BLUE}📱 Instalando en dispositivo...${NC}"
    /Users/jorge/Documents/draco/gradlew installDebug

    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✅ ¡App instalada!${NC}"
        echo ""
    else
        echo ""
        echo -e "${YELLOW}⚠️  No se pudo instalar automáticamente${NC}"
        echo "Instala manualmente desde:"
        echo "  app/build/outputs/apk/debug/app-debug.apk"
        echo ""
    fi
else
    echo ""
    echo -e "${YELLOW}⚠️  Error en la compilación${NC}"
    echo "Revisa los errores arriba"
    echo ""
    exit 1
fi

echo ""
echo "════════════════════════════════════════════"
echo "✅ ¡DESPLIEGUE COMPLETADO!"
echo "════════════════════════════════════════════"
echo ""
echo "🎉 Todo está listo:"
echo ""
echo "✅ Servidor desplegado en: $RAILWAY_URL"
echo "✅ App actualizada con la URL del servidor"
echo "✅ App compilada e instalada"
echo ""
echo "🧪 PRUEBA AHORA:"
echo ""
echo "1. Abre la app Draco en tu móvil"
echo "2. Inicia sesión"
echo "3. Toca '+' > Transmitir en vivo"
echo "4. Acepta permisos"
echo "5. Escribe un título"
echo "6. Toca 'Iniciar Transmisión'"
echo ""
echo "DEBERÍA FUNCIONAR SIN ERROR 110 🎥"
echo ""
echo "════════════════════════════════════════════"
#!/bin/bash

echo "🚀 DESPLIEGUE AUTOMÁTICO EN RAILWAY"
echo "===================================="
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Paso 1: Preparando repositorio...${NC}"
cd /Users/jorge/Documents/draco/agora-token-server

# Verificar que tenemos los archivos necesarios
if [ ! -f "server.js" ]; then
    echo "❌ Error: server.js no encontrado"
    exit 1
fi

echo -e "${GREEN}✅ Archivos del servidor verificados${NC}"
echo ""

# Mostrar instrucciones para GitHub
echo -e "${YELLOW}📝 INSTRUCCIONES PARA TI:${NC}"
echo ""
echo "════════════════════════════════════════════"
echo "1️⃣  CREA EL REPOSITORIO EN GITHUB"
echo "════════════════════════════════════════════"
echo ""
echo "Ve a: https://github.com/new"
echo ""
echo "Configuración:"
echo "  - Repository name: agora-token-server"
echo "  - Public ☑️"
echo "  - NO marques nada más"
echo "  - Click 'Create repository'"
echo ""
echo "Presiona ENTER cuando hayas creado el repo..."
read

echo ""
echo "════════════════════════════════════════════"
echo "2️⃣  INGRESA TU USUARIO DE GITHUB"
echo "════════════════════════════════════════════"
echo ""
echo -n "Tu usuario de GitHub: "
read GITHUB_USER

if [ -z "$GITHUB_USER" ]; then
    echo "❌ Error: Debes ingresar tu usuario"
    exit 1
fi

echo ""
echo -e "${BLUE}📤 Configurando remote de GitHub...${NC}"

# Remover remote anterior si existe
git remote remove origin 2>/dev/null

# Agregar nuevo remote
git remote add origin "https://github.com/$GITHUB_USER/agora-token-server.git"

echo -e "${GREEN}✅ Remote configurado${NC}"
echo ""
echo -e "${BLUE}📤 Subiendo código a GitHub...${NC}"
echo ""

# Intentar push
git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ ¡Código subido exitosamente a GitHub!${NC}"
    echo ""
else
    echo ""
    echo -e "${YELLOW}⚠️  Si te pidió autenticación:${NC}"
    echo ""
    echo "1. Username: $GITHUB_USER"
    echo "2. Password: Crea un token en https://github.com/settings/tokens/new"
    echo "   - Note: Railway deploy"
    echo "   - Expiration: 90 days"
    echo "   - Scopes: ☑️ repo"
    echo "   - Generate token"
    echo "   - Copia el token (ghp_xxxxx)"
    echo "   - Úsalo como contraseña"
    echo ""
    echo "Intenta de nuevo:"
    echo "  git push -u origin main"
    echo ""
    exit 1
fi

echo ""
echo "════════════════════════════════════════════"
echo "3️⃣  DESPLIEGA EN RAILWAY"
echo "════════════════════════════════════════════"
echo ""
echo "Abre tu navegador en:"
echo "  https://railway.app/new"
echo ""
echo "Sigue estos pasos:"
echo ""
echo "1. Click 'Deploy from GitHub repo'"
echo ""
echo "2. Selecciona: $GITHUB_USER/agora-token-server"
echo ""
echo "3. Click 'Deploy Now'"
echo ""
echo "4. Espera 2-3 minutos a que termine el despliegue"
echo ""
echo "5. Click en 'Variables' (pestaña)"
echo ""
echo "6. Click 'RAW Editor' y pega EXACTAMENTE esto:"
echo ""
echo "AGORA_APP_ID=295ef769f7314aeea12107397a856e6b"
echo "AGORA_APP_CERTIFICATE=121c9dda722244359ee8c0c2b1306594"
echo ""
echo "7. Click 'Update Variables'"
echo ""
echo "8. Espera 1 minuto (redesplegará automáticamente)"
echo ""
echo "9. Click 'Settings' > 'Networking' > 'Generate Domain'"
echo ""
echo "10. COPIA LA URL generada"
echo ""
echo "Presiona ENTER cuando tengas la URL de Railway..."
read

echo ""
echo "════════════════════════════════════════════"
echo "4️⃣  INGRESA LA URL DE RAILWAY"
echo "════════════════════════════════════════════"
echo ""
echo -n "Pega tu URL de Railway: "
read RAILWAY_URL

if [ -z "$RAILWAY_URL" ]; then
    echo "❌ Error: Debes ingresar la URL"
    exit 1
fi

# Limpiar URL (remover espacios y slash final)
RAILWAY_URL=$(echo "$RAILWAY_URL" | xargs | sed 's:/*$::')

echo ""
echo -e "${BLUE}🧪 Probando el servidor...${NC}"
echo ""

# Probar health endpoint
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$RAILWAY_URL/health")

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ ¡Servidor funcionando!${NC}"
    echo ""

    # Probar generación de token
    echo -e "${BLUE}🔑 Probando generación de token...${NC}"
    TOKEN_RESPONSE=$(curl -s -X POST "$RAILWAY_URL/api/agora/token" \
      -H "Content-Type: application/json" \
      -d '{"channelName":"test"}')

    if echo "$TOKEN_RESPONSE" | grep -q "token"; then
        echo -e "${GREEN}✅ ¡Token generado exitosamente!${NC}"
        echo ""
        echo "Respuesta del servidor:"
        echo "$TOKEN_RESPONSE" | head -3
        echo ""
    else
        echo -e "${YELLOW}⚠️  El servidor responde pero no generó token${NC}"
        echo "Respuesta: $TOKEN_RESPONSE"
        echo ""
    fi
else
    echo -e "${YELLOW}⚠️  El servidor no responde (HTTP $HTTP_CODE)${NC}"
    echo "Verifica que el despliegue haya terminado en Railway"
    echo ""
fi

echo ""
echo "════════════════════════════════════════════"
echo "5️⃣  ACTUALIZANDO LA APP"
echo "════════════════════════════════════════════"
echo ""

# Actualizar LiveStreamViewModel.kt
VIEWMODEL_FILE="/Users/jorge/Documents/draco/app/src/main/java/com/example/draco/ui/screens/live/LiveStreamViewModel.kt"

if [ -f "$VIEWMODEL_FILE" ]; then
    echo -e "${BLUE}📝 Actualizando LiveStreamViewModel.kt...${NC}"

    # Backup
    cp "$VIEWMODEL_FILE" "$VIEWMODEL_FILE.backup"

    # Reemplazar URL
    sed -i '' "s|http://10.0.2.2:3000/api/agora/token|$RAILWAY_URL/api/agora/token|g" "$VIEWMODEL_FILE"

    echo -e "${GREEN}✅ URL actualizada en el código${NC}"
    echo "URL configurada: $RAILWAY_URL/api/agora/token"
    echo ""
else
    echo -e "${YELLOW}⚠️  No se encontró LiveStreamViewModel.kt${NC}"
    echo "Actualiza manualmente línea 207 con: $RAILWAY_URL/api/agora/token"
    echo ""
fi

echo ""
echo "════════════════════════════════════════════"
echo "6️⃣  RECOMPILANDO LA APP"
echo "════════════════════════════════════════════"
echo ""

cd /Users/jorge/Documents/draco

echo -e "${BLUE}🧹 Limpiando proyecto...${NC}"
/Users/jorge/Documents/draco/gradlew clean

echo ""

