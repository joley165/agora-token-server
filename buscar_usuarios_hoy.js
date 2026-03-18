const admin = require('firebase-admin');
const serviceAccount = require('./draco-firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function buscarUsuariosDeHoy() {
  const auth = admin.auth();
  const firestore = admin.firestore();

  // UID específico del usuario
  const uidEspecifico = '8W1itqDnXUMhXH5780lhuyFVrPy1';

  console.log('\n🔥 BUSCANDO USUARIOS DE HOY Y UID ESPECÍFICO...\n');
  console.log(`📅 Fecha de hoy: 12 de marzo de 2026\n`);
  console.log(`🎯 UID específico: ${uidEspecifico}\n`);

  try {
    // 1. Buscar el usuario específico
    console.log('=' .repeat(70));
    console.log('🎯 VERIFICANDO USUARIO ESPECÍFICO:');
    console.log('='.repeat(70));

    try {
      const userRecord = await auth.getUser(uidEspecifico);
      console.log(`\n✅ Usuario encontrado en Authentication:`);
      console.log(`   Email: ${userRecord.email}`);
      console.log(`   DisplayName: "${userRecord.displayName || ''}"`);
      console.log(`   PhotoURL: ${userRecord.photoURL || 'No tiene'}`);
      console.log(`   Registrado: ${new Date(userRecord.metadata.creationTime).toLocaleString('es-ES')}`);
      console.log(`   Último acceso: ${new Date(userRecord.metadata.lastSignInTime).toLocaleString('es-ES')}`);
      console.log(`   Proveedor: ${userRecord.providerData.map(p => p.providerId).join(', ')}`);

      // Verificar en Firestore
      const userDoc = await firestore.collection('users').doc(uidEspecifico).get();
      if (userDoc.exists) {
        const data = userDoc.data();
        console.log(`\n   📄 EN FIRESTORE:`);
        console.log(`      DisplayName: "${data.displayName || ''}"`);
        console.log(`      PhotoUrl: "${data.photoUrl || ''}"`);
        console.log(`      Email: ${data.email}`);
      } else {
        console.log(`\n   ❌ NO EXISTE EN FIRESTORE - CREANDO...`);

        const displayName = userRecord.displayName || userRecord.email.split('@')[0];
        const userData = {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: displayName,
          photoUrl: userRecord.photoURL || '',
          createdAt: new Date(userRecord.metadata.creationTime).getTime(),
          fcmToken: '',
          emailVerified: userRecord.emailVerified
        };

        await firestore.collection('users').doc(uidEspecifico).set(userData);
        console.log(`\n   ✅ CREADO EN FIRESTORE con displayName: "${displayName}"`);
      }
    } catch (error) {
      console.log(`\n❌ Usuario ${uidEspecifico} NO encontrado en Authentication`);
      console.log(`   Error: ${error.message}`);
    }

    // 2. Buscar TODOS los usuarios y filtrar por hoy (12 marzo 2026)
    console.log('\n\n' + '='.repeat(70));
    console.log('📅 BUSCANDO USUARIOS REGISTRADOS HOY (12 MARZO 2026):');
    console.log('='.repeat(70) + '\n');

    const hoy = new Date('2026-03-12');
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date('2026-03-13');
    manana.setHours(0, 0, 0, 0);

    const listUsersResult = await auth.listUsers();
    console.log(`📊 Total usuarios en Authentication: ${listUsersResult.users.length}\n`);

    const usuariosHoy = listUsersResult.users.filter(user => {
      const creationDate = new Date(user.metadata.creationTime);
      return creationDate >= hoy && creationDate < manana;
    });

    console.log(`🆕 Usuarios registrados HOY: ${usuariosHoy.length}\n`);

    if (usuariosHoy.length > 0) {
      for (const userRecord of usuariosHoy) {
        console.log(`\n👤 ${userRecord.email}`);
        console.log(`   UID: ${userRecord.uid}`);
        console.log(`   DisplayName: "${userRecord.displayName || ''}"`);
        console.log(`   PhotoURL: ${userRecord.photoURL ? '✅ Sí' : '❌ No'}`);
        console.log(`   Registrado: ${new Date(userRecord.metadata.creationTime).toLocaleString('es-ES')}`);
        console.log(`   Proveedor: ${userRecord.providerData.map(p => p.providerId).join(', ')}`);

        // Sincronizar a Firestore
        const userDoc = await firestore.collection('users').doc(userRecord.uid).get();

        if (!userDoc.exists) {
          const displayName = userRecord.displayName || userRecord.email.split('@')[0];
          const userData = {
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: displayName,
            photoUrl: userRecord.photoURL || '',
            createdAt: new Date(userRecord.metadata.creationTime).getTime(),
            fcmToken: '',
            emailVerified: userRecord.emailVerified
          };

          await firestore.collection('users').doc(userRecord.uid).set(userData);
          console.log(`   ✅ CREADO en Firestore: "${displayName}"`);
        } else {
          console.log(`   ✓ Ya existe en Firestore`);
        }
      }
    } else {
      console.log('⚠️  No hay usuarios registrados hoy (12 marzo 2026)\n');
      console.log('Mostrando los 5 usuarios más recientes:\n');

      const usuariosOrdenados = listUsersResult.users.sort((a, b) => {
        return new Date(b.metadata.creationTime).getTime() - new Date(a.metadata.creationTime).getTime();
      }).slice(0, 5);

      for (const userRecord of usuariosOrdenados) {
        console.log(`\n👤 ${userRecord.email}`);
        console.log(`   UID: ${userRecord.uid}`);
        console.log(`   Registrado: ${new Date(userRecord.metadata.creationTime).toLocaleString('es-ES')}`);
        console.log(`   DisplayName: "${userRecord.displayName || ''}"`);
        console.log(`   PhotoURL: ${userRecord.photoURL ? '✅' : '❌'}`);
      }
    }

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

buscarUsuariosDeHoy()
  .then(() => {
    console.log('\n✅ Búsqueda completa\n');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Error fatal:', err);
    process.exit(1);
  });

