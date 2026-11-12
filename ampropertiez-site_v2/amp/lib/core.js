// Shared helpers for the contact API (Cloudflare Pages Functions).

export const FORMS = {
  offer:   { code: 'O', label: 'Offer request',      required: ['name', 'email', 'address', 'county', 'property_type', 'relationship'], fields: ['contact_pref', 'address', 'county', 'property_type', 'relationship', 'condition', 'timeline', 'asking', 'message'], subject: d => d.address },
  buyer:   { code: 'B', label: 'Buyer list',         required: ['name', 'email', 'looking_for'], fields: ['looking_for', 'areas', 'budget', 'funding', 'property_id', 'message'], subject: d => d.property_id || d.looking_for },
  vendor:  { code: 'V', label: 'Contractor sign-up', required: ['name', 'email', 'company', 'trade', 'insured'], fields: ['company', 'trade', 'license', 'insured', 'areas', 'website_url', 'message'], subject: d => `${d.company} (${d.trade})` },
  bid:     { code: 'Q', label: 'Contractor quote',   required: ['name', 'email', 'company', 'project', 'amount', 'message'], fields: ['company', 'project', 'amount', 'start', 'license', 'message'], subject: d => `${d.project}: ${d.amount} from ${d.company}` },
  contact: { code: 'C', label: 'Website message',    required: ['name', 'email', 'topic', 'subject', 'message'], fields: ['topic', 'subject', 'message'], subject: d => `${d.topic}: ${d.subject}` },
};

export const LABELS = {
  name: 'Name', email: 'Email', phone: 'Phone', contact_pref: 'Reach by', address: 'Property', county: 'County', property_type: 'Type',
  relationship: 'Relationship', condition: 'Condition', timeline: 'Timeline', asking: 'Price in mind', message: 'Message', looking_for: 'Looking for',
  areas: 'Areas', budget: 'Budget', funding: 'Paying with', property_id: 'Listing', company: 'Company', trade: 'Trade', license: 'FL license',
  insured: 'Insurance', website_url: 'Website', project: 'Project', amount: 'Quote total', start: 'Start / duration', topic: 'Topic', subject: 'Subject', page: 'Sent from',
};

export const ALLOWED_EXT = /\.(pdf|jpe?g|png|heic|webp|docx?|xlsx?|csv|txt|zip)$/i;
export const MAX_FILE = 10 * 1024 * 1024;
export const EMAIL_RE = /^[^\s@<>"]{1,64}@[^\s@<>"]{1,190}\.[a-z]{2,24}$/i;

export const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const clip = (s, n) => String(s ?? '').trim().slice(0, n);

export function makeRef(code) {
  const d = new Date(), p = n => String(n).padStart(2, '0');
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', r = crypto.getRandomValues(new Uint8Array(4));
  return `AMP-${code}-${String(d.getUTCFullYear()).slice(2)}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}-${[...r].map(b => chars[b % chars.length]).join('')}`;
}

export const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

export async function ensureTable(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS messages (
    ref TEXT PRIMARY KEY, form TEXT NOT NULL, created TEXT NOT NULL, name TEXT, email TEXT, phone TEXT, subject TEXT,
    data TEXT, file_name TEXT, file_type TEXT, file_size INTEGER, status TEXT DEFAULT 'new', notes TEXT DEFAULT '', emailed INTEGER DEFAULT 0, ip_country TEXT)`).run();
}

export const recipients = env => String(env.MAIL_TO || 'mhadid@ampropertiez.com,aanumoh@ampropertiez.com').split(',').map(s => s.trim()).filter(Boolean);

export async function sendEmail(env, msg) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({ from: env.MAIL_FROM || 'A&M Propertiez <website@ampropertiez.com>', ...msg }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return true;
}

export function adminOk(request, env) {
  const t = env.ADMIN_TOKEN || '';
  if (t.length < 16) return { ok: false, res: json({ ok: false, error: 'The inbox is switched off. Set ADMIN_TOKEN (16+ characters).' }, 503) };
  const got = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  let diff = got.length ^ t.length;
  for (let i = 0; i < t.length; i++) diff |= (got.charCodeAt(i) || 0) ^ t.charCodeAt(i);
  return diff === 0 ? { ok: true } : { ok: false, res: json({ ok: false, error: 'That token was not accepted.' }, 401) };
}

export function b64(buf) {
  const bytes = new Uint8Array(buf); let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s);
}
