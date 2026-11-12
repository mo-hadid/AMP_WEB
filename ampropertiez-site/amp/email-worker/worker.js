// Cloudflare Email Worker for ampropertiez.com.
// Sends shared addresses (info@, bids@) to BOTH partners' personal inboxes.
// Every destination must be verified once under Email Routing -> Destination addresses.
// Edit the two inbox addresses in wrangler.toml (PARTNER_INBOXES), not here.
export default {
  async email(message, env) {
    const inboxes = String(env.PARTNER_INBOXES || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!inboxes.length) return message.setReject('No destination configured');
    const results = await Promise.allSettled(inboxes.map(to => message.forward(to)));
    const failed = results.filter(r => r.status === 'rejected');
    failed.forEach(f => console.error('forward failed', f.reason));
    if (failed.length === results.length) message.setReject('Temporary delivery problem, please retry');
  },
};
