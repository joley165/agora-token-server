const admin = require('firebase-admin');
const serviceAccount = require('./draco-firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function sincronizarUsuariosNuevos() {
  const auth = admin.auth();
  const firestore = admin.firestore();

  // Fecha de hoy (inicio del día)
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const timestampHoy = hoy.getTime();

  console.log('\n🔥 SINCRONIZANDO USUARIOS NUEVOS (REGISTRADOS HOY)...\n');
  console.log(`📅 Fecha: ${hoy.toLocaleDateString()}\n`);

  try {
    // Obtener TODOS los usuarios de Authentication
    const listUsersResult = await auth.listUsers();

    // Filtrar solo los usuarios registrados HOY
    const usuariosHoy = listUsersResult.users.filter(user => {
      const creationTime = new Date(user.metadata.creationTime).getTime();
      return creationTime >= timestampHoy;
    });

    console.log(`📊 Usuarios registrados HOY: ${usuariosHoy.length}\n`);

    if (usuariosHoy.length === 0) {
      console.log('⚠️  No hay usuarios nuevos registrados hoy.\n');
      return;
    }

    let sincronizados = 0;
    let errores = 0;

    for (const userRecord of usuariosHoy) {
      try {
        const uid = userRecord.uid;
        const email = userRecord.email || '';
        const displayNameAuth = userRecord.displayName || '';
        const photoUrlAuth = userRecord.photoURL || '';

        // Generar displayName si no tiene
        const displayName = displayNameAuth || email.split('@')[0];
        const photoUrl = photoUrlAuth;

        console.log(`\n👤 Usuario: ${email}`);
        console.log(`   UID: ${uid}`);
        console.log(`   Registrado: ${new Date(userRecord.metadata.creationTime).toLocaleString()}`);
        console.log(`   DisplayName (Auth): "${displayNameAuth}"`);
        console.log(`   PhotoUrl (Auth): ${photoUrlAuth ? '✅ Sí' : '❌ No'}`);

        // Verificar en Firestore
        const userDoc = await firestore.collection('users').doc(uid).get();

        if (!userDoc.exists) {
          // NO EXISTE - Crear
          const userData = {
            uid: uid,
            email: email,
            displayName: displayName,
            photoUrl: photoUrl,
            createdAt: new Date(userRecord.metadata.creationTime).getTime(),
            fcmToken: ''
          };

          await firestore.collection('users').doc(uid).set(userData);
          console.log(`   ✅ CREADO en Firestore`);
          console.log(`   DisplayName guardado: "${displayName}"`);
          console.log(`   PhotoUrl guardado: ${photoUrl ? '✅ Sí' : '❌ No'}`);
          sincronizados++;

        } else {
          // EXISTE - Actualizar
          const firestoreData = userDoc.data();
          const updateData = {};

          // Actualizar displayName si está vacío o diferente
          if (!firestoreData.displayName || firestoreData.displayName === '' ||
              (displayNameAuth && firestoreData.displayName !== displayName)) {
            updateData.displayName = displayName;
          }

          // Actualizar photoUrl si tiene en Auth pero no en Firestore
          if (photoUrlAuth && !firestoreData.photoUrl) {
            updateData.photoUrl = photoUrl;
          }

          if (Object.keys(updateData).length > 0) {
            await firestore.collection('users').doc(uid).update(updateData);
            console.log(`   🔄 ACTUALIZADO en Firestore`);
            if (updateData.displayName) console.log(`   DisplayName actualizado: "${updateData.displayName}"`);
            if (updateData.photoUrl) console.log(`   PhotoUrl actualizado: ✅ Sí`);
            sincronizados++;
          } else {
            console.log(`   ✓ Ya está sincronizado correctamente`);
          }
        }

      } catch (error) {
        console.error(`   ❌ ERROR: ${error.message}`);
        errores++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN:');
    console.log(`   👥 Usuarios nuevos (hoy): ${usuariosHoy.length}`);
    console.log(`   ✅ Sincronizados correctamente: ${sincronizados}`);
    console.log(`   ❌ Errores: ${errores}`);
    console.log('='.repeat(60));

    // Mostrar lista final
    console.log('\n📋 USUARIOS LISTOS PARA LA APP:\n');
    for (const userRecord of usuariosHoy) {
      const uid = userRecord.uid;
      const userDoc = await firestore.collection('users').doc(uid).get();
      if (userDoc.exists) {
        const data = userDoc.data();
        console.log(`✅ ${data.email}`);
        console.log(`   Nombre: "${data.displayName}"`);
        console.log(`   Foto: ${data.photoUrl ? '✅ Sí' : '❌ No'}`);
      }
    }
    console.log('');

  } catch (error) {
    console.error('❌ Error general:', error);
    process.exit(1);
  }
}

sincronizarUsuariosNuevos()
  .then(() => {
    console.log('✅ Sincronización completa - Los usuarios nuevos ya pueden usar la app correctamente\n');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error fatal:', err);
    process.exit(1);
  });

