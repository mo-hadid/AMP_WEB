# ampropertiez.com — setup

Everything below is free. Do Part A first; the site is live after it.
`https://ampropertiez.com/api/health` shows which parts are switched on.

## Part A. Put the site online

This project is a **Cloudflare Worker** (your `amp-web`). Everything Cloudflare needs is in `wrangler.jsonc`:
it builds the pages, creates the message database and file storage on the first deploy, and serves the site.
Pick **one** way to deploy.

**A1. Through GitHub (recommended: every change you save on GitHub redeploys by itself)**
"Git" here means the GitHub repository that `amp-web` pulls its code from. Cloudflare created it for you when you made the Worker.
1. Cloudflare → `amp-web` → **Settings → Build**. Note the **Git repository** name. Check: Build command **empty**, Deploy command `npx wrangler deploy`, Root directory **empty**.
2. Open that repository on github.com → **Add file → Upload files**.
3. Unzip this package and drag in everything **inside** the `amp` folder (not the folder itself, not `node_modules`). Click **Commit changes**.
4. Back in Cloudflare → `amp-web` → **Deployments**. The new build should turn green in about a minute.
   If it fails, open the failed row → **Build** and copy the last 20 lines of the log to me.

**A2. From your computer (no GitHub)**
1. Install Node.js 22 from nodejs.org. Unzip this package.
2. Open a terminal in the `amp` folder and run: `npm install`, then `npx wrangler login` (approve in the browser), then `npx wrangler deploy`.
3. Stop the old failing GitHub builds: `amp-web` → **Settings → Build** → disconnect the repository.

**A3. Your domain**
`amp-web` → **Domains** tab → **Add** → `ampropertiez.com`, then again for `www.ampropertiez.com`.
If it says a DNS record already exists, delete that A/AAAA/CNAME record under the domain's **DNS** page and try again.

## Part B. Website forms → both partners

The database (`DB`) and file storage (`FILES`) are created automatically on the first deploy.
Add the secrets here: `amp-web` → **Settings → Variables and Secrets → Add** → type **Secret**. They stay in place across deploys.

| What it does | How | Name |
|---|---|---|
| Private inbox at `/admin/` | Any 32+ random characters (a password manager can generate one) | `ADMIN_TOKEN` |
| Emails each form to both partners | In the **same Resend account as Technyah** (free plan allows 3 domains): Domains → Add `ampropertiez.com` → let it add the DNS records → API Keys → create key | `RESEND_API_KEY` |
| Spam check (optional) | Turnstile → Add widget for `ampropertiez.com` → site key into `content/site.json` (`turnstileSiteKey`) and redeploy → secret key here | `TURNSTILE_SECRET` |

Who receives the emails is set in `wrangler.jsonc` under `vars` (`MAIL_TO`). Add `"SEND_CONFIRMATION": "off"` there to stop the receipt email to the sender.

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
4. Shared addresses: Workers & Pages → **Create** → start from the **Hello World** Worker → name it `amp-shared-inbox` → Deploy → **Edit code** → replace everything with `email-worker/worker.js` → Deploy →
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
3. Cloudflare → **Analytics & Logs → Web Analytics** → add `ampropertiez.com` (cookie-free).

## Day to day

| To | Do |
|---|---|
| Add a lot or home for sale | Edit `content/properties.json` (copy `_example` into `items`), photos in `public/images/properties/`, upload to GitHub (or `npx wrangler deploy`) |
| Post work for contractors | Edit `content/projects.json`, upload. Remove it once awarded |
| Change phone, address, titles | `content/site.json`, upload. Empty values stay hidden |
| Edit a file directly on GitHub | Open the file → pencil icon → edit → **Commit changes**. Cloudflare redeploys |
| Read and track messages | `https://ampropertiez.com/admin/` with your ADMIN_TOKEN |
| Preview locally | `npm install`, then `npm run dev`, open http://localhost:8787 |

## If something is off

| Symptom | Fix |
|---|---|
| Form says "not able to deliver messages right now" | The deploy did not create the database, and email is not set up. Check `/api/health`, then Part B |
| Saved in `/admin/` but no email | Domain not verified in Resend yet, or `MAIL_FROM` not on ampropertiez.com. `amp-web` → **Observability** → Logs shows why |
| Build fails mentioning D1 or KV | Create them by hand: Storage & Databases → D1 → create `amp`; KV → create `amp-files`. Put their IDs into `wrangler.jsonc` (`"database_id"`, `"id"`) and upload again |
| Build fails with "name" mismatch | The `name` in `wrangler.jsonc` must equal your Worker's name (`amp-web`) |
| info@ mail not arriving | A destination Gmail is not verified (C1 step 2), or the rule is not pointed at the worker |
| Gmail "Send mail as" fails | Use the Brevo SMTP **key**, not your Brevo password; port 587 with TLS |
| Sent mail lands in spam | Two SPF records exist, or Brevo domain not authenticated. See C3 |
