# ampropertiez.com — setup

Everything below is free. Do Part A first; the site is live after it.
`https://ampropertiez.com/api/health` shows which parts are switched on.

## Part A. Put the site online (15 min)

1. Push this folder to a new GitHub repository (private is fine).
2. Cloudflare → **Workers & Pages → Create → Pages → Connect to Git** → pick the repo.
3. Build command `node build.mjs` · Output directory `dist` · Variable `NODE_VERSION` = `22`. Deploy.
4. Pages project → **Custom domains** → add `ampropertiez.com`, then `www.ampropertiez.com`.
   (The domain is already on Cloudflare, so this finishes in minutes. Remove any old A/CNAME record it complains about.)

## Part B. Website forms → both partners

Pages project → **Settings → Bindings / Variables and Secrets**. After each change: **Deployments → Retry deployment**.

| # | What it does | How | Name |
|---|---|---|---|
| 1 | Saves every form with a reference number | Storage & Databases → **D1** → create `amp` → bind it | `DB` |
| 2 | Saves uploaded files | Storage & Databases → **KV** → create `amp-files` → bind it | `FILES` |
| 3 | Private inbox at `/admin/` | Add **Secret**, 32+ random characters | `ADMIN_TOKEN` |
| 4 | Emails each form to both partners | In the **same Resend account as Technyah** (free plan allows 3 domains): Domains → Add `ampropertiez.com` → let it add the DNS records → API Keys → create key. Add it as a **Secret** | `RESEND_API_KEY` |
| 5 | Spam check (optional) | Turnstile → Add widget for `ampropertiez.com` → put the site key in `content/site.json` (`turnstileSiteKey`), push → secret key as **Secret** | `TURNSTILE_SECRET` |

Plain variables (optional): `MAIL_TO` (default `mhadid@ampropertiez.com,aanumoh@ampropertiez.com`),
`MAIL_FROM` (default `A&M Propertiez <website@ampropertiez.com>`), `SITE_URL` = `https://ampropertiez.com`, `SEND_CONFIRMATION=off` to stop the receipt email to the sender.

Each email has **Reply-To set to the sender**, so hitting Reply answers the customer or contractor directly. Files up to 7 MB come attached; larger ones download from `/admin/`.

## Part C. Your @ampropertiez.com mailboxes (no Zoho, no paid plan)

How it works: Cloudflare **receives** mail for the domain and forwards it to your personal Gmail. **Brevo** (free, 300 emails/day) **sends** mail out as your @ampropertiez.com address from inside Gmail.

| Address | Goes to |
|---|---|
| mhadid@ampropertiez.com | Mohamed's Gmail |
| aanumoh@ampropertiez.com | Abohfu's Gmail |
| info@ampropertiez.com | Both (via the small worker in `email-worker/`) |
| bids@ampropertiez.com | Both (same worker) |

**C1. Receive (Cloudflare Email Routing)**
1. Cloudflare → ampropertiez.com → **Email → Email Routing → Get started** → accept the MX/SPF records it adds.
2. **Destination addresses** → add both personal Gmails. Each person clicks the verification email.
3. **Routing rules → Create address**: `mhadid` → Mohamed's Gmail; `aanumoh` → Abohfu's Gmail.
4. Shared addresses: Workers & Pages → **Create → Worker** → name `amp-shared-inbox` → paste `email-worker/worker.js` → Deploy →
   Settings → Variables → `PARTNER_INBOXES` = `mo@gmail.com,abohfu@gmail.com` (your real ones).
5. Email Routing → **Create address** `info` → action **Send to a Worker** → `amp-shared-inbox`. Repeat for `bids`.
6. Leave **Catch-all** off (cuts spam).

**C2. Send as @ampropertiez.com from Gmail (Brevo)**
1. Create a free account at brevo.com with info@ampropertiez.com.
2. **Senders, Domains → Domains → Add** `ampropertiez.com` → choose the Cloudflare option so Brevo adds its DNS records, or add exactly the records it shows.
3. **SMTP & API → SMTP** → note the login and create an SMTP key.
4. Each partner, in their own Gmail: **Settings → See all settings → Accounts and Import → Send mail as → Add another email address**
   - Name: your name · Email: your @ampropertiez.com address · untick "Treat as an alias"
   - SMTP server `smtp-relay.brevo.com` · Port `587` · Username = Brevo SMTP login · Password = SMTP key · TLS
   - Gmail emails a code to that address; it arrives in the same Gmail through Email Routing. Enter it.
   - Then tick **"Reply from the same address the message was sent to"** and make it the default if you like.
5. Do the same for info@ (and bids@) if you want to reply from them.

**C3. DNS checks**
- Keep **one** SPF record on `ampropertiez.com`. If both Cloudflare and Brevo want one, merge them into a single line, e.g. `v=spf1 include:_spf.mx.cloudflare.net include:spf.brevo.com ~all`. (Resend uses its own `send.` subdomain, so it does not touch this.)
- Add a DMARC record: name `_dmarc`, TXT `v=DMARC1; p=none; rua=mailto:info@ampropertiez.com`. Tighten to `p=quarantine` after a few clean weeks.
- Test: send to mail-tester.com from each address; aim for 9/10 or better.

## Part D. Get found

1. Google Search Console → add `ampropertiez.com` (DNS verify) → submit `https://ampropertiez.com/sitemap.xml`. Same in Bing Webmaster Tools.
2. Google Business Profile as a service-area business (Lakeland / Polk County). No street address needed.
3. Pages project → **Metrics → Web Analytics** → enable (cookie-free).

## Day to day

| To | Do |
|---|---|
| Add a lot or home for sale | Edit `content/properties.json` (copy `_example` into `items`), photos in `public/images/properties/`, push |
| Post work for contractors | Edit `content/projects.json`, push. Remove it once awarded |
| Change phone, address, titles | `content/site.json`, push. Empty values stay hidden |
| Read and track messages | `https://ampropertiez.com/admin/` with your ADMIN_TOKEN |
| Preview locally | `npm install`, then `npm run dev`, open http://localhost:8788 |

## If something is off

| Symptom | Fix |
|---|---|
| Form says "not able to deliver messages right now" | Neither `DB` nor `RESEND_API_KEY` is set. Part B 1 or 4, then retry deployment |
| Saved in `/admin/` but no email | Domain not verified in Resend yet, or `MAIL_FROM` not on ampropertiez.com. Pages → Functions → Real-time logs shows why |
| info@ mail not arriving | A destination Gmail is not verified (C1 step 2), or the rule is not pointed at the worker |
| Gmail "Send mail as" fails | Use the Brevo SMTP **key**, not your Brevo password; port 587 with TLS |
| Sent mail lands in spam | Two SPF records exist, or Brevo domain not authenticated. See C3 |
