const admin = require('firebase-admin');
const sa = require('./draco-firebase-adminsdk.json');
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

db.collection('users').limit(3).get().then(function(snap) {
  snap.forEach(function(doc) {
    var d = doc.data();
    console.log('=== DOC:', doc.id, '===');
    console.log('uid:', d.uid);
    console.log('email:', d.email);
    console.log('displayName:', JSON.stringify(d.displayName));
    console.log('photoUrl:', d.photoUrl ? d.photoUrl.substring(0, 80) : '(VACIO)');
    console.log('createdAt:', d.createdAt);
    console.log('fcmToken:', d.fcmToken ? d.fcmToken.substring(0, 30) + '...' : '(vacio)');
    console.log('ALL KEYS:', Object.keys(d).join(', '));
    console.log('');
  });
  process.exit(0);
}).catch(function(e) { console.error(e.message); process.exit(1); });

