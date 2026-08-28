const files = {
  master: 'SPREADSHEETS/EasyRent Prod - Apartments (1).csv',
  transactions: 'SPREADSHEETS/Beer Sheva Monthly Report- Purchases.csv',
  renters: 'SPREADSHEETS/Hashkaot Renters zehavit.csv',
  coordinates: 'SPREADSHEETS/building-coordinates.csv',
  occupancy: 'SPREADSHEETS/New Occupancy - Occupancy.csv',
  unified: 'SPREADSHEETS/Unified Attempt1.csv',
};

export async function onRequestGet({ env, request }) {
  if (!env.SPREADSHEETS) return new Response(JSON.stringify({ error: 'R2 binding SPREADSHEETS is not configured.' }), { status: 500, headers: { 'content-type': 'application/json' } });
  const objects = [];
  let cursor;
  do {
    const page = await env.SPREADSHEETS.list({ prefix: 'SPREADSHEETS/', cursor, limit: 1000 });
    objects.push(...(page.objects || []));
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
  const requested = new URL(request.url).searchParams.get('only');
  if (requested && !files[requested]) return new Response(JSON.stringify({ error: `Unknown spreadsheet source: ${requested}` }), { status: 400, headers: { 'content-type': 'application/json' } });
  const entries = requested ? [[requested, files[requested]]] : Object.entries(files);
  const result = {};
  for (const [name, key] of entries) {
    const expected = key.split('/').pop().toLowerCase().replace(/\s+/g, '');
    const match = objects.find((item) => item.key.split('/').pop().toLowerCase().replace(/\s+/g, '') === expected);
    const object = match ? await env.SPREADSHEETS.get(match.key) : null;
    if (!object && !['coordinates', 'occupancy', 'unified'].includes(name)) return new Response(JSON.stringify({ error: `Missing spreadsheet object: ${key}`, available: objects.map((item) => item.key) }), { status: 404, headers: { 'content-type': 'application/json' } });
    if (!object) { result[name] = ''; continue; }
    result[name] = await object.text();
  }
  return new Response(JSON.stringify({ files: result }), { headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
}
