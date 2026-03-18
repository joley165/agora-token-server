const admin = require('firebase-admin');
const sa = require('./draco-firebase-adminsdk.json');
admin.initializeApp({ credential: admin.credential.cert(sa) });

const auth = admin.auth();
const db = admin.firestore();

Promise.all([
  auth.listUsers(1000),
  db.collection('users').get()
]).then(function(results) {
  const authUsers = results[0].users;
  const fsSnap = results[1];

  console.log('====================================');
  console.log('Firebase Auth: ' + authUsers.length + ' usuarios');
  console.log('Firestore:     ' + fsSnap.size + ' documentos');
  console.log('====================================\n');

  const fsEmails = {};
  fsSnap.forEach(function(doc) {
    const email = (doc.data().email || '').toLowerCase();
    if (email) fsEmails[email] = doc.id;
  });

  console.log('USUARIOS EN AUTH QUE FALTAN EN FIRESTORE:\n');
  let missing = 0;
  authUsers.forEach(function(u) {
    const email = (u.email || '').toLowerCase();
    if (!fsEmails[email]) {
      missing++;
      console.log(missing + '. ' + (u.displayName || 'SIN NOMBRE'));
      console.log('   Email: ' + u.email);
      console.log('   UID: ' + u.uid);
      console.log('   Foto: ' + (u.photoURL ? 'SI' : 'NO'));
      console.log('   Proveedor: ' + u.providerData.map(function(p) { return p.providerId; }).join(', '));
      console.log('');
    }
  });

  if (missing === 0) {
    console.log('TODOS los usuarios de Auth ESTAN en Firestore ✅\n');
  } else {
    console.log('TOTAL FALTANTES: ' + missing);
  }

  process.exit(0);
}).catch(function(e) {
  console.error('ERROR:', e.message);
  process.exit(1);
});

