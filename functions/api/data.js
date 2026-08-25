const files = {
  master: 'SPREADSHEETS/EasyRent Prod - Apartments (1).csv',
  transactions: 'SPREADSHEETS/Beer Sheva Monthly Report- Purchases.csv',
  renters: 'SPREADSHEETS/Hashkaot Renters zehavit.csv',
};

export async function onRequestGet({ env }) {
  if (!env.SPREADSHEETS) return new Response(JSON.stringify({ error: 'R2 binding SPREADSHEETS is not configured.' }), { status: 500, headers: { 'content-type': 'application/json' } });
  const result = {};
  for (const [name, key] of Object.entries(files)) {
    const object = await env.SPREADSHEETS.get(key);
    if (!object) return new Response(JSON.stringify({ error: `Missing spreadsheet object: ${key}` }), { status: 404, headers: { 'content-type': 'application/json' } });
    result[name] = await object.text();
  }
  return new Response(JSON.stringify({ files: result }), { headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
}
