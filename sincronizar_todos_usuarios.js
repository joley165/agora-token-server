const admin = require('firebase-admin');
const serviceAccount = require('./draco-firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function sincronizarTodosLosUsuarios() {
  const auth = admin.auth();
  const firestore = admin.firestore();

  console.log('\n🔥 SINCRONIZANDO TODOS LOS USUARIOS DE AUTHENTICATION A FIRESTORE...\n');

  try {
    // Obtener TODOS los usuarios de Authentication
    const listUsersResult = await auth.listUsers();

    console.log(`📊 Total usuarios en Authentication: ${listUsersResult.users.length}\n`);

    // Ordenar por fecha de creación (más reciente primero)
    const usuariosOrdenados = listUsersResult.users.sort((a, b) => {
      const timeA = new Date(a.metadata.creationTime).getTime();
      const timeB = new Date(b.metadata.creationTime).getTime();
      return timeB - timeA;
    });

    let creados = 0;
    let actualizados = 0;
    let correctos = 0;
    let errores = 0;

    for (const userRecord of usuariosOrdenados) {
      try {
        const uid = userRecord.uid;
        const email = userRecord.email || '';
        const displayNameAuth = userRecord.displayName || '';
        const photoUrlAuth = userRecord.photoURL || '';
        const creationDate = new Date(userRecord.metadata.creationTime);

        // Generar displayName si no tiene (usar email prefix)
        const displayName = displayNameAuth || email.split('@')[0];
        const photoUrl = photoUrlAuth;

        console.log(`\n👤 ${email}`);
        console.log(`   Registrado: ${creationDate.toLocaleString('es-ES')}`);
        console.log(`   DisplayName (Auth): "${displayNameAuth}" ${displayNameAuth ? '✅' : '❌'}`);
        console.log(`   PhotoUrl (Auth): ${photoUrlAuth ? '✅ Sí' : '❌ No'}`);

        // Verificar en Firestore
        const userDoc = await firestore.collection('users').doc(uid).get();

        if (!userDoc.exists) {
          // NO EXISTE EN FIRESTORE - CREAR
          const userData = {
            uid: uid,
            email: email,
            displayName: displayName,
            photoUrl: photoUrl,
            createdAt: new Date(userRecord.metadata.creationTime).getTime(),
            fcmToken: '',
            coverPhotoUrl: '',
            bio: '',
            emailVerified: userRecord.emailVerified || false,
            dateOfBirth: 0,
            age: 0,
            gender: '',
            phoneNumber: userRecord.phoneNumber || '',
            city: '',
            country: '',
            website: '',
            profession: ''
          };

          await firestore.collection('users').doc(uid).set(userData);
          console.log(`   ✅ CREADO en Firestore con displayName: "${displayName}"`);
          creados++;

        } else {
          // EXISTE - VERIFICAR Y ACTUALIZAR SI ES NECESARIO
          const firestoreData = userDoc.data();
          const updateData = {};

          // Actualizar displayName si está vacío o es diferente
          if (!firestoreData.displayName || firestoreData.displayName === '') {
            updateData.displayName = displayName;
          }

          // Actualizar photoUrl si tiene en Auth pero no en Firestore
          if (photoUrlAuth && (!firestoreData.photoUrl || firestoreData.photoUrl === '')) {
            updateData.photoUrl = photoUrl;
          }

          // Actualizar emailVerified
          if (userRecord.emailVerified !== firestoreData.emailVerified) {
            updateData.emailVerified = userRecord.emailVerified;
          }

          if (Object.keys(updateData).length > 0) {
            await firestore.collection('users').doc(uid).update(updateData);
            console.log(`   🔄 ACTUALIZADO:`);
            if (updateData.displayName) console.log(`      displayName: "${updateData.displayName}"`);
            if (updateData.photoUrl) console.log(`      photoUrl: ✅ Sí`);
            if ('emailVerified' in updateData) console.log(`      emailVerified: ${updateData.emailVerified}`);
            actualizados++;
          } else {
            console.log(`   ✓ Datos correctos en Firestore`);
            correctos++;
          }
        }

      } catch (error) {
        console.error(`   ❌ ERROR: ${error.message}`);
        errores++;
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('📊 RESUMEN FINAL:');
    console.log(`   👥 Total usuarios procesados: ${listUsersResult.users.length}`);
    console.log(`   ✅ Creados en Firestore: ${creados}`);
    console.log(`   🔄 Actualizados en Firestore: ${actualizados}`);
    console.log(`   ✓ Ya estaban correctos: ${correctos}`);
    console.log(`   ❌ Errores: ${errores}`);
    console.log('='.repeat(70));

    // Verificación final - listar todos los usuarios en Firestore
    console.log('\n📋 VERIFICACIÓN FINAL - USUARIOS EN FIRESTORE:\n');
    const firestoreSnapshot = await firestore.collection('users').get();
    console.log(`Total usuarios en Firestore: ${firestoreSnapshot.size}\n`);

    let sinNombre = 0;
    firestoreSnapshot.forEach(doc => {
      const data = doc.data();
      if (!data.displayName || data.displayName === '') {
        console.log(`⚠️  ${data.email} - SIN DISPLAYNAME`);
        sinNombre++;
      }
    });

    if (sinNombre === 0) {
      console.log('✅ TODOS los usuarios tienen displayName correctamente asignado\n');
    } else {
      console.log(`\n⚠️  ${sinNombre} usuarios AÚN sin displayName\n`);
    }

  } catch (error) {
    console.error('❌ Error general:', error);
    process.exit(1);
  }
}

sincronizarTodosLosUsuarios()
  .then(() => {
    console.log('✅ SINCRONIZACIÓN COMPLETA\n');
    console.log('Los usuarios ahora deberían verse correctamente en la app.\n');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error fatal:', err);
    process.exit(1);
  });

