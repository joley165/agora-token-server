const express = require('express');
const cors = require('cors');
const { RtcTokenBuilder, RtcRole } = require('agora-token');

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de Agora
const APP_ID = '295ef769f7314aeea12107397a856e6b';
const APP_CERTIFICATE = '121c9dda722244359ee8c0c2b1306594';

// Endpoint para generar tokens
app.post('/api/agora/token', (req, res) => {
    try {
        const { channelName, uid = 0, role = 'publisher' } = req.body;

        if (!channelName) {
            return res.status(400).json({
                error: 'channelName es requerido'
            });
        }

        // Configurar rol
        const userRole = role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

        // Token válido por 24 horas
        const expirationTimeInSeconds = 86400;
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

        // Generar token
        const token = RtcTokenBuilder.buildTokenWithUid(
            APP_ID,
            APP_CERTIFICATE,
            channelName,
            uid,
            userRole,
            privilegeExpiredTs
        );

        console.log(`✅ Token generado para canal: ${channelName}`);

        res.json({
            token: token,
            appId: APP_ID,
            channelName: channelName,
            uid: uid,
            expiresAt: privilegeExpiredTs
        });

    } catch (error) {
        console.error('❌ Error generando token:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            message: error.message
        });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Servidor de tokens Agora funcionando' });
});

// Puerto
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor de tokens Agora ejecutándose en puerto ${PORT}`);
    console.log(`📡 App ID: ${APP_ID.substring(0, 8)}...`);
    console.log(`🔐 App Certificate configurado`);
});

module.exports = app;

