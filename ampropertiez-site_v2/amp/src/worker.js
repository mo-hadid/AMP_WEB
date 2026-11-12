// Worker entry for ampropertiez.com.
// Static pages come from dist/ (built by build.mjs). Only /api/* runs this code (see run_worker_first in wrangler.jsonc).
import * as submit from './api/submit.js';
import * as health from './api/health.js';
import * as admin from './api/admin.js';
import { json } from '../lib/core.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url), p = url.pathname, m = request.method;
    const c = { request, env, ctx, params: {} };
    try {
      if (p === '/api/submit') return m === 'POST' ? await submit.onRequestPost(c) : json({ ok: false, error: 'Use POST.' }, 405);
      if (p === '/api/health') return health.onRequestGet(c);
      if (p.startsWith('/api/admin/')) { c.params.route = p.slice('/api/admin/'.length).split('/').filter(Boolean); return await admin.onRequest(c); }
      if (p.startsWith('/api/')) return json({ ok: false, error: 'Not found.' }, 404);
      return env.ASSETS.fetch(request);
    } catch (e) {
      console.error(e);
      return json({ ok: false, error: 'Server error. Please email info@ampropertiez.com.' }, 500);
    }
  },
};
