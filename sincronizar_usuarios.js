const admin = require('firebase-admin');
const serviceAccount = require('./draco-firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function sincronizarUsuarios() {
  const auth = admin.auth();
  const firestore = admin.firestore();

  console.log('\n🔄 SINCRONIZANDO USUARIOS DE AUTH A FIRESTORE...\n');

  try {
    // Obtener todos los usuarios de Firebase Authentication
    const listUsersResult = await auth.listUsers();
    console.log(`📊 Total usuarios en Authentication: ${listUsersResult.users.length}\n`);

    let actualizados = 0;
    let sinCambios = 0;
    let errores = 0;

    for (const userRecord of listUsersResult.users) {
      try {
        const uid = userRecord.uid;
        const email = userRecord.email || '';
        const displayName = userRecord.displayName || email.split('@')[0];
        const photoUrl = userRecord.photoURL || '';

        // Verificar si el usuario ya existe en Firestore
        const userDoc = await firestore.collection('users').doc(uid).get();

        if (!userDoc.exists) {
          // Usuario no existe en Firestore, crearlo
          const userData = {
            uid: uid,
            email: email,
            displayName: displayName,
            photoUrl: photoUrl,
            createdAt: userRecord.metadata.creationTime ?
              new Date(userRecord.metadata.creationTime).getTime() :
              Date.now(),
            fcmToken: ''
          };

          await firestore.collection('users').doc(uid).set(userData);
          console.log(`✅ CREADO: ${email}`);
          console.log(`   DisplayName: "${displayName}"`);
          console.log(`   PhotoUrl: ${photoUrl ? '✅ Sí' : '❌ No'}\n`);
          actualizados++;

        } else {
          // Usuario existe, verificar si necesita actualizar displayName o photoUrl
          const userData = userDoc.data();
          const needsUpdate =
            !userData.displayName ||
            userData.displayName === '' ||
            (photoUrl && !userData.photoUrl);

          if (needsUpdate) {
            const updateData = {};

            if (!userData.displayName || userData.displayName === '') {
              updateData.displayName = displayName;
            }

            if (photoUrl && !userData.photoUrl) {
              updateData.photoUrl = photoUrl;
            }

            await firestore.collection('users').doc(uid).update(updateData);
            console.log(`🔄 ACTUALIZADO: ${email}`);
            console.log(`   DisplayName: "${displayName}"`);
            console.log(`   PhotoUrl: ${photoUrl ? '✅ Sí' : '❌ No'}\n`);
            actualizados++;
          } else {
            console.log(`✓ Sin cambios: ${email}`);
            sinCambios++;
          }
        }
      } catch (error) {
        console.error(`❌ Error con usuario ${userRecord.email}:`, error.message);
        errores++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMEN:');
    console.log(`   ✅ Actualizados/Creados: ${actualizados}`);
    console.log(`   ✓ Sin cambios: ${sinCambios}`);
    console.log(`   ❌ Errores: ${errores}`);
    console.log('='.repeat(50) + '\n');

  } catch (error) {
    console.error('❌ Error general:', error);
    process.exit(1);
  }
}

sincronizarUsuarios()
  .then(() => {
    console.log('✅ Sincronización completa');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error fatal:', err);
    process.exit(1);
  });

