const admin = require('firebase-admin');
const sa = require('./draco-firebase-adminsdk.json');
admin.initializeApp({ credential: admin.credential.cert(sa) });
const auth = admin.auth();
const db = admin.firestore();

Promise.all([auth.listUsers(1000), db.collection('users').get()])
.then(function(results) {
  var authUsers = results[0].users;
  var snap = results[1];

  // Mapa email -> Auth UID real
  var authByEmail = {};
  authUsers.forEach(function(u) {
    if (u.email) authByEmail[u.email.toLowerCase()] = { uid: u.uid, name: u.displayName || '', photo: u.photoURL || '' };
  });

  console.log('=== COMPARACION: AUTH UID vs FIRESTORE DOC ID ===');
  console.log('');

  var diffs = [];
  snap.forEach(function(doc) {
    var d = doc.data();
    var email = (d.email || '').toLowerCase();
    var authInfo = authByEmail[email];
    var authUID = authInfo ? authInfo.uid : 'NO_EN_AUTH';
    var match = doc.id === authUID ? 'OK' : 'DIFF';
    if (match === 'DIFF') diffs.push({ email: email, authUID: authUID, fsID: doc.id, data: d });
    console.log(match + ' | ' + email.substring(0,38).padEnd(40) + ' | AUTH:' + authUID.substring(0,25) + ' | FS:' + doc.id.substring(0,25) + ' | ' + (d.displayName||'(sin nombre)'));
  });

  console.log('');
  console.log('Total DIFF: ' + diffs.length);

  if (diffs.length > 0) {
    console.log('');
    console.log('Ejecutando migracion de ' + diffs.length + ' documentos...');
    var promises = diffs.map(function(item) {
      if (item.authUID === 'NO_EN_AUTH') {
        console.log('SKIP (no en Auth): ' + item.email);
        return Promise.resolve();
      }
      var newData = Object.assign({}, item.data, { uid: item.authUID });
      var batch = db.batch();
      batch.set(db.collection('users').doc(item.authUID), newData);
      batch.delete(db.collection('users').doc(item.fsID));
      return batch.commit().then(function() {
        console.log('MIGRADO: ' + item.email + ' -> ' + item.authUID.substring(0,20));
      });
    });
    return Promise.all(promises).then(function() {
      console.log('Migracion completada.');
    });
  }
}).then(function() {
  process.exit(0);
}).catch(function(e) {
  console.error('ERROR:', e.message);
  process.exit(1);
});

