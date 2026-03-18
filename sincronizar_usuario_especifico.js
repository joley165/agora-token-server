const admin = require('firebase-admin');
const serviceAccount = require('./draco-firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// UID específico a sincronizar
const UID_TARGET = '8W1itqDnXUMhXH5780lhuyFVrPy1';

async function sincronizarUsuarioEspecifico(uid) {
  const auth = admin.auth();
  const firestore = admin.firestore();

  console.log('\n🔥 SINCRONIZANDO USUARIO ESPECÍFICO...');
  console.log(`🎯 UID: ${uid}\n`);

  try {
    // 1. Obtener datos de Firebase Authentication
    let userRecord;
    try {
      userRecord = await auth.getUser(uid);
      console.log('✅ Usuario encontrado en Firebase Authentication:');
      console.log(`   Email: ${userRecord.email || '(sin email)'}`);
      console.log(`   DisplayName: "${userRecord.displayName || ''}"`);
      console.log(`   PhotoURL: ${userRecord.photoURL ? '✅ Tiene foto' : '❌ Sin foto'}`);
      console.log(`   Provider: ${userRecord.providerData.map(p => p.providerId).join(', ')}`);
      console.log(`   Registrado: ${new Date(userRecord.metadata.creationTime).toLocaleString('es-ES')}`);
      console.log(`   EmailVerified: ${userRecord.emailVerified}`);
    } catch (e) {
      console.error(`❌ UID no encontrado en Firebase Authentication: ${uid}`);
      console.error(`   Error: ${e.message}`);
      process.exit(1);
    }

    // 2. Preparar datos
    const email = userRecord.email || '';
    const displayNameAuth = userRecord.displayName || '';
    const photoUrlAuth = userRecord.photoURL || '';
    const displayName = displayNameAuth || email.split('@')[0] || 'Usuario';
    const photoUrl = photoUrlAuth;

    // 3. Verificar en Firestore
    console.log('\n📂 Verificando en Firestore...');
    const userDoc = await firestore.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      // NO EXISTE - CREAR
      console.log('⚠️  No existe en Firestore → CREANDO...');
      const userData = {
        uid: uid,
        email: email,
        displayName: displayName,
        photoUrl: photoUrl,
        coverPhotoUrl: '',
        bio: '',
        emailVerified: userRecord.emailVerified || false,
        createdAt: new Date(userRecord.metadata.creationTime).getTime(),
        isOnline: false,
        lastSeen: Date.now(),
        isVerified: false,
        fcmToken: '',
        phoneNumber: userRecord.phoneNumber || '',
        dateOfBirth: 0,
        age: 0,
        gender: '',
        city: '',
        country: '',
        website: '',
        profession: ''
      };

      await firestore.collection('users').doc(uid).set(userData);
      console.log(`✅ CREADO exitosamente en Firestore:`);
      console.log(`   displayName: "${displayName}"`);
      console.log(`   email: "${email}"`);
      console.log(`   photoUrl: ${photoUrl ? '✅ Guardada' : '❌ Vacía'}`);

    } else {
      // EXISTE - VERIFICAR Y ACTUALIZAR
      console.log('✅ Ya existe en Firestore → VERIFICANDO campos...');
      const firestoreData = userDoc.data();
      const updateData = {};

      console.log(`   displayName actual: "${firestoreData.displayName || ''}"`);
      console.log(`   photoUrl actual: ${firestoreData.photoUrl ? '✅' : '❌'}`);
      console.log(`   email actual: "${firestoreData.email || ''}"`);

      // Actualizar displayName si está vacío o es "Usuario"
      if (!firestoreData.displayName || firestoreData.displayName === '' || firestoreData.displayName === 'Usuario') {
        if (displayName) {
          updateData.displayName = displayName;
          console.log(`   → Actualizando displayName a: "${displayName}"`);
        }
      }

      // Actualizar photoUrl si Auth tiene foto pero Firestore no
      if (photoUrlAuth && (!firestoreData.photoUrl || firestoreData.photoUrl === '')) {
        updateData.photoUrl = photoUrlAuth;
        console.log(`   → Actualizando photoUrl: ✅`);
      }

      // Actualizar email si está vacío
      if (email && (!firestoreData.email || firestoreData.email === '')) {
        updateData.email = email;
        console.log(`   → Actualizando email: "${email}"`);
      }

      // Asegurarse de que tiene uid
      if (!firestoreData.uid) {
        updateData.uid = uid;
        console.log(`   → Agregando uid: "${uid}"`);
      }

      if (Object.keys(updateData).length > 0) {
        await firestore.collection('users').doc(uid).update(updateData);
        console.log(`✅ ACTUALIZADO en Firestore`);
      } else {
        console.log(`✅ Ya estaba sincronizado correctamente`);
      }
    }

    console.log('\n🎉 ¡Sincronización completada!\n');

  } catch (error) {
    console.error('\n❌ Error inesperado:', error.message);
    console.error(error.stack);
    process.exit(1);
  }

  process.exit(0);
}

sincronizarUsuarioEspecifico(UID_TARGET);

