const admin = require('firebase-admin');
const serviceAccount = require('./draco-firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function borrarTodosLosUsuarios() {
  const firestore = admin.firestore();

  console.log('\n🔥 BORRANDO TODOS LOS USUARIOS DE FIRESTORE...\n');
  console.log('⚠️  NOTA: Solo se borra de Firestore, NO de Authentication');
  console.log('⚠️  Los usuarios deberán volver a iniciar sesión para recrearse\n');

  try {
    const usersSnapshot = await firestore.collection('users').get();
    console.log(`📊 Total usuarios en Firestore: ${usersSnapshot.size}\n`);

    if (usersSnapshot.empty) {
      console.log('✅ No hay usuarios para borrar\n');
      return;
    }

    let deleted = 0;
    const batch = firestore.batch();

    usersSnapshot.docs.forEach(doc => {
      console.log(`🗑️  Borrando: ${doc.data().email || doc.id}`);
      batch.delete(doc.ref);
      deleted++;
    });

    await batch.commit();

    console.log('\n' + '='.repeat(60));
    console.log(`✅ ${deleted} usuarios borrados de Firestore`);
    console.log('='.repeat(60));
    console.log('\n✅ Ahora los usuarios pueden volver a autenticarse');
    console.log('✅ Se crearán limpios con el nuevo código\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

borrarTodosLosUsuarios()
  .then(() => {
    console.log('✅ Proceso completo\n');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error fatal:', err);
    process.exit(1);
  });

