// Page content for ampropertiez.com. Company details come from content/site.json.
// Each page: { path, title, description, nav, body(site, data) }.

const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export { esc };

const ICON = {
  sell: '<svg class="icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round" aria-hidden="true"><path d="M6 24 24 8l18 16" stroke="#4ADD97"/><path d="M11 21v19h26V21"/><circle cx="24" cy="29" r="4.5" stroke="#5477BB"/><path d="M27.5 32.5 33 38" stroke="#5477BB"/></svg>',
  buy: '<svg class="icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round" aria-hidden="true"><path d="M4 38c8-6 16-6 24-3s12 2 16-1" /><path d="M14 33V17l9-8 9 8v12" stroke="#5477BB"/><path d="M36 30v-9M33 21h6" stroke="#4ADD97"/></svg>',
  build: '<svg class="icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round" aria-hidden="true"><path d="M9 30a15 15 0 0 1 30 0" stroke="#4ADD97"/><path d="M6 30h36v5H6z"/><path d="M21 15v-4h6v4" stroke="#5477BB"/><path d="M14 42h20"/></svg>',
  land: '<svg viewBox="0 0 120 80" fill="none" aria-hidden="true"><path d="M4 66c22-14 44-14 66-6s34 6 46 0" stroke="#101814" stroke-width="4"/><path d="M34 60V32l20-18 20 18v24" stroke="#5477BB" stroke-width="4" stroke-linejoin="round"/><path d="M84 58V40M78 40h12" stroke="#137A4D" stroke-width="4"/></svg>',
};

const landline = '<svg class="landline" viewBox="0 0 1200 34" preserveAspectRatio="none" aria-hidden="true"><path d="M0 26C140 6 300 4 520 14s440 18 680 6" fill="none" stroke="currentColor" stroke-width="5"/></svg>';

const heroArt = `<div class="hero-art"><svg viewBox="0 0 560 420" role="img" aria-labelledby="ha-t"><title id="ha-t">Three home outlines on a strip of land with survey stakes</title>
  <circle cx="452" cy="96" r="46" fill="#E3F8EE"/>
  <g fill="none" stroke-linejoin="miter" stroke-width="9">
    <path d="M60 300 170 190l110 110" stroke="#4ADD97"/><path d="M166 300V194" stroke="#4ADD97"/><path d="M178 300V194" stroke="#5477BB"/>
    <path d="M178 194l100 100 100-100" stroke="#5477BB"/><path d="M378 300V194" stroke="#5477BB"/><path d="M390 300V194" stroke="#4ADD97"/>
    <path d="M390 194l110 110" stroke="#4ADD97"/><path d="M86 274h80M390 274h86" stroke="#4ADD97"/>
  </g>
  <g fill="#101814"><rect x="132" y="222" width="22" height="22"/><rect x="190" y="222" width="22" height="22"/><rect x="132" y="252" width="22" height="22"/><rect x="190" y="252" width="22" height="22"/>
  <rect x="344" y="222" width="22" height="22"/><rect x="402" y="222" width="22" height="22"/><rect x="344" y="252" width="22" height="22"/><rect x="402" y="252" width="22" height="22"/></g>
  <path d="M30 318c70-40 170-36 290-22s170 14 214 8" fill="none" stroke="#101814" stroke-width="9" stroke-linecap="round"/>
  <g stroke="#137A4D" stroke-width="4"><path d="M70 372v-30M470 372v-30"/></g><path d="M70 344h14l-14 9zM470 344h14l-14 9z" fill="#4ADD97"/>
  <path d="M70 384h400" stroke="#5E6A64" stroke-width="2" stroke-dasharray="6 7"/>
</svg></div>`;

