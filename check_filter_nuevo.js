/**
 * check_filter_nuevo.js
 * Verifica que el nuevo filtro (createdAt >= Mar 12, 2026) bloquea correctamente
 * a los 17 usuarios antiguos (Oct/Nov 2025).
 */
const admin = require('firebase-admin');
const serviceAccount = require('./draco-firebase-adminsdk.json');
if (admin.apps.length === 0) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
const firestore = admin.firestore();

// ✅ NUEVO cutoff: 12 Marzo 2026 00:00:00 UTC
const CUTOFF = 1773273600000;

firestore.collection('users').get().then(snap => {
    console.log('\n🔎 VERIFICACIÓN DEL NUEVO FILTRO');
    console.log('══════════════════════════════════════════════════════');
    console.log('Cutoff: ' + new Date(CUTOFF).toISOString() + ' (Mar 12, 2026)');
    console.log('Total usuarios en Firestore: ' + snap.size);
    console.log('══════════════════════════════════════════════════════\n');

    let visibles = 0, bloqueados = 0;
    snap.docs.forEach(doc => {
        const d = doc.data();
        const createdAt = d.createdAt || 0;
        // ✅ NUEVO filtro: SOLO createdAt >= cutoff
        const pasa = createdAt >= CUTOFF;
        if (pasa) visibles++; else bloqueados++;
        const cDate = createdAt ? new Date(createdAt).toLocaleDateString('es-ES') : '(sin fecha)';
        console.log((pasa ? '✅ VISIBLE  ' : '🚫 BLOQUEADO') + ' | ' + d.email + ' | createdAt: ' + cDate);
    });

    console.log('\n══════════════════════════════════════════════════════');
    console.log('✅ Visibles en "Buscar":  ' + visibles + ' (solo usuarios nuevos desde hoy)');
    console.log('🚫 Bloqueados (antiguos): ' + bloqueados);
    console.log('══════════════════════════════════════════════════════\n');

    if (bloqueados === snap.size) {
        console.log('🎉 PERFECTO: Los ' + snap.size + ' usuarios antiguos están BLOQUEADOS.');
        console.log('   La pestaña "Buscar" aparecerá vacía hasta que se registre un usuario nuevo.');
    } else {
        console.log('⚠️  ATENCIÓN: ' + visibles + ' usuario(s) pasan el filtro.');
    }

    process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });

