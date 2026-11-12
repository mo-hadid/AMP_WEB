# ampropertiez.com

Static site + small contact API on one Cloudflare Worker (`amp-web`). Settings live in `wrangler.jsonc`. Start with **DEPLOY.md**.

| Folder | What is in it |
|---|---|
| `content/` | What you edit: company details, properties for sale, contractor projects |
| `src/pages.mjs` | Page wording and forms |
| `public/` | Styles, scripts, fonts, logo files, private inbox page |
| `src/worker.js`, `src/api/`, `lib/` | API: `/api/submit`, `/api/health`, `/api/admin/*`; everything else is served from `dist/` |
| `email-worker/` | Forwards info@ and bids@ to both partners |
| `build.mjs` | Builds `dist/` (no dependencies) |

Forms: Sell (offer request), Buyer list, Contractor sign-up, Contractor quote, Contact.
Each gets a reference like `AMP-O-261112-7K3F`, is saved, and is emailed to both partners with Reply-To set to the sender.