// ---------- forms ----------
function field(f) {
  const id = `${f.form}-${f.name}`;
  const req = f.required ? ' required' : '';
  const opt = f.required ? '' : ' <span class="opt">(optional)</span>';
  const full = f.full ? ' full' : '';
  let input;
  if (f.type === 'select') input = `<select id="${id}" name="${f.name}"${req}><option value="">Choose one</option>${f.options.map(o => `<option>${esc(o)}</option>`).join('')}</select>`;
  else if (f.type === 'textarea') input = `<textarea id="${id}" name="${f.name}"${req}${f.placeholder ? ` placeholder="${esc(f.placeholder)}"` : ''}></textarea>`;
  else if (f.type === 'file') input = `<input id="${id}" name="${f.name}" type="file" accept=".pdf,.jpg,.jpeg,.png,.heic,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip">`;
  else input = `<input id="${id}" name="${f.name}" type="${f.type || 'text'}"${req}${f.auto ? ` autocomplete="${f.auto}"` : ''}${f.placeholder ? ` placeholder="${esc(f.placeholder)}"` : ''}${f.type === 'tel' ? ' inputmode="tel"' : ''}>`;
  return `<div class="field${full}"><label for="${id}">${esc(f.label)}${opt}</label>${input}${f.hint ? `<span class="hint">${esc(f.hint)}</span>` : ''}</div>`;
}
const who = form => [
  { form, name: 'name', label: 'Full name', required: true, auto: 'name' },
  { form, name: 'email', label: 'Email', type: 'email', required: true, auto: 'email' },
  { form, name: 'phone', label: 'Phone', type: 'tel', auto: 'tel' },
];
function form(site, { id, title, intro, fields, submit, note }) {
  return `<form class="form-shell js-form" action="/api/submit" method="post" enctype="multipart/form-data" data-form="${id}" novalidate>
  ${title ? `<h2>${title}</h2>` : ''}${intro ? `<p class="muted">${intro}</p>` : ''}
  <input type="hidden" name="form" value="${id}"><input type="hidden" name="page" value=""><input type="hidden" name="t0" value="">
  <div class="hp" aria-hidden="true"><label for="${id}-website">Leave this empty</label><input id="${id}-website" name="website" tabindex="-1" autocomplete="off"></div>
  <div class="form-grid">${fields.map(f => field({ form: id, ...f })).join('')}
    <div class="field full"><label class="consent"><input type="checkbox" name="consent" value="yes" required> <span>You may contact me by email or phone about this request. See the <a href="/privacy/">privacy notice</a>.</span></label></div>
  </div>
  ${site.turnstileSiteKey ? `<div class="cf-turnstile" data-sitekey="${esc(site.turnstileSiteKey)}" style="margin-top:18px"></div>` : ''}
  <div class="form-foot"><button class="btn primary" type="submit">${submit}</button><span class="hint">${note || `We reply within ${esc(site.responseTime)}.`}</span></div>
  <div class="form-status" role="status" aria-live="polite"></div>
</form>`;
}

const counties = ['Polk', 'Hillsborough', 'Osceola', 'Lake', 'Pasco', 'Highlands', 'Hardee', 'Orange', 'Other Florida county', 'Outside Florida'];

