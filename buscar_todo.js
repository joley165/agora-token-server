const admin = require('firebase-admin');
const sa = require('./draco-firebase-adminsdk.json');
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

const BORRAR = ['jorgensen', 'loma dorada', 'loma', 'milton fiestas', 'milton', 'fiestas'];

async function listarYBorrar(coleccion) {
  const snap = await db.collection(coleccion).get();
  if (snap.empty) {
    console.log('[' + coleccion + '] VACIA');
    return;
  }
  console.log('[' + coleccion + '] ' + snap.size + ' documentos:');
  for (const doc of snap.docs) {
    const d = doc.data();
    const nombre = (d.name || d.businessName || d.title || '').toLowerCase();
    console.log('  ID:' + doc.id + ' | name:' + (d.name || d.businessName || d.title || '?') + ' | type:' + (d.type || d.businessType || '?'));
    if (BORRAR.some(n => nombre.includes(n))) {
      console.log('  >>> BORRANDO: ' + (d.name || d.businessName || d.title));
      await doc.ref.delete();
      console.log('  >>> BORRADO OK');
    }
  }
}

async function run() {
  const colecciones = [
    'businesses', 'restaurants', 'artists', 'clubs', 'hotels', 'chicken',
    'negocios', 'business_registration_requests', 'live_promotions'
  ];

  for (const col of colecciones) {
    await listarYBorrar(col);
  }

  // Buscar en posts tambien
  console.log('\n[posts] buscando negocios de prueba...');
  const posts = await db.collection('posts').get();
  if (!posts.empty) {
    for (const doc of posts.docs) {
      const d = doc.data();
      const nombre = (d.businessName || d.name || d.authorName || '').toLowerCase();
      if (BORRAR.some(n => nombre.includes(n))) {
        console.log('  POST encontrado ID:' + doc.id + ' name:' + (d.businessName || d.name || d.authorName));
      }
    }
  }

  console.log('\nFIN');
  process.exit(0);
}

run().catch(e => { console.log('ERR: ' + e.message); process.exit(1); });

