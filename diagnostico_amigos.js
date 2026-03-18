const admin = require('firebase-admin');
const sa = require('./draco-firebase-adminsdk.json');
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

async function diagnostico() {
  console.log('\n═══════════════════════════════════════════════');
  console.log('  DIAGNÓSTICO SISTEMA DE AMIGOS');
  console.log('═══════════════════════════════════════════════\n');

  // 1. Friendships
  const fsSnap = await db.collection('friendships').get();
  console.log('📌 FRIENDSHIPS — Total:', fsSnap.size);
  if (fsSnap.size === 0) {
    console.log('   ⚠️  VACÍO — Ninguna amistad confirmada aún');
  } else {
    for (const doc of fsSnap.docs) {
      const d = doc.data();
      // Buscar nombres
      let n1 = d.userId1, n2 = d.userId2;
      try {
        const u1 = await db.collection('users').doc(d.userId1).get();
        const u2 = await db.collection('users').doc(d.userId2).get();
        if (u1.exists) n1 = u1.data().displayName || u1.data().email;
        if (u2.exists) n2 = u2.data().displayName || u2.data().email;
      } catch(e) {}
      console.log('   ✅ ' + n1 + ' <-> ' + n2);
      console.log('      userId1:', d.userId1);
      console.log('      userId2:', d.userId2);
    }
  }

  // 2. Friend requests
  const frSnap = await db.collection('friend_requests').get();
  console.log('\n📌 FRIEND_REQUESTS — Total:', frSnap.size);
  const byStatus = {};
  frSnap.docs.forEach(d => {
    const dat = d.data();
    if (!byStatus[dat.status]) byStatus[dat.status] = [];
    byStatus[dat.status].push(dat.senderName + ' -> ' + dat.receiverName);
  });
  Object.entries(byStatus).forEach(([status, list]) => {
    console.log('   [' + status + '] ' + list.length + ' solicitudes:');
    list.forEach(l => console.log('      - ' + l));
  });

  // 3. Verificar users con campo uid correcto
  const usersSnap = await db.collection('users').get();
  console.log('\n📌 USERS — Verificando campo uid:');
  let sinUid = 0;
  usersSnap.docs.forEach(doc => {
    const d = doc.data();
    if (!d.uid || d.uid !== doc.id) {
      console.log('   ⚠️  UID INCORRECTO:', doc.id, '| uid en doc:', d.uid);
      sinUid++;
    }
  });
  if (sinUid === 0) {
    console.log('   ✅ Todos los usuarios tienen uid correcto (' + usersSnap.size + ')');
  }

  console.log('\n═══════════════════════════════════════════════\n');
  process.exit(0);
}
diagnostico().catch(e => { console.error(e); process.exit(1); });