export const forms = {
  offer: site => form(site, {
    id: 'offer', title: 'Request an offer', intro: 'Tell us about the property. The more you share, the sooner we can give you a number.',
    submit: 'Send for an offer',
    fields: [...who('offer'),
      { name: 'contact_pref', label: 'Best way to reach you', type: 'select', options: ['Email', 'Phone call', 'Text message'] },
      { name: 'address', label: 'Property address or parcel ID', required: true, full: true, hint: 'A parcel ID from the county property appraiser works for vacant land.' },
      { name: 'county', label: 'County', type: 'select', options: counties, required: true },
      { name: 'property_type', label: 'Property type', type: 'select', required: true, options: ['Vacant land / lot', 'Single-family house', 'Mobile home with land', 'Duplex to fourplex', 'Other'] },
      { name: 'relationship', label: 'You are the', type: 'select', required: true, options: ['Owner', 'Co-owner / heir', 'Agent for the owner', 'Other'] },
      { name: 'condition', label: 'Condition', type: 'select', options: ['Vacant land', 'Move-in ready', 'Needs light repairs', 'Needs major repairs', 'Not sure'] },
      { name: 'timeline', label: 'Timeline', type: 'select', options: ['As soon as possible', 'Within 30 days', 'Within 90 days', 'Just exploring'] },
      { name: 'asking', label: 'Price in mind', placeholder: 'e.g. $25,000 or not sure' },
      { name: 'message', label: 'Anything else we should know?', type: 'textarea', full: true, placeholder: 'Back taxes, liens, tenants, access, utilities, why you are selling…' },
      { name: 'attachment', label: 'Photos or documents', type: 'file', full: true, hint: 'One file up to 10 MB. Zip several photos together.' }],
  }),
  buyer: site => form(site, {
    id: 'buyer', title: 'Join the buyer list', intro: 'Get first notice when a lot or home that fits you comes up.',
    submit: 'Join the list',
    fields: [...who('buyer'),
      { name: 'looking_for', label: 'Looking for', type: 'select', required: true, options: ['Vacant land / lot', 'Home to live in', 'Rental or investment property', 'Any of these'] },
      { name: 'areas', label: 'Areas you want', placeholder: 'e.g. Lakeland, Winter Haven', full: false },
      { name: 'budget', label: 'Budget', type: 'select', options: ['Under $25,000', '$25,000 to $75,000', '$75,000 to $150,000', '$150,000 to $300,000', 'Over $300,000'] },
      { name: 'funding', label: 'Paying with', type: 'select', options: ['Cash', 'Mortgage (pre-approved)', 'Mortgage (not yet)', 'Seller financing', 'Not sure'] },
      { name: 'property_id', label: 'Asking about a specific listing?', placeholder: 'Listing name' },
      { name: 'message', label: 'What else matters to you?', type: 'textarea', full: true, placeholder: 'Acreage, schools, road access, timing…' }],
  }),
  vendor: site => form(site, {
    id: 'vendor', title: 'Join our contractor network', intro: 'We bring in trades, surveyors and service providers for land, renovation and small builds.',
    submit: 'Send my details', note: 'Licensed, insured contractors get first look at new work.',
    fields: [...who('vendor'),
      { name: 'company', label: 'Company name', required: true },
      { name: 'trade', label: 'Trade or service', type: 'select', required: true, options: ['General contractor', 'Residential / building contractor', 'Site work, clearing or grading', 'Surveying', 'Septic / well', 'Electrical', 'Plumbing', 'HVAC', 'Roofing', 'Concrete / foundations', 'Painting / finishes', 'Handyman / repairs', 'Landscaping', 'Title / closing', 'Inspection / appraisal', 'Other'] },
      { name: 'license', label: 'FL license no.', hint: 'If your trade needs one.' },
      { name: 'insured', label: 'Insurance', type: 'select', required: true, options: ['General liability + workers’ comp', 'General liability only', 'Exempt / not applicable', 'Not yet'] },
      { name: 'areas', label: 'Counties you cover', placeholder: 'e.g. Polk, Hillsborough' },
      { name: 'website_url', label: 'Website', type: 'url', placeholder: 'https://' },
      { name: 'message', label: 'Typical jobs, crew size, availability', type: 'textarea', full: true },
      { name: 'attachment', label: 'Certificate of insurance, W-9 or capability sheet', type: 'file', full: true, hint: 'One PDF or image up to 10 MB.' }],
  }),
  bid: site => form(site, {
    id: 'bid', title: 'Submit a quote', intro: 'Pricing a project we posted, or proposing work on one of our properties.',
    submit: 'Submit quote', note: 'You get a reference number to quote in any follow-up.',
    fields: [...who('bid'),
      { name: 'company', label: 'Company name', required: true },
      { name: 'project', label: 'Project', required: true, placeholder: 'Project ID or address' },
      { name: 'amount', label: 'Quote total (USD)', required: true, placeholder: '$' },
      { name: 'start', label: 'Earliest start and duration', placeholder: 'e.g. Jan 5, 4 days' },
      { name: 'license', label: 'FL license no.', hint: 'If the work requires one.' },
      { name: 'message', label: 'Scope, inclusions and exclusions', type: 'textarea', required: true, full: true },
      { name: 'attachment', label: 'Quote or proposal document', type: 'file', full: true, hint: 'PDF preferred, up to 10 MB.' }],
  }),
  contact: site => form(site, {
    id: 'contact', title: 'Send us a message', intro: 'Questions, partnerships, or a quote request for something not covered elsewhere.',
    submit: 'Send message',
    fields: [...who('contact'),
      { name: 'topic', label: 'Topic', type: 'select', required: true, options: ['Selling a property', 'Buying a property', 'Contractor or vendor', 'Quote request', 'Partnership', 'Other'] },
      { name: 'subject', label: 'Subject', required: true, full: true },
      { name: 'message', label: 'Message', type: 'textarea', required: true, full: true },
      { name: 'attachment', label: 'Attachment', type: 'file', full: true, hint: 'One file up to 10 MB.' }],
  }),
};

