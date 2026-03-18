const admin = require('firebase-admin');
const sa = require('./draco-firebase-adminsdk.json');
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

const NOMBRES_BUSCAR = ['jorgensen', 'loma dorada', 'loma', 'milton', 'fiestas'];

async function buscarEnTodo() {
  console.log('\n🔍 BÚSQUEDA EXHAUSTIVA EN FIREBASE...\n');

  // Listar TODAS las colecciones raíz
  const rootCols = await db.listCollections();
  console.log('📋 Colecciones raíz encontradas:');
  rootCols.forEach(c => console.log('   - ' + c.id));

  console.log('\n🔎 Buscando en cada colección...\n');

  for (const col of rootCols) {
    const snap = await col.get();
    if (snap.empty) continue;

    let encontrados = [];
    snap.forEach(doc => {
      const data = doc.data();
      const vals = JSON.stringify(data).toLowerCase();
      const esMatch = NOMBRES_BUSCAR.some(n => vals.includes(n));
      if (esMatch) {
        encontrados.push({ id: doc.id, data });
      }
    });

    if (encontrados.length > 0) {
      console.log(`✅ ENCONTRADO en colección "${col.id}":`);
      encontrados.forEach(e => {
        const d = e.data;
        console.log(`   ID: ${e.id}`);
        console.log(`   name: ${d.name || d.businessName || d.title || '?'}`);
        console.log(`   type: ${d.type || d.businessType || '?'}`);
        console.log(`   status: ${d.status || '?'}`);
      });
    }
  }

  console.log('\n✅ Búsqueda completada\n');
  process.exit(0);
}

buscarEnTodo().catch(e => { console.error('Error:', e.message); process.exit(1); });

