const admin = require('firebase-admin');
const sa = require('./draco-firebase-adminsdk.json');
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

const BUSCAR = ['jorgensen', 'loma dorada', 'loma', 'milton', 'fiestas'];

async function run() {
  console.log('Buscando en subcollecciones de usuarios...\n');

  const users = await db.collection('users').get();

  for (const user of users.docs) {
    const uid = user.id;
    const userName = user.data().displayName || user.data().email || uid;

    // Buscar en subcollecciones comunes de negocios
    const subs = ['businesses', 'restaurants', 'artists', 'negocios', 'business', 'my_businesses'];
    for (const sub of subs) {
      const snap = await db.collection('users').doc(uid).collection(sub).get();
      if (!snap.empty) {
        for (const doc of snap.docs) {
          const d = doc.data();
          const nombre = (d.name || d.businessName || d.title || '').toLowerCase();
          console.log('ENCONTRADO users/' + uid + '/' + sub + '/' + doc.id + ' name:' + (d.name || d.businessName || '') + ' type:' + (d.type || ''));
          const esEjemplo = BUSCAR.some(n => nombre.includes(n));
          if (esEjemplo) {
            console.log('>>> BORRANDO: ' + (d.name || d.businessName));
            await doc.ref.delete();
            console.log('>>> BORRADO');
          }
        }
      }
    }

    // También buscar en user_posts por si los cargó como posts
    const postsSnap = await db.collection('users').doc(uid).collection('user_posts').get();
    if (!postsSnap.empty) {
      postsSnap.forEach(doc => {
        const d = doc.data();
        const n = (d.businessName || d.name || '').toLowerCase();
        if (BUSCAR.some(x => n.includes(x))) {
          console.log('ENCONTRADO en user_posts: ' + (d.name || d.businessName || doc.id));
        }
      });
    }
  }

  // También verificar si hay colección business_registration_requests
  const req = await db.collection('business_registration_requests').get();
  if (!req.empty) {
    console.log('\nbusiness_registration_requests (' + req.size + ' docs):');
    for (const doc of req.docs) {
      const d = doc.data();
      const nombre = (d.name || d.businessName || '').toLowerCase();
      console.log('  ' + doc.id + ' name:' + (d.name || d.businessName || '') + ' type:' + (d.type || d.businessType || ''));
      const esEjemplo = BUSCAR.some(n => nombre.includes(n));
      if (esEjemplo) {
        console.log('  >>> BORRANDO: ' + (d.name || d.businessName));
        await doc.ref.delete();
        console.log('  >>> BORRADO');
      }
    }
  } else {
    console.log('\nbusiness_registration_requests: vacia o no existe');
  }

  console.log('\nFIN');
  process.exit(0);
}

run().catch(e => { console.log('ERR:' + e.message); process.exit(1); });

