const admin = require('firebase-admin');
const sa = require('./draco-firebase-adminsdk.json');
admin.initializeApp({ credential: admin.credential.cert(sa) });

const auth = admin.auth();
const db = admin.firestore();

async function diagnose() {
  console.log('=====================================');
  console.log('DIAGNOSTICO COMPLETO FIREBASE AUTH');
  console.log('=====================================\n');

  // 1. Obtener todos los usuarios de Auth
  const listResult = await auth.listUsers(1000);
  const authUsers = listResult.users;

  console.log('Total usuarios en Auth: ' + authUsers.length + '\n');

  // 2. Obtener todos los docs de Firestore
  const fsSnap = await db.collection('users').get();
  const fsMap = {};
  fsSnap.forEach(function(doc) {
    fsMap[doc.id] = doc.data();
  });

  console.log('Total docs en Firestore: ' + fsSnap.size + '\n');
  console.log('=====================================\n');

  // 3. Analizar cada usuario
  for (let i = 0; i < authUsers.length; i++) {
    const u = authUsers[i];
    const fsData = fsMap[u.uid];

    console.log('USUARIO ' + (i + 1) + ':');
    console.log('  UID: ' + u.uid);
    console.log('  Email: ' + (u.email || 'SIN EMAIL'));
    console.log('  DisplayName (Auth): ' + (u.displayName || 'VACIO EN AUTH'));
    console.log('  PhotoURL (Auth): ' + (u.photoURL ? 'SI' : 'NO'));
    console.log('  Proveedor: ' + u.providerData.map(p => p.providerId).join(', '));
    console.log('  Verificado: ' + (u.emailVerified ? 'SI' : 'NO'));
    console.log('  Creado: ' + new Date(u.metadata.creationTime).toLocaleDateString());

    if (fsData) {
      console.log('  EN FIRESTORE:');
      console.log('    displayName: "' + (fsData.displayName || 'VACIO') + '"');
      console.log('    photoUrl: ' + (fsData.photoUrl ? 'SI' : 'NO'));
      console.log('    email: ' + (fsData.email || 'VACIO'));
    } else {
      console.log('  ⚠️  NO EXISTE EN FIRESTORE');
    }

    // Diagnóstico
    if (!fsData) {
      console.log('  ❌ PROBLEMA: Usuario en Auth pero NO en Firestore');
    } else if (!fsData.displayName || fsData.displayName === '') {
      console.log('  ❌ PROBLEMA: displayName VACIO en Firestore');
      console.log('     Auth tiene: "' + (u.displayName || 'VACIO') + '"');
    } else {
      console.log('  ✅ OK');
    }

    console.log('');
  }

  console.log('=====================================');
  console.log('RESUMEN DE PROBLEMAS');
  console.log('=====================================\n');

  let sinFirestore = 0;
  let sinNombre = 0;
  let ok = 0;

  authUsers.forEach(function(u) {
    const fsData = fsMap[u.uid];
    if (!fsData) {
      sinFirestore++;
    } else if (!fsData.displayName || fsData.displayName === '') {
      sinNombre++;
    } else {
      ok++;
    }
  });

  console.log('Usuarios OK: ' + ok);
  console.log('Sin documento en Firestore: ' + sinFirestore);
  console.log('Con documento pero sin displayName: ' + sinNombre);

  process.exit(0);
}

diagnose().catch(function(e) {
  console.error('ERROR:', e.message);
  process.exit(1);
});

