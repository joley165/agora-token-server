const admin = require('firebase-admin');
const sa = require('./draco-firebase-adminsdk.json');
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

const BORRAR = ['jorgensen', 'loma dorada', 'loma', 'milton fiestas', 'milton', 'fiestas'];

async function run() {
  console.log('=== Listando coleccion businesses ===\n');

  const snap = await db.collection('businesses').get();
  if (snap.empty) {
    console.log('La coleccion businesses esta VACIA');
  } else {
    console.log('businesses tiene ' + snap.size + ' documentos:');
    for (const doc of snap.docs) {
      const d = doc.data();
      const nombre = (d.name || d.businessName || '').toLowerCase();
      console.log('  ID:' + doc.id + ' | name:' + (d.name || d.businessName || '?') + ' | type:' + (d.type || d.businessType || '?'));

      const esEjemplo = BORRAR.some(n => nombre.includes(n));
      if (esEjemplo) {
        console.log('  >>> BORRANDO: ' + (d.name || d.businessName));
        await doc.ref.delete();
        console.log('  >>> BORRADO OK');
      }
    }
  }

  // Tambien verificar business_registration_requests
  console.log('\n=== Listando business_registration_requests ===\n');
  const req = await db.collection('business_registration_requests').get();
  if (req.empty) {
    console.log('business_registration_requests esta VACIA o no existe');
  } else {
    console.log('business_registration_requests tiene ' + req.size + ' documentos:');
    for (const doc of req.docs) {
      const d = doc.data();
      const nombre = (d.businessName || d.name || '').toLowerCase();
      console.log('  ID:' + doc.id + ' | name:' + (d.businessName || d.name || '?') + ' | type:' + (d.businessType || d.type || '?'));

      const esEjemplo = BORRAR.some(n => nombre.includes(n));
      if (esEjemplo) {
        console.log('  >>> BORRANDO solicitud: ' + (d.businessName || d.name));
        await doc.ref.delete();
        console.log('  >>> BORRADO OK');
      }
    }
  }

  console.log('\nFIN');
  process.exit(0);
}

run().catch(e => { console.log('ERR: ' + e.message); process.exit(1); });

