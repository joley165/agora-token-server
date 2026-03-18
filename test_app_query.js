const admin = require('firebase-admin');
const sa = require('./draco-firebase-adminsdk.json');
admin.initializeApp({ credential: admin.credential.cert(sa) });

const db = admin.firestore();

async function testAppQuery() {
  console.log('=== SIMULANDO LECTURA DE LA APP ===\n');

  // Simular lo que hace getAllUsersFlow() en FriendshipRepository
  const currentUserId = '2XRRIChfZGTOi60NZCY3g9j4gFg2'; // Jesus pinte

  console.log('Leyendo TODOS los usuarios (como la app)...\n');

  const snapshot = await db.collection('users').get();

  console.log('Total docs recibidos: ' + snapshot.size + '\n');

  let count = 0;
  snapshot.forEach(function(doc) {
    if (doc.id === currentUserId) return; // Skip current user

    count++;
    const data = doc.data();

    console.log(count + '. DOC ID: ' + doc.id);
    console.log('   uid (field): ' + (data.uid || 'UNDEFINED'));
    console.log('   email: ' + (data.email || 'UNDEFINED'));
    console.log('   displayName: "' + (data.displayName || 'UNDEFINED') + '"');
    console.log('   photoUrl: ' + (data.photoUrl ? 'EXISTE' : 'UNDEFINED'));

    // Ver TODOS los campos
    const keys = Object.keys(data);
    console.log('   Campos totales: ' + keys.length);

    if (!data.displayName || data.displayName === '') {
      console.log('   ⚠️  PROBLEMA: displayName VACIO');
    }
    if (!data.photoUrl || data.photoUrl === '') {
      console.log('   ⚠️  PROBLEMA: photoUrl VACIO');
    }

    console.log('');
  });

  console.log('Total usuarios mostrados: ' + count);

  process.exit(0);
}

testAppQuery().catch(function(e) {
  console.error('ERROR:', e.message);
  console.error(e.stack);
  process.exit(1);
});