const band = (title, text, a, b) => `<section class="band"><div class="wrap"><div><h2>${title}</h2><p>${text}</p></div><div class="actions">${a}${b || ''}</div></div></section>`;

export const pages = [
  {
    path: '/', nav: 'home',
    title: 'A&M Propertiez | We buy land and homes in Lakeland & Central Florida',
    description: 'A&M Propertiez buys vacant land, lots and houses for cash in Lakeland, Polk County and Central Florida, and develops affordable homes. Request an offer, find property, or join our contractor network.',
    body: site => `
<section class="hero"><div class="wrap">
  <div>
    <p class="eyebrow">Real estate · ${esc(site.serviceArea)}</p>
    <h1>Land and homes, <em>bought and built</em> the straight way.</h1>
    <p class="lede">A&M Propertiez is a small, owner-run real-estate company. We buy land and houses directly from owners, improve them, and put affordable property back on the market.</p>
    <div class="actions"><a class="btn primary" href="/sell/">Get an offer on your property</a><a class="btn" href="/properties/">See available property</a></div>
    <ul class="trust"><li>Buy directly, no listing</li><li>Cash or quick-close options</li><li>Local owners in Lakeland</li></ul>
  </div>
  ${heroArt}
</div></section>

<section class="section"><div class="wrap">
  <div class="section-head"><div><p class="eyebrow">How we can help</p><h2>Three ways to work with us</h2></div>
  <p>Whether you own a lot you no longer want, need a place to build or live, or run a crew that does good work, there is a straightforward path in.</p></div>
  <div class="grid g3">
    <a class="card" href="/sell/">${ICON.sell}<span class="tag">Owners</span><h3>Sell your land or house</h3><p>Inherited lot, tax-burdened parcel, tired rental or a house that needs work. Tell us about it and get a written offer.</p><span class="more">Request an offer →</span></a>
    <a class="card blue" href="/properties/">${ICON.buy}<span class="tag">Buyers</span><h3>Find a lot or a home</h3><p>Affordable land and homes we own and have checked: access, taxes and title basics. Join the list to hear first.</p><span class="more">Browse property →</span></a>
    <a class="card ink" href="/contractors/">${ICON.build}<span class="tag">Contractors</span><h3>Work on our projects</h3><p>Clearing, surveys, repairs and small builds. Join our network, see open work and submit quotes online.</p><span class="more">Contractor portal →</span></a>
  </div>
</div></section>

<section class="section alt"><div class="wrap">
  <div class="section-head"><div><p class="eyebrow">Selling to us</p><h2>From first message to closing</h2></div>
  <p>No showings, no repairs, no agent commission. A licensed title company or attorney handles every closing, so funds and paperwork are protected.</p></div>
  <ol class="steps">
    <li><h3>Tell us about it</h3><p>Send the address or parcel ID and a few details through the offer form.</p></li>
    <li><h3>We research</h3><p>We check county records, taxes, access, zoning and comparable sales.</p></li>
    <li><h3>Written offer</h3><p>You get a clear offer with price, closing costs and timeline. No pressure to accept.</p></li>
    <li><h3>Close with title</h3><p>A title company or closing attorney handles the deed and pays you at closing.</p></li>
  </ol>
</div></section>

<section class="section"><div class="wrap split">
  <div><p class="eyebrow">What we do</p><h2>Small projects, done carefully</h2>
    <p class="lede" style="margin-top:16px">We focus on the property that bigger investors pass over, and we keep each project small enough to do properly.</p></div>
  <ul class="checks">
    <li><strong>Land acquisition.</strong> Vacant lots and acreage, including tax-deed and auction parcels, researched before we buy.</li>
    <li><strong>Renovation and resale.</strong> Houses that need work are repaired by licensed trades and resold at fair prices.</li>
    <li><strong>Small residential development.</strong> Preparing lots for homes: clearing, surveys, utilities and permits.</li>
    <li><strong>Affordable property.</strong> Getting land and homes into the hands of people who will use them.</li>
  </ul>
</div></section>
${band('Own property you would like to sell?', 'Send the details. We answer within ' + esc(site.responseTime) + '.', '<a class="btn primary" href="/sell/">Request an offer</a>', '<a class="btn" href="/contact/">Ask a question</a>')}`,
  },

  {
    path: '/sell/', nav: 'sell',
    title: 'Sell your land or house for cash | A&M Propertiez, Lakeland FL',
    description: 'Sell vacant land, a lot or a house directly to A&M Propertiez. No listing, no repairs, no agent commission. Written offer and closing through a title company.',
    body: site => `
<section class="page-head"><div class="wrap"><div class="crumbs"><a href="/">Home</a> / Sell</div>
  <p class="eyebrow">For property owners</p><h1>Sell your land or house directly to us</h1>
  <p class="lede">We buy vacant land, lots, mobile homes with land, and houses in any condition, mainly in ${esc(site.serviceArea)}. You deal with the owners, not a call center.</p></div></section>
<section class="section"><div class="wrap split">
  <div>${forms.offer(site)}</div>
  <div>
    <h2>Good fits</h2>
    <ul class="checks">
      <li>Inherited land or a house you do not plan to use</li>
      <li>Lots with back taxes, or a parcel you keep paying taxes on</li>
      <li>Houses that need repairs you would rather not make</li>
      <li>Rentals you are ready to stop managing</li>
      <li>Out-of-state owners who want a simple, remote sale</li>
    </ul>
    <h2 style="margin-top:40px">Common questions</h2>
    <div class="faq" style="margin-top:16px">
      <details><summary>Do you charge fees or commission?</summary><p>No. We are the buyer, not an agent, so there is no listing commission. Who pays which closing costs is written into the offer before you agree to anything.</p></details>
      <details><summary>How fast can you close?</summary><p>It depends on title. When the title is clear, closings can happen in a few weeks. Land with title problems takes longer, and we tell you up front.</p></details>
      <details><summary>Will you list my property for sale?</summary><p>No. We only buy property for ourselves. If you want it listed on the market, a licensed real-estate agent is the right call.</p></details>
      <details><summary>Is my information shared?</summary><p>No. It goes only to the two partners and is used only to answer your request. See the <a href="/privacy/">privacy notice</a>.</p></details>
    </div>
  </div>
</div></section>`,
  },

  {
    path: '/properties/', nav: 'properties',
    title: 'Land and homes for sale | A&M Propertiez',
    description: 'Affordable lots, land and homes owned by A&M Propertiez. See what is available now or join the buyer list for first notice.',
    body: (site, data) => {
      const items = data.properties.items || [];
      const cards = items.map(p => `<article class="listing" id="${esc(p.id)}">
        <div class="ph">${p.photo ? `<img src="/images/properties/${esc(p.photo)}" alt="${esc(p.title)}" loading="lazy">` : ICON.land}</div>
        <div class="body"><span class="status ${esc(p.status)}">${esc((p.status || 'available').replace('-', ' '))}</span>
          <h3>${esc(p.title)}</h3><p class="muted small">${esc(p.location)} · ${esc(p.type)}${p.size ? ' · ' + esc(p.size) : ''}</p>
          <div class="price">${esc(p.price)}</div><p>${esc(p.summary)}</p>
          ${p.details && p.details.length ? `<ul>${p.details.map(d => `<li>${esc(d)}</li>`).join('')}</ul>` : ''}
          ${p.status !== 'sold' ? `<a class="btn small js-ask" href="#buyer-form" data-listing="${esc(p.title)}">Ask about this</a>` : ''}</div></article>`).join('');
      return `
<section class="page-head"><div class="wrap"><div class="crumbs"><a href="/">Home</a> / Properties</div>
  <p class="eyebrow">For buyers</p><h1>Land and homes for sale</h1>
  <p class="lede">Property we own and have researched: taxes, access and title basics checked before it is offered. Prices are direct from the owner.</p></div></section>
<section class="section"><div class="wrap">
  ${items.length ? `<div class="listings">${cards}</div>` : `<div class="empty"><h3>No public listings right now</h3><p>New lots and homes often go to the buyer list before they are posted here. Join it below and tell us what you are looking for.</p><a class="btn primary" href="#buyer-form">Join the buyer list</a></div>`}
  <p class="notice">Equal Housing Opportunity. Listings are offered by the owner, A&M Propertiez LLC. Information is believed accurate but not guaranteed; buyers should verify zoning, flood zone, utilities and title before closing.</p>
</div></section>
<section class="section alt" id="buyer-form"><div class="wrap split">
  <div><p class="eyebrow">Buyer list</p><h2>Hear about property first</h2><p class="lede" style="margin-top:16px">Tell us what you want and your budget. We only contact you when something fits.</p></div>
  <div>${forms.buyer(site)}</div>
</div></section>`;
    },
  },

  {
    path: '/contractors/', nav: 'contractors',
    title: 'Contractors and vendors | A&M Propertiez',
    description: 'Contractors, surveyors and service providers in Central Florida: join the A&M Propertiez network, see open projects and submit quotes online.',
    body: (site, data) => {
      const items = data.projects.items || [];
      const list = items.map(p => `<article class="project" id="${esc(p.id)}"><div><span class="tag" style="font:700 .72rem var(--sans);letter-spacing:.12em;color:var(--blue-ink)">${esc(p.id)}</span><h3>${esc(p.title)}</h3><p>${esc(p.scope)}</p><p class="meta">${esc(p.location)} · ${esc((p.trades || []).join(', '))}${p.due ? ' · Quotes due ' + esc(p.due) : ''}</p></div><a class="btn small js-quote" href="#quote" data-project="${esc(p.id + ' ' + p.title)}">Quote this</a></article>`).join('');
      return `
<section class="page-head"><div class="wrap"><div class="crumbs"><a href="/">Home</a> / Contractors</div>
  <p class="eyebrow">For contractors and vendors</p><h1>Work with A&M Propertiez</h1>
  <p class="lede">We hire local trades for clearing, surveys, repairs, renovations and small builds. Clear scopes, written agreements and prompt payment on completed work.</p></div></section>
<section class="section"><div class="wrap">
  <div class="section-head"><div><p class="eyebrow">Open work</p><h2>Projects taking quotes</h2></div><p>Pick a project and send your number. Questions about a scope go to <a href="mailto:${esc(site.emails.contractors)}">${esc(site.emails.contractors)}</a>.</p></div>
  ${items.length ? `<div class="projects">${list}</div>` : `<div class="empty"><h3>No projects open for quotes right now</h3><p>Join the network below and we will send you scopes for your trade and area as they come up.</p><a class="btn primary" href="#network">Join the network</a></div>`}
</div></section>
<section class="section alt"><div class="wrap">
  <div class="tabs" role="tablist" aria-label="Contractor forms">
    <button type="button" role="tab" aria-selected="true" aria-controls="network" id="tab-network">Join the network</button>
    <button type="button" role="tab" aria-selected="false" aria-controls="quote" id="tab-quote">Submit a quote</button>
  </div>
  <div class="split">
    <div><div id="network" role="tabpanel" aria-labelledby="tab-network">${forms.vendor(site)}</div>
      <div id="quote" role="tabpanel" aria-labelledby="tab-quote" hidden>${forms.bid(site)}</div></div>
    <div><h2>What we look for</h2>
      <ul class="checks"><li>An active Florida license where the work requires one (Chapter 489, Florida Statutes)</li><li>General liability insurance, and workers’ comp where required</li><li>Written quotes with clear inclusions and exclusions</li><li>Permits pulled by the licensed party when work needs them</li><li>Photos at start and finish</li></ul>
      <p class="notice">We verify licenses on the Florida DBPR site (<a href="https://www.myfloridalicense.com/wl11.asp" rel="noopener">myfloridalicense.com</a>) before awarding work.</p></div>
  </div>
</div></section>`;
    },
  },

  {
    path: '/about/', nav: 'about',
    title: 'About A&M Propertiez | Lakeland, Florida',
    description: 'A&M Propertiez LLC is a Lakeland, Florida real-estate company run by its partners, Mohamed Hadid and Abohfu Anumoh.',
    body: site => `
<section class="page-head"><div class="wrap"><div class="crumbs"><a href="/">Home</a> / About</div>
  <p class="eyebrow">About us</p><h1>Owner-run, local and small on purpose</h1>
  <p class="lede">${esc(site.legalName)} is a Florida company based in ${esc(site.city)}. We buy, improve and sell land and homes, and we keep the work small enough that the partners handle every deal themselves.</p></div></section>
<section class="section"><div class="wrap">
  <div class="section-head"><div><p class="eyebrow">The partners</p><h2>Who you will deal with</h2></div><p>Every offer, every contractor agreement and every closing goes through one of us.</p></div>
  <div class="grid g2">${site.team.map((m, i) => `<article class="person${i % 2 ? ' b' : ''}"><div class="avatar" aria-hidden="true">${esc(m.name.split(' ').map(w => w[0]).join('').slice(0, 2))}</div><div>
    <h3>${esc(m.name)}</h3><p class="role">${esc(m.title)}</p>${m.focus ? `<p>${esc(m.focus)}</p>` : ''}
    <p><a href="mailto:${esc(m.email)}">${esc(m.email)}</a>${m.phone ? ` · <a href="tel:${esc(m.phone.replace(/[^0-9+]/g, ''))}">${esc(m.phone)}</a>` : ''}</p>
    ${m.linkedin ? `<p><a href="${esc(m.linkedin)}" rel="noopener">LinkedIn</a></p>` : ''}</div></article>`).join('')}</div>
</div></section>
<section class="section alt"><div class="wrap">
  <div class="section-head"><div><p class="eyebrow">How we work</p><h2>What you can expect</h2></div><p>Simple promises we hold ourselves to on every deal.</p></div>
  <div class="grid g4">
    <div class="card"><h3>Straight numbers</h3><p>Offers in writing, with costs and timeline spelled out.</p></div>
    <div class="card"><h3>Research first</h3><p>Taxes, liens, access and zoning checked before we commit.</p></div>
    <div class="card"><h3>Proper closings</h3><p>A title company or closing attorney handles deeds and money.</p></div>
    <div class="card"><h3>Licensed trades</h3><p>Work that needs a license is done by licensed contractors.</p></div>
  </div>
</div></section>
${band('Have a property or a project in mind?', 'Reach both partners at once through the contact page.', '<a class="btn primary" href="/contact/">Contact us</a>')}`,
  },

  {
    path: '/contact/', nav: 'contact',
    title: 'Contact A&M Propertiez | Lakeland, FL',
    description: 'Contact A&M Propertiez: sell a property, ask about a listing, request a quote or reach the partners directly.',
    body: site => `
<section class="page-head"><div class="wrap"><div class="crumbs"><a href="/">Home</a> / Contact</div>
  <p class="eyebrow">Contact</p><h1>Talk to the partners</h1>
  <p class="lede">Every message reaches both partners. You get a reference number, and a reply within ${esc(site.responseTime)}.</p></div></section>
<section class="section"><div class="wrap split">
  <div>${forms.contact(site)}</div>
  <div><h2>Direct lines</h2>
    <ul class="contact-list" style="margin-top:18px">
      <li><strong>General and quote requests</strong><a href="mailto:${esc(site.emails.general)}">${esc(site.emails.general)}</a></li>
      <li><strong>Contractors and bids</strong><a href="mailto:${esc(site.emails.contractors)}">${esc(site.emails.contractors)}</a></li>
      ${site.team.map(m => `<li><strong>${esc(m.name)}, ${esc(m.title)}</strong><a href="mailto:${esc(m.email)}">${esc(m.email)}</a>${m.phone ? `<br><a href="tel:${esc(m.phone.replace(/[^0-9+]/g, ''))}">${esc(m.phone)}</a>` : ''}</li>`).join('')}
      ${site.phone ? `<li><strong>Phone</strong><a href="tel:${esc(site.phone.replace(/[^0-9+]/g, ''))}">${esc(site.phone)}</a></li>` : ''}
      ${site.mailingAddress ? `<li><strong>Mailing address</strong>${esc(site.mailingAddress)}</li>` : ''}
    </ul>
    <p class="notice">Selling? The <a href="/sell/">offer form</a> asks the right questions up front. Contractor? Use the <a href="/contractors/">contractor portal</a>.</p></div>
</div></section>`,
  },

  {
    path: '/privacy/', nav: '',
    title: 'Privacy notice | A&M Propertiez',
    description: 'How A&M Propertiez handles the information you send through this website.',
    body: site => `
<section class="page-head"><div class="wrap"><p class="eyebrow">Privacy</p><h1>Privacy notice</h1><p class="lede">Short version: we use what you send only to answer you, and we do not sell or share it.</p></div></section>
<section class="section"><div class="wrap prose">
  <h2>What we collect</h2><p>What you type into a form (name, contact details, property or project details) and any file you attach. The site uses Cloudflare's cookie-free analytics for page counts. It sets no advertising or tracking cookies.</p>
  <h2>How we use it</h2><p>To reply to you, prepare offers, evaluate contractors and keep a record of the conversation. Messages are stored securely with our hosting provider (Cloudflare) and delivered to the partners by email.</p>
  <h2>Who sees it</h2><p>The partners of ${esc(site.legalName)}. If a deal goes ahead, the title company or closing attorney receives what they need to close. We do not sell personal information.</p>
  <h2>Your choices</h2><p>Ask us at <a href="mailto:${esc(site.emails.general)}">${esc(site.emails.general)}</a> to see, correct or delete what we hold about you, or to stop contacting you.</p>
  <p class="muted small">Last updated November 2026.</p>
</div></section>`,
  },

  {
    path: '/thanks/', nav: '', noindex: true,
    title: 'Message received | A&M Propertiez',
    description: 'Your message reached A&M Propertiez.',
    body: () => `<section class="section"><div class="wrap prose"><p class="eyebrow">Thank you</p><h1>We have your message</h1><p class="lede" style="margin-top:16px">Your reference is <strong id="ref">on its way to your inbox</strong>. Both partners have been notified.</p><div class="actions"><a class="btn primary" href="/">Back to home</a></div></div></section>`,
  },
  {
    path: '/404.html', nav: '', noindex: true, file: '404.html',
    title: 'Page not found | A&M Propertiez',
    description: 'This page does not exist.',
    body: () => `<section class="section"><div class="wrap prose"><p class="eyebrow">404</p><h1>That page is not here</h1><p class="lede" style="margin-top:16px">The link may be old. Try one of these instead.</p><div class="actions"><a class="btn primary" href="/">Home</a><a class="btn" href="/sell/">Sell a property</a><a class="btn" href="/contact/">Contact</a></div></div></section>`,
  },
];
