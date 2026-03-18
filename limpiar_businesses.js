const admin = require('firebase-admin');
const serviceAccount = require('./draco-firebase-adminsdk.json');

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db = admin.firestore();

async function verificarYLimpiar() {
  console.log('\n🔍 VERIFICANDO COLECCIÓN "businesses"...\n');

  const snap = await db.collection('businesses').get();

  if (snap.empty) {
    console.log('✅ La colección businesses está vacía - no hay datos de ejemplo');
    process.exit(0);
  }

  console.log(`📊 Total documentos en "businesses": ${snap.size}\n`);

  const porTipo = {};
  snap.forEach(doc => {
    const data = doc.data();
    const tipo = data.type || data.businessType || 'DESCONOCIDO';
    if (!porTipo[tipo]) porTipo[tipo] = [];
    porTipo[tipo].push({ id: doc.id, name: data.name || data.businessName || '(sin nombre)', owner: data.ownerId || data.userId || '' });
  });

  Object.entries(porTipo).forEach(([tipo, items]) => {
    console.log(`📁 Tipo: ${tipo} (${items.length} registros)`);
    items.forEach(item => console.log(`   - ${item.name} | id: ${item.id} | owner: ${item.owner}`));
  });

  // Preguntar si hay que borrar
  console.log('\n🗑️  BORRANDO TODOS LOS DOCUMENTOS DE EJEMPLO...\n');

  let borrados = 0;
  for (const doc of snap.docs) {
    const data = doc.data();
    const nombre = data.name || data.businessName || doc.id;
    const tipo = data.type || 'DESCONOCIDO';

    // Borrar subcolecciones
    const subcolecciones = ['menu', 'rooms', 'events', 'works', 'photos', 'orders'];
    for (const sub of subcolecciones) {
      const subSnap = await doc.ref.collection(sub).get();
      for (const subDoc of subSnap.docs) await subDoc.ref.delete();
    }

    await doc.ref.delete();
    console.log(`   ✅ Borrado [${tipo}]: ${nombre}`);
    borrados++;
  }

  console.log(`\n✅ ${borrados} documento(s) borrado(s) de "businesses"`);
  console.log('✅ Los nuevos usuarios pueden crear sus propios negocios y artistas\n');

  process.exit(0);
}

verificarYLimpiar().catch(e => {
  console.error('�� Error:', e.message);
  process.exit(1);
});

