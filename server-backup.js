const express = require('express');
const cors = require('cors');
const { RtcTokenBuilder, RtcRole } = require('agora-token');
const admin = require('firebase-admin');

const app = express();
app.use(cors());
app.use(express.json());

let firebaseInitialized = false;

try {
    let serviceAccount;

    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        console.log('📦 Usando credenciales desde variable de entorno...');
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } else {
        console.log('📦 Usando credenciales desde archivo local...');
        serviceAccount = require('./draco-firebase-adminsdk.json');
    }

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://draco-7a8f0.firebaseio.com"
    });

    firebaseInitialized = true;
    console.log('✅ Firebase Admin SDK inicializado correctamente');
} catch (error) {
    console.error('❌ Error inicializando Firebase Admin SDK:', error.message);
    console.warn('⚠️  Las notificaciones push NO funcionarán');
}

const APP_ID = '295ef769f7314aeea12107397a856e6b';
const APP_CERTIFICATE = '121c9dda722244359ee8c0c2b1306594';

app.post('/api/agora/token', (req, res) => {
    try {
        const { channelName, uid = 0, role = 'publisher' } = req.body;

        if (!channelName) {
            return res.status(400).json({ error: 'channelName es requerido' });
        }

        const userRole = role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
        const expirationTimeInSeconds = 86400;
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

        const token = RtcTokenBuilder.buildTokenWithUid(
            APP_ID,
            APP_CERTIFICATE,
            channelName,
            uid,
            userRole,
            privilegeExpiredTs
        );

        console.log('✅ Token generado para canal:', channelName);

        res.json({
            token: token,
            appId: APP_ID,
            channelName: channelName,
            uid: uid,
            expiresAt: privilegeExpiredTs
        });
    } catch (error) {
        console.error('❌ Error generando token:', error);
        res.status(500).json({ error: 'Error interno del servidor', message: error.message });
    }
});

app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Servidor funcionando',
        firebase: firebaseInitialized ? 'Activo' : 'Inactivo'
    });
});

app.post('/api/push/send', async (req, res) => {
    if (!firebaseInitialized) {
        return res.status(503).json({ error: 'Firebase Admin SDK no está inicializado' });
    }

    try {
        const { token, title, body, data, priority = 'high' } = req.body;

        if (!token || !title || !body) {
            return res.status(400).json({ error: 'token, title y body son requeridos' });
        }

        console.log('📤 Enviando notificación push:', title);

        const channelId = data?.type === 'incoming_call' ? 'CALLS' :
                         data?.type === 'livestream' ? 'LIVE' :
                         data?.type === 'chat_message' ? 'CHAT' : 'DEFAULT';

        const message = {
            token: token,
            notification: { title: title, body: body },
            data: data || {},
            android: {
                priority: priority,
                notification: { sound: 'default', channelId: channelId }
            },
            apns: {
                payload: { aps: { sound: 'default', badge: 1 } }
            }
        };

        const response = await admin.messaging().send(message);
        console.log('✅ Notificación enviada:', response);

        res.json({ success: true, messageId: response, sentAt: Date.now() });
    } catch (error) {
        console.error('❌ Error enviando notificación:', error);
        res.status(500).json({ error: 'Error enviando notificación', message: error.message });
    }
});

app.post('/api/push/send-multicast', async (req, res) => {
    if (!firebaseInitialized) {
        return res.status(503).json({ error: 'Firebase Admin SDK no está inicializado' });
    }

    try {
        const { tokens, title, body, data } = req.body;

        if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
            return res.status(400).json({ error: 'tokens debe ser un array no vacío' });
        }

        console.log('📤 Enviando notificación a', tokens.length, 'dispositivos');

        const channelId = data?.type === 'livestream' ? 'LIVE' :
                         data?.type === 'chat_message' ? 'CHAT' : 'DEFAULT';

        const message = {
            tokens: tokens,
            notification: { title: title, body: body },
            data: data || {},
            android: {
                priority: 'high',
                notification: { sound: 'default', channelId: channelId }
            }
        };

        const response = await admin.messaging().sendEachForMulticast(message);

        console.log('✅ Enviadas:', response.successCount + '/' + tokens.length);
        if (response.failureCount > 0) {
            console.log('⚠️  Fallidas:', response.failureCount);
        }

        res.json({
            success: true,
            successCount: response.successCount,
            failureCount: response.failureCount
        });
    } catch (error) {
        console.error('❌ Error enviando notificaciones:', error);
        res.status(500).json({ error: 'Error enviando notificaciones', message: error.message });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('🚀 Servidor ejecutándose en puerto', PORT);
    console.log('📡 App ID:', APP_ID.substring(0, 8) + '...');
    console.log('🔐 App Certificate configurado');
    console.log('🔔 Firebase Push:', firebaseInitialized ? 'ACTIVO ✅' : 'INACTIVO ⚠️');
});

module.exports = app;

