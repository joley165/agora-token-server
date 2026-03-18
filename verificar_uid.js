const admin = require('firebase-admin');
const serviceAccount = require('./draco-firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();
const uid = '8W1itqDnXUMhXH5780lhuyFVrPy1';

async function verificar() {
  console.log('\n🔍 VERIFICANDO UID: ' + uid + '\n');

  // 1. Verificar en Firestore
  const doc = await db.collection('users').doc(uid).get();
  if (doc.exists) {
    console.log('✅ Existe en Firestore:');
    console.log(JSON.stringify(doc.data(), null, 2));
  } else {
    console.log('❌ NO existe en Firestore');
  }

  // 2. Listar últimos 10 usuarios en Authentication
  console.log('\n📋 Todos los usuarios en Firebase Authentication:');
  const listResult = await auth.listUsers(100);
  const usuarios = listResult.users.sort((a, b) =>
    new Date(b.metadata.creationTime) - new Date(a.metadata.creationTime)
  );
  usuarios.forEach(u => {
    console.log(`  uid=${u.uid} | ${u.email || 'sin-email'} | ${u.displayName || 'sin-nombre'} | ${new Date(u.metadata.creationTime).toLocaleString('es-ES')}`);
  });

  // 3. Listar últimos 10 en Firestore
  console.log('\n📋 Últimos 10 usuarios en Firestore:');
  const snap = await db.collection('users').orderBy('createdAt', 'desc').limit(10).get();
  snap.forEach(d => {
    const data = d.data();
    console.log(`  uid=${data.uid || d.id} | ${data.email || 'sin-email'} | ${data.displayName || 'sin-nombre'} | ${new Date(data.createdAt || 0).toLocaleString('es-ES')}`);
  });

  process.exit(0);
}

verificar().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});

