const admin = require('firebase-admin');
const sa = require('./draco-firebase-adminsdk.json');
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

async function run() {
  // Listar TODAS las colecciones raíz
  const cols = await db.listCollections();
  const colNames = cols.map(c => c.id);
  console.log('COLECCIONES RAIZ: ' + colNames.join(', '));

  for (const colRef of cols) {
    const snap = await colRef.get();
    if (snap.empty) continue;
    console.log('\n=== ' + colRef.id + ' (' + snap.size + ' docs) ===');
    for (const doc of snap.docs) {
      const d = doc.data();
      const n = d.name || d.businessName || d.title || d.displayName || '';
      const t = d.type || d.businessType || '';
      const o = d.ownerId || d.userId || '';
      console.log('  ID:' + doc.id + ' name:' + n + ' type:' + t + ' owner:' + o.substring(0,12));
    }
  }
  console.log('\nFIN');
}

run().then(() => process.exit(0)).catch(e => { console.log('ERR:' + e.message); process.exit(1); });

