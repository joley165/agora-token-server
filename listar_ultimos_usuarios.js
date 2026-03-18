const admin = require('firebase-admin');
const serviceAccount = require('./draco-firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function listarUltimosUsuarios() {
  const auth = admin.auth();
  const firestore = admin.firestore();

  console.log('\n📋 LISTANDO ÚLTIMOS USUARIOS REGISTRADOS...\n');

  try {
    const listUsersResult = await auth.listUsers();

    // Ordenar por fecha de creación (más reciente primero)
    const usuariosOrdenados = listUsersResult.users
      .sort((a, b) => {
        const timeA = new Date(a.metadata.creationTime).getTime();
        const timeB = new Date(b.metadata.creationTime).getTime();
        return timeB - timeA; // Más reciente primero
      })
      .slice(0, 10); // Tomar los últimos 10

    console.log(`📊 Total usuarios en Authentication: ${listUsersResult.users.length}`);
    console.log(`\n🔝 ÚLTIMOS 10 USUARIOS:\n`);

    for (let i = 0; i < usuariosOrdenados.length; i++) {
      const user = usuariosOrdenados[i];
      const creationDate = new Date(user.metadata.creationTime);
      const lastSignIn = user.metadata.lastSignInTime ?
        new Date(user.metadata.lastSignInTime) : null;

      console.log(`\n${i + 1}. 👤 ${user.email}`);
      console.log(`   UID: ${user.uid}`);
      console.log(`   Registrado: ${creationDate.toLocaleString('es-ES')}`);
      console.log(`   Último acceso: ${lastSignIn ? lastSignIn.toLocaleString('es-ES') : 'Nunca'}`);
      console.log(`   DisplayName (Auth): "${user.displayName || ''}"`);
      console.log(`   PhotoURL (Auth): ${user.photoURL ? '✅ Sí' : '❌ No'}`);
      console.log(`   Proveedor: ${user.providerData.map(p => p.providerId).join(', ')}`);

      // Verificar en Firestore
      const userDoc = await firestore.collection('users').doc(user.uid).get();
      if (userDoc.exists) {
        const firestoreData = userDoc.data();
        console.log(`   📄 FIRESTORE:`);
        console.log(`      DisplayName: "${firestoreData.displayName || ''}"`);
        console.log(`      PhotoUrl: ${firestoreData.photoUrl ? '✅ Sí' : '❌ No'}`);

        // Verificar si necesita sincronización
        const needsSync =
          !firestoreData.displayName ||
          firestoreData.displayName === '' ||
          (user.photoURL && !firestoreData.photoUrl);

        if (needsSync) {
          console.log(`      🚨 NECESITA SINCRONIZACIÓN`);
        } else {
          console.log(`      ✅ Datos correctos`);
        }
      } else {
        console.log(`   ❌ NO EXISTE EN FIRESTORE`);
      }
    }

    // Contar usuarios que necesitan sincronización
    let needsSync = 0;
    for (const user of listUsersResult.users) {
      const userDoc = await firestore.collection('users').doc(user.uid).get();
      if (!userDoc.exists) {
        needsSync++;
      } else {
        const data = userDoc.data();
        if (!data.displayName || data.displayName === '' || (user.photoURL && !data.photoUrl)) {
          needsSync++;
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`🚨 Usuarios que necesitan sincronización: ${needsSync}`);
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

listarUltimosUsuarios()
  .then(() => {
    console.log('✅ Listado completo\n');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error fatal:', err);
    process.exit(1);
  });

