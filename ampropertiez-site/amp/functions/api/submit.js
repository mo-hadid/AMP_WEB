// POST /api/submit: receives every website form, stores it, emails both partners.
import { FORMS, LABELS, ALLOWED_EXT, MAX_FILE, EMAIL_RE, esc, clip, makeRef, json, ensureTable, recipients, sendEmail, b64 } from '../../lib/core.js';

export async function onRequestPost({ request, env }) {
  const wantsJson = (request.headers.get('accept') || '').includes('application/json');
  const fail = (error, status = 400) => wantsJson ? json({ ok: false, error }, status)
    : new Response(`<!doctype html><meta charset=utf-8><title>Not sent</title><p style="font:18px system-ui;max-width:560px;margin:60px auto">${esc(error)} <a href="javascript:history.back()">Go back</a></p>`, { status, headers: { 'content-type': 'text/html; charset=utf-8' } });

  let fd;
  try { fd = await request.formData(); } catch { return fail('The form could not be read.'); }
  const get = (k, n = 200) => clip(fd.get(k) instanceof File ? '' : fd.get(k), n);

  const formId = get('form', 20), spec = FORMS[formId];
  if (!spec) return fail('Unknown form.');

  // spam traps: honeypot pretends to succeed; too-fast submits are refused
  if (get('website')) return wantsJson ? json({ ok: true, ref: makeRef(spec.code), emailed: false }) : Response.redirect(new URL('/thanks/', request.url), 303);
  const t0 = Number(get('t0', 20));
  if (t0 && Date.now() - t0 < 2500) return fail('That was quicker than a person can type. Please wait a moment and send again.');

  if (env.TURNSTILE_SECRET) {
    const body = new FormData();
    body.append('secret', env.TURNSTILE_SECRET); body.append('response', get('cf-turnstile-response', 4096)); body.append('remoteip', request.headers.get('cf-connecting-ip') || '');
    const v = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body }).then(r => r.json()).catch(() => ({}));
    if (!v.success) return fail('The spam check did not pass. Reload the page and try again.');
  }

  const d = { name: get('name', 120), email: get('email', 200), phone: get('phone', 40), page: get('page', 120) };
  for (const k of spec.fields) d[k] = get(k, k === 'message' ? 5000 : 300);
  for (const k of spec.required) if (!d[k]) return fail(`Please fill in: ${LABELS[k] || k}.`);
  if (!EMAIL_RE.test(d.email)) return fail('That email address does not look right.');
  if (get('consent') !== 'yes') return fail('Please tick the box to let us contact you.');

  let file = fd.get('attachment');
  if (!(file instanceof File) || !file.size) file = null;
  if (file) {
    if (file.size > MAX_FILE) return fail('The file is over 10 MB.');
    if (!ALLOWED_EXT.test(file.name)) return fail('That file type is not accepted. Use PDF, images, Office files, CSV, TXT or ZIP.', 415);
  }
  if (!env.DB && !env.RESEND_API_KEY) return fail('We are not able to deliver messages right now. Please email info@ampropertiez.com.', 503);

  const ref = makeRef(spec.code), created = new Date().toISOString();
  const subject = clip(spec.subject(d), 160);
  const buf = file ? await file.arrayBuffer() : null;

  let stored = false, fileSaved = false, emailed = false;
  if (env.FILES && file) {
    try { await env.FILES.put(ref, buf, { metadata: { name: file.name, type: file.type || 'application/octet-stream', size: file.size } }); fileSaved = true; }
    catch (e) { console.error('file store failed', e); }
  }

  // email both partners, Reply-To the sender
  if (env.RESEND_API_KEY) {
    const rows = ['name', 'email', 'phone', ...spec.fields, 'page'].filter(k => d[k]).map(k =>
      `<tr><td style="padding:6px 12px 6px 0;color:#5E6A64;vertical-align:top;white-space:nowrap">${esc(LABELS[k] || k)}</td><td style="padding:6px 0;color:#101814">${esc(d[k]).replace(/\n/g, '<br>')}</td></tr>`).join('');
    const html = `<div style="font:15px/1.5 Arial,sans-serif;max-width:640px"><div style="border-top:4px solid #4ADD97;padding-top:12px"><strong style="font-size:17px">${esc(spec.label)}</strong> · ${ref}</div>
      <table style="border-collapse:collapse;margin-top:12px">${rows}</table>
      ${file ? `<p style="color:#5E6A64">Attachment: ${esc(file.name)} (${Math.round(file.size / 1024)} KB)${file.size > 7e6 ? ' — too large to attach here; download it from the inbox.' : ''}</p>` : ''}
      <p style="color:#5E6A64;font-size:13px">Reply to this email to answer ${esc(d.name)} directly.${env.SITE_URL ? ` Inbox: ${esc(env.SITE_URL)}/admin/` : ''}</p></div>`;
    const text = ['name', 'email', 'phone', ...spec.fields, 'page'].filter(k => d[k]).map(k => `${LABELS[k] || k}: ${d[k]}`).join('\n');
    try {
      await sendEmail(env, {
        to: recipients(env), reply_to: d.email, subject: `[${spec.label}] ${subject} — ${d.name} (${ref})`, html, text: `${spec.label} ${ref}\n\n${text}`,
        ...(file && file.size <= 7e6 ? { attachments: [{ filename: file.name, content: b64(buf) }] } : {}),
      });
      emailed = true;
      if (env.SEND_CONFIRMATION !== 'off') {
        await sendEmail(env, {
          to: [d.email], reply_to: (env.REPLY_TO || 'info@ampropertiez.com'), subject: `We received your message (${ref})`,
          html: `<div style="font:15px/1.6 Arial,sans-serif;max-width:560px"><p>Hi ${esc(d.name.split(' ')[0])},</p><p>Thank you for contacting A&amp;M Propertiez. Both partners have your ${esc(spec.label.toLowerCase())} and one of us will reply within one business day.</p><p>Your reference is <strong>${ref}</strong>. Reply to this email if you need to add anything.</p><p>A&amp;M Propertiez<br>Lakeland, Florida · ampropertiez.com</p></div>`,
          text: `Hi ${d.name},\n\nThank you for contacting A&M Propertiez. Both partners have your ${spec.label.toLowerCase()} and one of us will reply within one business day.\n\nReference: ${ref}\n\nA&M Propertiez, Lakeland, Florida`,
        }).catch(e => console.error('confirmation failed', e));
      }
    } catch (e) { console.error('notify failed', e); }
  }

  if (env.DB) {
    try {
      await ensureTable(env.DB);
      await env.DB.prepare('INSERT INTO messages (ref, form, created, name, email, phone, subject, data, file_name, file_type, file_size, emailed, ip_country) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)')
        .bind(ref, formId, created, d.name, d.email, d.phone, subject, JSON.stringify(d), fileSaved ? file.name : (file ? file.name + ' (not stored)' : null), file ? file.type : null, file ? file.size : null, emailed ? 1 : 0, request.headers.get('cf-ipcountry') || '').run();
      stored = true;
    } catch (e) { console.error('db failed', e); }
  }

  if (!stored && !emailed) return fail('We could not save or deliver your message. Please email info@ampropertiez.com.', 502);
  return wantsJson ? json({ ok: true, ref, emailed: emailed && env.SEND_CONFIRMATION !== 'off' })
    : Response.redirect(new URL(`/thanks/?ref=${ref}`, request.url), 303);
}

export const onRequest = () => json({ ok: false, error: 'Use POST.' }, 405);
