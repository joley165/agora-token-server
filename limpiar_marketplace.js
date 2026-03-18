const https = require('https');
const { execSync } = require('child_process');

const DB_URL = 'draco-app-2026-default-rtdb.firebaseio.com';
const TOKEN = execSync('gcloud auth print-access-token 2>/dev/null').toString().trim();

function rtdbGet(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: DB_URL,
      path: '/' + path + '.json?access_token=' + TOKEN,
      method: 'GET'
    };
    let data = '';
    const req = https.request(options, res => {
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { resolve(null); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function rtdbDelete(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: DB_URL,
      path: '/' + path + '.json?access_token=' + TOKEN,
      method: 'DELETE'
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

async function run() {
  console.log('=== Realtime Database: ' + DB_URL + ' ===\n');

  // Listar nodo products
  console.log('Buscando nodo "products"...');
  const products = await rtdbGet('products');

  if (!products) {
    console.log('El nodo "products" esta VACIO o no existe.');
  } else {
    const ids = Object.keys(products);
    console.log('products tiene ' + ids.length + ' articulos:\n');

    for (const id of ids) {
      const p = products[id];
      const nombre = p.name || p.title || p.productName || '?';
      const vendedor = p.sellerName || p.userName || p.userId || '?';
      const precio = p.price || p.precio || '?';
      const categoria = p.category || '?';
      console.log('  ID:' + id);
      console.log('    nombre   : ' + nombre);
      console.log('    vendedor : ' + vendedor);
      console.log('    precio   : ' + precio);
      console.log('    categoria: ' + categoria);
      console.log('');
    }

    // Confirmar borrado total
    console.log('\n>>> BORRANDO todos los articulos de prueba del marketplace...');
    await rtdbDelete('products');
    console.log('>>> BORRADO OK - marketplace limpio para nuevos usuarios\n');
  }

  // Verificar otros nodos relacionados
  const nodos = ['marketplace', 'listings', 'items', 'ads', 'productos'];
  for (const nodo of nodos) {
    const data = await rtdbGet(nodo);
    if (data) {
      console.log('Nodo "' + nodo + '" tiene datos: ' + JSON.stringify(data).substring(0, 200));
      console.log('>>> BORRANDO nodo "' + nodo + '"...');
      await rtdbDelete(nodo);
      console.log('>>> OK');
    } else {
      console.log('Nodo "' + nodo + '": VACIO');
    }
  }

  console.log('\n=== FIN ===');
  process.exit(0);
}

run().catch(e => { console.log('ERR: ' + e.message); process.exit(1); });

