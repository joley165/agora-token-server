const admin = require('firebase-admin');
const sa = require('./draco-firebase-adminsdk.json');
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

const BORRAR_NOMBRES = ['jorgensen', 'loma dorada', 'loma', 'milton fiestas', 'milton'];
const SUBCOLS = ['businesses', 'restaurants', 'artists', 'negocios', 'business', 'my_businesses', 'registros'];

async function run() {
  console.log('Buscando usuarios...');
  const usersSnap = await db.collection('users').get();
  console.log('Total usuarios: ' + usersSnap.size);

  for (const userDoc of usersSnap.docs) {
    const uid = userDoc.id;
    const userData = userDoc.data();

    for (const subcol of SUBCOLS) {
      const subSnap = await db.collection('users').doc(uid).collection(subcol).get();
      if (!subSnap.empty) {
        console.log('\nUsuario ' + uid + ' (' + (userData.displayName||userData.email||'?') + ') tiene ' + subSnap.size + ' docs en subcol [' + subcol + ']:');
        for (const doc of subSnap.docs) {
          const d = doc.data();
          const nombre = (d.name || d.businessName || d.title || '').toLowerCase();
          console.log('  ID:' + doc.id + ' | name:' + (d.name || d.businessName || d.title || '?') + ' | type:' + (d.type || d.businessType || '?'));

          if (BORRAR_NOMBRES.some(n => nombre.includes(n))) {
            console.log('  >>> BORRANDO: ' + (d.name || d.businessName || d.title));
            await doc.ref.delete();
            console.log('  >>> BORRADO OK');
          }
        }
      }
    }
  }

  // Buscar en businesses raiz con campo ownerId o userId
  console.log('\n\nBuscando en businesses raiz todos los docs (sin filtro)...');
  const biz = await db.collection('businesses').get();
  console.log('businesses raiz: ' + biz.size + ' docs');
  biz.forEach(d => {
    const data = d.data();
    console.log('  ' + d.id + ' | ' + (data.name||'?') + ' | owner:' + (data.ownerId||data.userId||'?'));
  });

  // Buscar en live_promotions
  console.log('\nBuscando en live_promotions...');
  const lp = await db.collection('live_promotions').get();
  lp.forEach(d => {
    const data = d.data();
    console.log('  ' + d.id + ' | ' + JSON.stringify(data).substring(0, 120));
  });

  console.log('\nFIN');
  process.exit(0);
}

run().catch(e => { console.log('ERR: ' + e.message); process.exit(1); });

