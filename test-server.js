const http = require('http');

// Configuración
const SERVER_URL = 'http://localhost:3000';

// Test de generación de token
function testTokenGeneration() {
    const postData = JSON.stringify({
        channelName: 'test_channel_123',
        uid: 0,
        role: 'publisher'
    });

    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/agora/token',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    console.log('🧪 Probando generación de token...\n');

    const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            try {
                const response = JSON.parse(data);

                if (res.statusCode === 200) {
                    console.log('✅ Token generado exitosamente!');
                    console.log('\nRespuesta del servidor:');
                    console.log('  Token:', response.token.substring(0, 50) + '...');
                    console.log('  App ID:', response.appId);
                    console.log('  Canal:', response.channelName);
                    console.log('  UID:', response.uid);
                    console.log('  Expira en:', new Date(response.expiresAt * 1000).toLocaleString());
                    console.log('\n🎉 El servidor está funcionando correctamente!');
                } else {
                    console.log('❌ Error del servidor:');
                    console.log('  Status:', res.statusCode);
                    console.log('  Error:', response.error);
                }
            } catch (error) {
                console.log('❌ Error parseando respuesta:', error.message);
                console.log('  Respuesta raw:', data);
            }
        });
    });

    req.on('error', (error) => {
        console.log('❌ Error de conexión:', error.message);
        console.log('\n⚠️  Asegúrate de que el servidor esté corriendo:');
        console.log('   npm start');
    });

    req.write(postData);
    req.end();
}

// Health check
function testHealthCheck() {
    http.get(`${SERVER_URL}/health`, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            console.log('🏥 Health Check:', JSON.parse(data).message);
            console.log('');
            testTokenGeneration();
        });
    }).on('error', (error) => {
        console.log('❌ El servidor no está corriendo en puerto 3000');
        console.log('   Ejecuta: npm start');
    });
}

// Ejecutar test
console.log('🚀 Iniciando pruebas del servidor de tokens Agora...\n');
testHealthCheck();

