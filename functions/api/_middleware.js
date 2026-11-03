// Protegge tutte le /api con la password (variabile PASSWORD su Cloudflare)
export async function onRequest({ request, env, next }) {
  const ck = (request.headers.get('Cookie') || '').match(/(?:^|;\s*)pass=([^;]*)/);
  const given = request.headers.get('x-pass') || (ck ? decodeURIComponent(ck[1]) : '');
  if (!env.PASSWORD || given !== env.PASSWORD)
    return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } });
  return next();
}
