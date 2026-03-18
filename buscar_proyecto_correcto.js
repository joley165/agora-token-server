const https = require('https');
const { execSync } = require('child_process');

const PROJECT_ID = 'draco-app-2026';
const TOKEN = execSync('gcloud auth print-access-token 2>/dev/null').toString().trim();

function firestoreGet(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'firestore.googleapis.com',
      path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/${path}`,
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + TOKEN }
    };
    let data = '';
    const req = https.request(options, res => {
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { resolve({}); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function firestoreDelete(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'firestore.googleapis.com',
      path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/${path}`,
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + TOKEN }
    };
    let data = '';
    const req = https.request(options, res => {
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.end();
  });
}

const BORRAR_NOMBRES = ['jorgensen', 'loma dorada', 'loma', 'milton fiestas', 'milton'];

function getValue(field) {
  if (!field) return '';
  return field.stringValue || field.integerValue || '';
}

async function listarColeccion(coleccion) {
  const result = await firestoreGet(coleccion + '?pageSize=100');
  if (!result.documents || result.documents.length === 0) {
    console.log('[' + coleccion + '] VACIA');
    return;
  }
  console.log('[' + coleccion + '] ' + result.documents.length + ' documentos:');
  for (const doc of result.documents) {
    const fields = doc.fields || {};
    const nombre = (getValue(fields.name) || getValue(fields.businessName) || getValue(fields.title) || '').toLowerCase();
    const tipo = getValue(fields.type) || getValue(fields.businessType) || '?';
    const docPath = doc.name.split('/documents/')[1];
    console.log('  Path:' + docPath + ' | name:' + (getValue(fields.name) || getValue(fields.businessName) || '?') + ' | type:' + tipo);

    if (BORRAR_NOMBRES.some(n => nombre.includes(n))) {
      console.log('  >>> BORRANDO: ' + nombre);
      await firestoreDelete(docPath);
      console.log('  >>> BORRADO OK');
    }
  }
}

async function listarUsuariosYSubcols() {
  const result = await firestoreGet('users?pageSize=50');
  if (!result.documents) { console.log('No se pudo obtener usuarios'); return; }

  console.log('\nUsuarios encontrados: ' + result.documents.length);
  const subcols = ['businesses', 'restaurants', 'artists', 'negocios', 'business'];

  for (const userDoc of result.documents) {
    const uid = userDoc.name.split('/').pop();
    const fields = userDoc.fields || {};
    const email = getValue(fields.email) || getValue(fields.displayName) || '?';

    for (const subcol of subcols) {
      const sub = await firestoreGet('users/' + uid + '/' + subcol + '?pageSize=50');
      if (sub.documents && sub.documents.length > 0) {
        console.log('\nUsuario ' + uid + ' (' + email + ') tiene ' + sub.documents.length + ' en [' + subcol + ']:');
        for (const doc of sub.documents) {
          const df = doc.fields || {};
          const nombre = (getValue(df.name) || getValue(df.businessName) || '').toLowerCase();
          const docPath = doc.name.split('/documents/')[1];
          console.log('  ' + docPath + ' | name:' + (getValue(df.name) || getValue(df.businessName) || '?'));

          if (BORRAR_NOMBRES.some(n => nombre.includes(n))) {
            console.log('  >>> BORRANDO: ' + nombre);
            await firestoreDelete(docPath);
            console.log('  >>> BORRADO OK');
          }
        }
      }
    }
  }
}

async function run() {
  console.log('=== Buscando en proyecto: ' + PROJECT_ID + ' ===\n');

  const colecciones = ['businesses', 'restaurants', 'artists', 'clubs', 'chicken', 'hotels', 'business_registration_requests'];
  for (const col of colecciones) {
    await listarColeccion(col);
  }

  await listarUsuariosYSubcols();

  console.log('\n=== FIN ===');
  process.exit(0);
}

run().catch(e => { console.log('ERR: ' + e.message); process.exit(1); });

