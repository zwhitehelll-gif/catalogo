export async function onRequestGet({ request, env }) {
  const id = new URL(request.url).searchParams.get('id');
  const r = await env.DB.prepare('SELECT img FROM items WHERE id=?1').bind(id).first();
  if (!r || !r.img) return new Response('', { status: 404 });
  const m = r.img.match(/^data:([^;]+);base64,(.*)$/);
  if (!m) return new Response('', { status: 404 });
  const bin = Uint8Array.from(atob(m[2]), c => c.charCodeAt(0));
  return new Response(bin, { headers: { 'content-type': m[1], 'cache-control': 'private, max-age=31536000' } });
}
