const admin = require('firebase-admin');
const sa = require('./draco-firebase-adminsdk.json');
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

async function buscarYBorrar() {
  console.log('\n🔍 BUSCANDO EN TODAS LAS COLECCIONES...\n');

  const colecciones = ['businesses', 'restaurants', 'artists', 'negocios', 'business'];
  const nombresABorrar = ['jorgensen', 'loma dorada', 'milton fiestas', 'loma', 'milton'];

  for (const col of colecciones) {
    const s = await db.collection(col).get();
    if (!s.empty) {
      console.log(`📁 COLECCION: ${col} (${s.size} docs)`);
      for (const d of s.docs) {
        const data = d.data();
        const nombre = (data.name || data.businessName || '').toLowerCase();
        const tipo = data.type || data.businessType || '?';
        console.log(`   ${d.id} | type=${tipo} | name=${data.name || data.businessName || '(sin nombre)'}`);

        // ¿Es uno de los que hay que borrar?
        const esEjemplo = nombresABorrar.some(n => nombre.includes(n));
        if (esEjemplo) {
          console.log(`   🗑️  → BORRANDO: ${data.name || data.businessName}`);
          // Borrar subcolecciones
          const subs = ['menu', 'rooms', 'events', 'works', 'photos', 'orders'];
          for (const sub of subs) {
            const subSnap = await d.ref.collection(sub).get();
            for (const sd of subSnap.docs) await sd.ref.delete();
          }
          await d.ref.delete();
          console.log(`   ✅ Borrado`);
        }
      }
    } else {
      console.log(`📁 ${col}: vacía`);
    }
  }

  // Verificar también RestaurantData hardcodeado
  console.log('\n📋 NOTA: Verificar también RestaurantData.kt para datos hardcodeados\n');
  process.exit(0);
}

buscarYBorrar().catch(e => { console.error('Error:', e.message); process.exit(1); });

