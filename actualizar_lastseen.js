/**
 * actualizar_lastseen.js
 * ─────────────────────────────────────────────────────────────────────
 * Actualiza lastSeen = ahora para todos los usuarios en Firestore
 * que tienen lastSeen = 0 (nunca han hecho login con la app nueva).
 *
 * Ejecutar: node actualizar_lastseen.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('./draco-firebase-adminsdk.json');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const firestore = admin.firestore();

async function actualizarLastSeen() {
  console.log('\n🔥 ACTUALIZANDO lastSeen DE TODOS LOS USUARIOS...\n');

  const ahora = Date.now();
  const snap = await firestore.collection('users').get();
  console.log(`📊 Total usuarios en Firestore: ${snap.size}\n`);

  let actualizados = 0;
  let yaActivos = 0;
  let errores = 0;

  for (const doc of snap.docs) {
    const d = doc.data();
    const lastSeen = d.lastSeen || 0;
    const email = d.email || doc.id;

    // Solo actualizar si lastSeen es 0 o muy antiguo (antes de Oct 2025)
    const OCT_2025 = 1746057600000; // Oct 1, 2025
    if (lastSeen < OCT_2025) {
      try {
        await firestore.collection('users').doc(doc.id).update({
          lastSeen: ahora,
          isOnline: false  // No están online ahora mismo, pero sí activos
        });
        console.log(`✅ ${email} → lastSeen actualizado`);
        actualizados++;
      } catch (e) {
        console.error(`❌ Error actualizando ${email}: ${e.message}`);
        errores++;
      }
    } else {
      console.log(`⏭️  ${email} → ya tiene lastSeen reciente (${new Date(lastSeen).toLocaleDateString('es-ES')})`);
      yaActivos++;
    }
  }

  console.log('\n══════════════════════════════════════════════════════');
  console.log('📊 RESUMEN:');
  console.log(`   ✅ Actualizados: ${actualizados}`);
  console.log(`   ⏭️  Ya activos:  ${yaActivos}`);
  console.log(`   ❌ Errores:     ${errores}`);
  console.log('══════════════════════════════════════════════════════');
  console.log('\n✅ Los usuarios ya aparecerán correctamente en la búsqueda de amigos.\n');

  process.exit(0);
}

actualizarLastSeen().catch(e => {
  console.error('❌ Error fatal:', e);
  process.exit(1);
});

