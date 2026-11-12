// GET /api/health: shows which parts of the contact system are switched on. Reveals no secrets.
import { json, recipients } from '../../lib/core.js';

export const onRequestGet = ({ env }) => json({
  ok: true,
  storage: !!env.DB,
  files: !!env.FILES,
  email: !!env.RESEND_API_KEY,
  emailTo: env.RESEND_API_KEY ? recipients(env).length + ' recipients' : 'off',
  spamCheck: !!env.TURNSTILE_SECRET,
  inbox: (env.ADMIN_TOKEN || '').length >= 16,
});
