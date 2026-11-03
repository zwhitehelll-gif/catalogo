const J = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { 'content-type': 'application/json' } });

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    'SELECT id,t,u,name,url,price,tags,note,store,fav,(img IS NOT NULL) AS hasimg FROM items ORDER BY t DESC').all();
  return J(results);
}

// Accetta un oggetto o un array. "img" viene aggiornata solo se presente (null = rimuovi).
export async function onRequestPost({ request, env }) {
  const body = await request.json();
  const list = Array.isArray(body) ? body : [body];
  const now = Date.now(), st = [];
  for (const o of list) {
    if (!o.id) continue;
    st.push(env.DB.prepare(
      `INSERT INTO items (id,t,u,name,url,price,tags,note,store,fav) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10)
       ON CONFLICT(id) DO UPDATE SET u=?3,name=?4,url=?5,price=?6,tags=?7,note=?8,store=?9,fav=?10`)
      .bind(o.id, o.t || now, now, o.name || '', o.url || '', o.price || '', o.tags || '', o.note || '', o.store || '', o.fav ? 1 : 0));
    if ('img' in o) st.push(env.DB.prepare('UPDATE items SET img=?2 WHERE id=?1').bind(o.id, o.img));
  }
  for (let i = 0; i < st.length; i += 50) await env.DB.batch(st.slice(i, i + 50));
  return J({ ok: true, n: list.length });
}

export async function onRequestDelete({ request, env }) {
  const id = new URL(request.url).searchParams.get('id');
  await env.DB.prepare('DELETE FROM items WHERE id=?1').bind(id).run();
  return J({ ok: true });
}
