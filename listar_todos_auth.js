const admin = require('firebase-admin');
const serviceAccount = require('./draco-firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function listarTodosLosUsuarios() {
  const auth = admin.auth();
  const firestore = admin.firestore();

  console.log('\n🔥 LISTANDO TODOS LOS USUARIOS EN AUTHENTICATION\n');

  try {
    const listUsersResult = await auth.listUsers(1000);

    console.log(`📊 TOTAL USUARIOS: ${listUsersResult.users.length}\n`);
    console.log('='.repeat(80) + '\n');

    // Ordenar por fecha de registro (más reciente primero)
    const usuariosOrdenados = listUsersResult.users.sort((a, b) => {
      return new Date(b.metadata.creationTime).getTime() - new Date(a.metadata.creationTime).getTime();
    });

    for (let i = 0; i < usuariosOrdenados.length; i++) {
      const user = usuariosOrdenados[i];
      const fechaRegistro = new Date(user.metadata.creationTime);
      const ultimoAcceso = user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime) : null;

      console.log(`${i + 1}. 👤 ${user.email || 'SIN EMAIL'}`);
      console.log(`   UID: ${user.uid}`);
      console.log(`   DisplayName: "${user.displayName || ''}"`);
      console.log(`   PhotoURL: ${user.photoURL || 'No'}`);
      console.log(`   Registrado: ${fechaRegistro.toLocaleString('es-ES')}`);
      console.log(`   Último acceso: ${ultimoAcceso ? ultimoAcceso.toLocaleString('es-ES') : 'Nunca'}`);
      console.log(`   Proveedor: ${user.providerData.map(p => p.providerId).join(', ')}`);
      console.log(`   Email verificado: ${user.emailVerified ? 'Sí' : 'No'}`);

      // Verificar en Firestore
      const docRef = firestore.collection('users').doc(user.uid);
      const doc = await docRef.get();

      if (doc.exists) {
        const data = doc.data();
        console.log(`   FIRESTORE: DisplayName="${data.displayName || ''}" PhotoUrl="${data.photoUrl || ''}"`);

        // Sincronizar si falta
        const needsUpdate = !data.displayName || !data.photoUrl && user.photoURL;
        if (needsUpdate) {
          const updateData = {};
          if (!data.displayName) {
            updateData.displayName = user.displayName || user.email.split('@')[0];
          }
          if (!data.photoUrl && user.photoURL) {
            updateData.photoUrl = user.photoURL;
          }
          await docRef.update(updateData);
          console.log(`   ✅ ACTUALIZADO en Firestore`);
        }
      } else {
        console.log(`   ❌ NO EXISTE EN FIRESTORE - CREANDO...`);
        const userData = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || user.email?.split('@')[0] || 'Usuario',
          photoUrl: user.photoURL || '',
          createdAt: fechaRegistro.getTime(),
          fcmToken: '',
          emailVerified: user.emailVerified || false
        };
        await docRef.set(userData);
        console.log(`   ✅ CREADO en Firestore`);
      }

      console.log('');
    }

    console.log('='.repeat(80));
    console.log(`\n✅ Total: ${usuariosOrdenados.length} usuarios procesados\n`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

listarTodosLosUsuarios()
  .then(() => {
    console.log('✅ Proceso completo\n');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error fatal:', err);
    process.exit(1);
  });

