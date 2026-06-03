import server from '../dist/server/server.js';

async function run() {
  try {
    const req = new Request('http://localhost/');
    const res = await server.fetch(req, {}, {});
    console.log('STATUS', res.status);
    const text = await res.text();
    console.log('BODY:\n', text.slice(0, 2000));
  } catch (err) {
    console.error('ERROR RUNNING SSR:', err);
  }
}

run();
