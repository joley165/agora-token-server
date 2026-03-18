const admin = require('firebase-admin');
const serviceAccount = require('./draco-firebase-adminsdk.json');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const firestore = admin.firestore();
const CUTOFF = 1733011200000; // Dec 1, 2024

firestore.collection('users').get().then(snap => {
    console.log('Total en Firestore:', snap.size);
    console.log('Cutoff (Dec 1, 2024):', new Date(CUTOFF).toISOString());
    console.log('');
    let visibles = 0, invisibles = 0;
    snap.docs.forEach(doc => {
        const d = doc.data();
        const createdAt = d.createdAt || 0;
        const lastSeen = d.lastSeen || 0;
        const pasa = createdAt >= CUTOFF || (createdAt === 0 && lastSeen >= CUTOFF);
        if (pasa) visibles++; else invisibles++;
        const cDate = createdAt ? new Date(createdAt).toLocaleDateString('es-ES') : '0';
        const lDate = lastSeen ? new Date(lastSeen).toLocaleDateString('es-ES') : '0';
        console.log((pasa ? '✅' : '❌'), d.email, '| createdAt:', cDate, '| lastSeen:', lDate);
    });
    console.log('\n✅ Visibles en búsqueda:', visibles);
    console.log('❌ NO visibles (filtrados):', invisibles);
    process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });

