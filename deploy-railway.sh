#!/bin/bash

echo "🚀 DESPLEGANDO SERVIDOR DE TOKENS EN RAILWAY"
echo ""
echo "============================================"
echo "PASO 1: Crear repositorio en GitHub"
echo "============================================"
echo ""
echo "1. Ve a: https://github.com/new"
echo "2. Repository name: agora-token-server"
echo "3. Description: Servidor de tokens para Agora RTC"
echo "4. Público o Privado (como prefieras)"
echo "5. NO marques 'Add a README file'"
echo "6. Click 'Create repository'"
echo ""
echo "Presiona ENTER cuando hayas creado el repositorio..."
read

echo ""
echo "============================================"
echo "PASO 2: Subir código a GitHub"
echo "============================================"
echo ""

# Pedir el usuario de GitHub
echo "Ingresa tu usuario de GitHub:"
read GITHUB_USER

echo ""
echo "Configurando repositorio..."

cd /Users/jorge/Documents/draco/agora-token-server

# Verificar si ya tiene git
if [ ! -d ".git" ]; then
    echo "Inicializando git..."
    git init
    git add .
    git commit -m "Servidor de tokens Agora"
fi

# Agregar remote
echo "Agregando remote de GitHub..."
git remote remove origin 2>/dev/null
git remote add origin "https://github.com/$GITHUB_USER/agora-token-server.git"

# Subir a GitHub
echo "Subiendo código a GitHub..."
git branch -M main
git push -u origin main --force

echo ""
echo "✅ Código subido a GitHub exitosamente!"
echo ""
echo "============================================"
echo "PASO 3: Desplegar en Railway"
echo "============================================"
echo ""
echo "Ahora ve a Railway y sigue estos pasos:"
echo ""
echo "1. Ve a: https://railway.app/new"
echo ""
echo "2. Click en 'Deploy from GitHub repo'"
echo ""
echo "3. Busca y selecciona: $GITHUB_USER/agora-token-server"
echo ""
echo "4. Railway comenzará a desplegar automáticamente"
echo ""
echo "5. Cuando termine, ve a 'Variables' y agrega:"
echo "   Variable 1:"
echo "     Name: AGORA_APP_ID"
echo "     Value: 295ef769f7314aeea12107397a856e6b"
echo ""
echo "   Variable 2:"
echo "     Name: AGORA_APP_CERTIFICATE"
echo "     Value: 121c9dda722244359ee8c0c2b1306594"
echo ""
echo "6. Ve a 'Settings' > 'Networking' > 'Generate Domain'"
echo ""
echo "7. COPIA LA URL generada (algo como: https://agora-token-server-production.up.railway.app)"
echo ""
echo "============================================"
echo "PASO 4: Actualizar la App"
echo "============================================"
echo ""
echo "Una vez que tengas la URL de Railway:"
echo ""
echo "1. Abre: app/src/main/java/com/example/draco/ui/screens/live/LiveStreamViewModel.kt"
echo ""
echo "2. Busca la línea 207 (aprox):"
echo "   val serverUrl = \"http://10.0.2.2:3000/api/agora/token\""
echo ""
echo "3. Cámbiala por tu URL de Railway:"
echo "   val serverUrl = \"https://TU-URL-RAILWAY.up.railway.app/api/agora/token\""
echo ""
echo "4. Guarda el archivo"
echo ""
echo "5. Recompila e instala:"
echo "   cd /Users/jorge/Documents/draco"
echo "   ./gradlew clean assembleDebug"
echo "   ./gradlew installDebug"
echo ""
echo "============================================"
echo "PASO 5: Probar"
echo "============================================"
echo ""
echo "1. Abre la app en tu móvil"
echo "2. Toca '+' > Transmitir en vivo"
echo "3. ¡Debería funcionar sin error 110!"
echo ""
echo "============================================"
echo "✅ FIN DEL SCRIPT"
echo "============================================"

