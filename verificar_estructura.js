const admin = require('firebase-admin');
const serviceAccount = require('./draco-firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function verificarEstructura() {
  const firestore = admin.firestore();

  console.log('\n=== COLECCIÓN "users" ===\n');
  const usersSnapshot = await firestore.collection('users').limit(3).get();
  console.log(`Total: ${usersSnapshot.size} documentos\n`);

  usersSnapshot.forEach(doc => {
    const d = doc.data();
    console.log(`UID: ${doc.id}`);
    console.log(`  email: ${d.email || 'N/A'}`);
    console.log(`  displayName: "${d.displayName || ''}" ${d.displayName ? '✅' : '❌ VACÍO'}`);
    console.log(`  photoUrl: "${d.photoUrl || ''}" ${d.photoUrl ? '✅' : '❌ VACÍO'}`);
    console.log(`  fcmToken: ${d.fcmToken ? '✅ Tiene' : '❌ No tiene'}`);
    console.log('');
  });

  // Verificar subcolección friends de un usuario
  console.log('\n=== SUBCOLECCIÓN users/{uid}/friends ===\n');
  if (usersSnapshot.size > 0) {
    const firstUserId = usersSnapshot.docs[0].id;
    const friendsSnapshot = await firestore
      .collection('users')
      .document(firstUserId)
      .collection('friends')
      .limit(3)
      .get();

    if (friendsSnapshot.empty) {
      console.log('❌ No tiene amigos o la subcolección no existe\n');
    } else {
      console.log(`Total amigos: ${friendsSnapshot.size}\n`);
      friendsSnapshot.forEach(doc => {
        const d = doc.data();
        console.log(`Friend ID: ${doc.id}`);
        console.log(JSON.stringify(d, null, 2));
        console.log('');
      });
    }
  }

  // Verificar colección friendships
  console.log('\n=== COLECCIÓN "friendships" ===\n');
  const friendshipsSnapshot = await firestore.collection('friendships').limit(3).get();
  if (friendshipsSnapshot.empty) {
    console.log('❌ Vacía o no existe\n');
  } else {
    console.log(`Total: ${friendshipsSnapshot.size}\n`);
    friendshipsSnapshot.forEach(doc => {
      const d = doc.data();
      console.log(`ID: ${doc.id}`);
      console.log(JSON.stringify(d, null, 2));
      console.log('');
    });
  }
}

verificarEstructura()
  .then(() => {
    console.log('\n✅ Verificación completa');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });

