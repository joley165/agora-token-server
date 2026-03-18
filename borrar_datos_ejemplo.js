const admin = require('firebase-admin');
const serviceAccount = require('./draco-firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function borrarDatosEjemplo() {
  console.log('\n🗑️  BORRANDO DATOS DE EJEMPLO...\n');

  // ─────────────────────────────────────
  // 1. BORRAR TODOS LOS RESTAURANTES
  // ─────────────────────────────────────
  console.log('🍽️  Borrando restaurantes de ejemplo...');
  const restaurants = await db.collection('restaurants').get();
  if (restaurants.empty) {
    console.log('   ℹ️  No hay restaurantes que borrar');
  } else {
    for (const doc of restaurants.docs) {
      const data = doc.data();
      console.log(`   🗑️  Borrando: ${data.name || data.businessName || doc.id}`);
      // Borrar subcolecciones si existen
      const menu = await doc.ref.collection('menu').get();
      for (const item of menu.docs) await item.ref.delete();
      const orders = await doc.ref.collection('orders').get();
      for (const order of orders.docs) await order.ref.delete();
      await doc.ref.delete();
    }
    console.log(`   ✅ ${restaurants.size} restaurante(s) borrado(s)`);
  }

  // ─────────────────────────────────────
  // 2. BORRAR ARTISTAS de la colección 'businesses' (type = ARTIST)
  // ─────────────────────────────────────
  console.log('\n🎵 Borrando artistas de ejemplo...');
  const artists = await db.collection('businesses')
    .where('type', '==', 'ARTIST')
    .get();

  if (artists.empty) {
    // Intentar sin filtro por si el campo se llama diferente
    const allBusinesses = await db.collection('businesses').get();
    const artistDocs = allBusinesses.docs.filter(d => {
      const t = (d.data().type || d.data().businessType || '').toUpperCase();
      return t === 'ARTIST';
    });
    if (artistDocs.length === 0) {
      console.log('   ℹ️  No hay artistas que borrar');
    } else {
      for (const doc of artistDocs) {
        console.log(`   🗑️  Borrando artista: ${doc.data().name || doc.id}`);
        const works = await doc.ref.collection('works').get();
        for (const w of works.docs) await w.ref.delete();
        await doc.ref.delete();
      }
      console.log(`   ✅ ${artistDocs.length} artista(s) borrado(s)`);
    }
  } else {
    for (const doc of artists.docs) {
      console.log(`   🗑️  Borrando artista: ${doc.data().name || doc.id}`);
      const works = await doc.ref.collection('works').get();
      for (const w of works.docs) await w.ref.delete();
      await doc.ref.delete();
    }
    console.log(`   ✅ ${artists.size} artista(s) borrado(s)`);
  }

  // ─────────────────────────────────────
  // 3. RESUMEN FINAL
  // ─────────────────────────────────────
  console.log('\n✅ LIMPIEZA COMPLETADA');
  console.log('   Los nuevos usuarios pueden crear sus propios restaurantes y artistas');
  console.log('   La funcionalidad queda intacta\n');

  process.exit(0);
}

borrarDatosEjemplo().catch(e => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});

