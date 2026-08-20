const imagePattern = /\.(jpe?g|png|gif|webp|avif|heic)$/i;
const folderPattern = /^יחידה\s*[-_:]?\s*/i;

export async function onRequestGet({ request, env }) {
  if (!env.PHOTOS) return new Response(JSON.stringify({ error: 'R2 binding PHOTOS is not configured.' }), { status: 500, headers: { 'content-type': 'application/json' } });
  const url = new URL(request.url);
  const objectKey = url.searchParams.get('key');
  if (objectKey) {
    const object = await env.PHOTOS.get(objectKey);
    if (!object) return new Response('Not found', { status: 404 });
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('cache-control', 'public, max-age=3600');
    return new Response(object.body, { headers });
  }
  const unit = String(url.searchParams.get('unit') || '').trim();
  if (!unit) return new Response(JSON.stringify({ photos: [] }), { headers: { 'content-type': 'application/json' } });
  const wanted = unit.toLowerCase().replace(/\s+/g, '');
  const photos = [];
  let cursor;
  do {
    const page = await env.PHOTOS.list({ cursor, limit: 1000 });
    for (const item of page.objects || []) {
      if (!imagePattern.test(item.key)) continue;
      const folder = item.key.split('/').map((part) => part.trim()).find((part) => folderPattern.test(part));
      const folderUnit = folder ? folder.replace(folderPattern, '').toLowerCase().replace(/\s+/g, '') : '';
      if (folderUnit === wanted) photos.push({ key: item.key, name: item.key.split('/').pop(), url: `/api/photos?key=${encodeURIComponent(item.key)}` });
    }
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
  return new Response(JSON.stringify({ photos }), { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=300' } });
}
