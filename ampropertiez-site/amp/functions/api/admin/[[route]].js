// Private inbox API: /api/admin/list | item | file | update | delete | stats. Requires Authorization: Bearer ADMIN_TOKEN.
import { json, adminOk, ensureTable } from '../../../lib/core.js';

const STATUSES = ['new', 'in progress', 'offer sent', 'won', 'closed', 'spam'];

export async function onRequest({ request, env, params }) {
  const auth = adminOk(request, env); if (!auth.ok) return auth.res;
  if (!env.DB) return json({ ok: false, error: 'Storage is not connected (D1 binding DB).' }, 503);
  await ensureTable(env.DB);
  const action = (params.route || [])[0] || 'list', url = new URL(request.url), q = url.searchParams;
  const body = request.method === 'POST' ? await request.json().catch(() => ({})) : {};

  if (action === 'list') {
    const where = [], args = [];
    if (q.get('form')) { where.push('form = ?'); args.push(q.get('form')); }
    if (q.get('status')) { where.push('status = ?'); args.push(q.get('status')); }
    if (q.get('q')) { where.push('(name LIKE ? OR email LIKE ? OR subject LIKE ? OR data LIKE ? OR ref LIKE ?)'); const s = `%${q.get('q').slice(0, 80)}%`; args.push(s, s, s, s, s); }
    const sql = `SELECT ref, form, created, name, email, subject, status, file_name FROM messages ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY created DESC LIMIT 300`;
    const { results } = await env.DB.prepare(sql).bind(...args).all();
    return json({ ok: true, items: results });
  }
  if (action === 'stats') {
    const { results } = await env.DB.prepare("SELECT form, status, COUNT(*) n FROM messages GROUP BY form, status").all();
    return json({ ok: true, rows: results, statuses: STATUSES });
  }
  const ref = q.get('ref') || body.ref || '';
  if (!/^AMP-[A-Z]-\d{6}-[A-Z0-9]{4}$/.test(ref)) return json({ ok: false, error: 'Bad reference.' }, 400);

  if (action === 'item') {
    const row = await env.DB.prepare('SELECT * FROM messages WHERE ref = ?').bind(ref).first();
    if (!row) return json({ ok: false, error: 'Not found.' }, 404);
    row.data = JSON.parse(row.data || '{}');
    return json({ ok: true, item: row, statuses: STATUSES });
  }
  if (action === 'file') {
    if (!env.FILES) return json({ ok: false, error: 'File storage is not connected (KV binding FILES).' }, 503);
    const { value, metadata } = await env.FILES.getWithMetadata(ref, 'arrayBuffer');
    if (!value) return json({ ok: false, error: 'No file stored for this message.' }, 404);
    const name = (metadata?.name || ref).replace(/[^\w.\- ]+/g, '_');
    return new Response(value, { headers: { 'content-type': 'application/octet-stream', 'content-disposition': `attachment; filename="${name}"`, 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' } });
  }
  if (action === 'update' && request.method === 'POST') {
    const status = STATUSES.includes(body.status) ? body.status : null, notes = typeof body.notes === 'string' ? body.notes.slice(0, 5000) : null;
    await env.DB.prepare('UPDATE messages SET status = COALESCE(?, status), notes = COALESCE(?, notes) WHERE ref = ?').bind(status, notes, ref).run();
    return json({ ok: true });
  }
  if (action === 'delete' && request.method === 'POST') {
    await env.DB.prepare('DELETE FROM messages WHERE ref = ?').bind(ref).run();
    if (env.FILES) await env.FILES.delete(ref).catch(() => {});
    return json({ ok: true });
  }
  return json({ ok: false, error: 'Unknown action.' }, 404);
}
