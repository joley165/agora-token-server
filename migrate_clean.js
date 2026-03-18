const admin = require('firebase-admin');
const sa = require('/Users/macbook/Documents/draco/agora-token-server/draco-firebase-adminsdk.json');
admin.initializeApp({ credential: admin.credential.cert(sa) });

const auth = admin.auth();
const db = admin.firestore();

async function migrate() {
  console.log('MIGRANDO UIDs Firestore -> Firebase Auth');

  const listResult = await auth.listUsers(1000);
  const authUsers = listResult.users;
  console.log('Firebase Auth:', authUsers.length, 'usuarios');

  const snap = await db.collection('users').get();
  console.log('Firestore docs:', snap.size);

  const fsByEmail = {};
  snap.forEach(function(doc) {
    var email = (doc.data().email || '').toLowerCase().trim();
    if (email) fsByEmail[email] = { id: doc.id, data: doc.data() };
  });

  var migrated = 0, alreadyOk = 0, created = 0;

  for (var i = 0; i < authUsers.length; i++) {
    var au = authUsers[i];
    var email = (au.email || '').toLowerCase().trim();
    var authUID = au.uid;
    if (!email) continue;

    var fsEntry = fsByEmail[email];

    if (!fsEntry) {
      var parts = email.split('@');
      var name = au.displayName || (parts[0].charAt(0).toUpperCase() + parts[0].slice(1));
      var createdTs = au.metadata && au.metadata.creationTime
        ? new Date(au.metadata.creationTime).getTime() : Date.now();
      await db.collection('users').doc(authUID).set({
        uid: authUID,
        email: email,
        displayName: name,
        photoUrl: au.photoURL || '',
        createdAt: createdTs,
        fcmToken: '',
        isVerified: au.emailVerified || false,
        isOnline: false,
        bio: ''
      });
      console.log('CREADO:', email, '->', authUID.substring(0, 20));
      created++;
      continue;
    }

    if (fsEntry.id === authUID) {
      console.log('OK:', email);
      alreadyOk++;
      continue;
    }

    console.log('MIGRANDO:', email);
    console.log('  viejo:', fsEntry.id);
    console.log('  nuevo:', authUID);

    var oldData = fsEntry.data;
    var newDisplayName = (oldData.displayName && oldData.displayName !== '')
      ? oldData.displayName
      : (au.displayName || email.split('@')[0]);
    var newPhotoUrl = oldData.photoUrl || au.photoURL || '';
    var newVerified = au.emailVerified || oldData.isVerified || false;

    var newData = Object.assign({}, oldData, {
      uid: authUID,
      email: email,
      displayName: newDisplayName,
      photoUrl: newPhotoUrl,
      isVerified: newVerified
    });

    var batch = db.batch();
    batch.set(db.collection('users').doc(authUID), newData);
    batch.delete(db.collection('users').doc(fsEntry.id));
    await batch.commit();
    console.log('  OK migrado');
    migrated++;
  }

  console.log('');
  console.log('RESULTADO: OK=' + alreadyOk + ' Migrados=' + migrated + ' Creados=' + created);

  var snapFinal = await db.collection('users').get();
  console.log('');
  console.log('VERIFICACION FINAL (' + snapFinal.size + ' docs):');
  snapFinal.forEach(function(doc) {
    var d = doc.data();
    var match = doc.id === d.uid ? 'OK' : 'DIFF';
    var name = d.displayName || '(sin nombre)';
    var foto = d.photoUrl ? 'SI' : 'NO';
    console.log(match + ' | ' + (d.email || '').padEnd(40) + ' | ' + name.padEnd(30) + ' | foto:' + foto);
  });

  process.exit(0);
}

migrate().catch(function(e) {
  console.error('ERROR:', e.message);
  process.exit(1);
});

