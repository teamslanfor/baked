/* Baked Boscombe — chat assistant widget
 *
 * Two modes, shown clearly in the widget header:
 *  - LIVE AI: when server.js is running with ANTHROPIC_API_KEY set, /api/chat/status returns {live:true}
 *    and free-text questions are answered by Claude via the server (the key never reaches the browser).
 *  - DEMO: otherwise, answers come from the scripted FAQ below. The widget is labelled "Demo assistant".
 * Quote/lead capture works in both modes and is delivered via SiteSubmit() (email if configured, otherwise a pre-filled WhatsApp message).
 */
(function () {
  'use strict';
  const S = window.SITE;
  const root = document.getElementById('chatbot-root');
  if (!root || !S) return;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ic = (n) => `<svg class="i" aria-hidden="true"><use href="#i-${n}"/></svg>`;
  const BASE = window.SITE_BASE || '';

  root.innerHTML = `
  <button class="cb-launcher" aria-label="Open chat assistant" aria-controls="cb-panel" aria-expanded="false">
    <span class="cb-av">${ic('sparkle')}</span><span class="dot"></span><span class="cb-label">Questions?</span>
  </button>
  <section class="cb-panel" id="cb-panel" role="dialog" aria-label="Chat with Baked Boscombe" aria-modal="false">
    <header class="cb-head">
      <span class="cb-av">${ic('sparkle')}</span>
      <div><strong>Baked Boscombe</strong><small><span class="cb-mode" title="Scripted answers – not connected to an AI service">Automated assistant</span></small></div>
      <button class="cb-close" aria-label="Close chat">${ic('close')}</button>
    </header>
    <div class="cb-body" aria-live="polite"></div>
    <div class="cb-quick"></div>
    <form class="cb-form" autocomplete="off">
      <label class="hp" for="cb-input">Type your message</label>
      <input id="cb-input" type="text" placeholder="Type your message…" maxlength="600" required>
      <button type="submit" aria-label="Send message">${ic('send')}</button>
    </form>
    <p class="cb-foot">Prefer a human? <a href="${S.phoneHref}">Call ${S.phone}</a>${S.whatsapp ? ` · <a href="${S.whatsapp}" target="_blank" rel="noopener">WhatsApp</a>` : (S.email ? ` · <a href="mailto:${S.email}">Email us</a>` : '')}</p>
  </section>`;

  const launcher = root.querySelector('.cb-launcher');
  const body = root.querySelector('.cb-body');
  const quick = root.querySelector('.cb-quick');
  const form = root.querySelector('.cb-form');
  const input = root.querySelector('#cb-input');
  const modeTag = root.querySelector('.cb-mode');

  let live = false; let started = false; let busy = false;
  const history = []; // for live AI context
  let lead = null; // { step, name, email, phone, inquiry }

  // ---------- open / close ----------
  const open = () => {
    document.body.classList.add('cb-open'); launcher.setAttribute('aria-expanded', 'true');
    if (!started) { started = true; init(); }
    setTimeout(() => input.focus({ preventScroll: true }), 300);
  };
  const close = () => { document.body.classList.remove('cb-open'); launcher.setAttribute('aria-expanded', 'false'); launcher.focus(); };
  launcher.addEventListener('click', open);
  root.querySelector('.cb-close').addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && document.body.classList.contains('cb-open')) close(); });
  // Any element with data-open-chat opens the assistant
  document.addEventListener('click', (e) => { const t = e.target.closest('[data-open-chat]'); if (t) { e.preventDefault(); open(); } });

  // ---------- rendering ----------
  const scroll = () => { body.scrollTop = body.scrollHeight; };
  const add = (html, who = 'bot') => {
    const d = document.createElement('div'); d.className = 'cb-msg cb-' + who; d.innerHTML = html; body.appendChild(d); scroll(); return d;
  };
  const typing = () => { const d = add('<span class="cb-typing"><span></span><span></span><span></span></span>'); d.style.padding = '0'; return d; };
  const say = (html, delay = 550) => new Promise((res) => { const t = typing(); setTimeout(() => { t.remove(); add(html); res(); }, delay); });
  const chips = (arr) => {
    quick.innerHTML = '';
    arr.forEach((label) => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = label;
      b.addEventListener('click', () => handle(label)); quick.appendChild(b);
    });
  };
  let lastText = '';
  const MAIN_CHIPS = ['What we bake', 'Order a cake', 'Opening times', 'Find us'];

  async function init() {
    try {
      // Live AI only exists when the site is run with server.js (which sets SITE.chatApi). Static hosting = demo mode.
      if (S.chatApi) { const r = await fetch(S.chatApi + '/status', { headers: { Accept: 'application/json' } }); if (r.ok) { const j = await r.json(); live = !!j.live; } }
    } catch (e) { live = false; }
    if (live) { modeTag.textContent = 'AI assistant'; modeTag.classList.add('live'); modeTag.title = 'Answers generated by AI – please confirm prices and bookings with our team'; }
    await say(`Hello and welcome to Baked Boscombe! I can tell you what we bake, how to find us, or take a cake order enquiry for the team.`, 400);
    if (!live) add(`<small>This is an <strong>automated assistant</strong> with set answers. For anything else, call <a href="${S.phoneHref}">${S.phone}</a> and you’ll get one of the team.</small>`);
    chips(MAIN_CHIPS);
  }

  // ---------- scripted knowledge (demo mode + quick replies in both modes) ----------
  const svcList = () => S.services.map((s) => `• <a href="${BASE}services.html#${s.id}">${esc(s.title)}</a> — ${esc(s.short)}`).join('\n');
  const contactHtml = () => `📞 <a href="${S.phoneHref}">${S.phone}</a>` + (S.whatsapp ? `\n💬 <a href="${S.whatsapp}" target="_blank" rel="noopener">WhatsApp us</a>` : '') + (S.email ? `\n✉️ <a href="mailto:${S.email}">${S.email}</a>` : '') + `\n📍 ${esc(S.addressLine)}` + (S.openTo == null ? '' : `\n🕗 ${S.openTo - S.openFrom >= 24 ? 'Open 24 hours, 7 days' : S.hoursLabel}`);
  const hoursHtml = () => S.hours.map(([d, h]) => `${d}: <strong>${h}</strong>`).join('\n');

  const MAP = 'https://www.google.com/maps/search/?api=1&query=Baked%20Boscombe%2C%2043%20Palmerston%20Road%2C%20Bournemouth%20BH1%204HW';
  const FB = 'https://www.facebook.com/bakedboscombe/';
  const intents = [
    { re: /birthday|celebrat|wedding|anniversar|custom|order|cake for|treat box|office|event|party|christening/i, run: () => svc('orders', 'We make birthday and celebration cakes, treat boxes and bigger orders for events and offices. Tell us the date, size and your ideas and we’ll get back to you.').then(() => chips(['Send an order enquiry', 'Contact details'])) },
    { re: /hour|open|close|closing|time|today|sunday|saturday|bank holiday/i, run: () => say(`For today’s opening times, check our <a href="${FB}" target="_blank" rel="noopener">Facebook page</a> or call <a href="${S.phoneHref}">${S.phone}</a>.`).then(() => chips(['Find us', 'What we bake'])) },
    { re: /where|address|direction|find you|location|postcode|palmerston|parking|boscombe/i, run: () => say(`We’re at <strong>43 Palmerston Road, Boscombe, Bournemouth BH1 4HW</strong>.\n<a href="${MAP}" target="_blank" rel="noopener">Open in Google Maps</a>`).then(() => chips(MAIN_CHIPS)) },
    { re: /allerg|gluten|vegan|dairy|nut|coeliac|celiac|egg free|halal/i, run: () => say(`Please ask a member of the team about allergens and dietary options before you order. Our kitchen handles flour, nuts, eggs and dairy. You can also call <a href="${S.phoneHref}">${S.phone}</a>.`).then(() => chips(MAIN_CHIPS)) },
    { re: /hygiene|clean|rating|fsa/i, run: () => say('We have a food hygiene rating of <strong>5 (Very Good)</strong> from the Food Standards Agency.').then(() => chips(MAIN_CHIPS)) },
    { re: /bread|loaf|loaves|sourdough|roll|bap/i, run: () => svc('bread', 'We bake fresh loaves, from crusty white to seeded and wholemeal, plus rolls. Come early for the best choice.') },
    { re: /croissant|pastr|danish|sausage roll|cinnamon|bun/i, run: () => svc('pastries', 'We bake croissants, pastries and savoury bakes, perfect with a coffee.') },
    { re: /cake|brownie|cookie|cupcake|traybake|sweet|treat|dessert/i, run: () => svc('cakes', 'There are cake slices, brownies, traybakes, cookies and cupcakes, with something different most days.') },
    { re: /coffee|latte|cappuccino|flat white|tea|hot chocolate|drink/i, run: () => svc('coffee', 'We serve coffee, tea, hot chocolate and cold drinks, to stay or take away.') },
    { re: /breakfast|brunch|lunch|sandwich|toastie|eat|food|hungry/i, run: () => svc('brunch', 'There’s something tasty to eat in or take away, from breakfast to lunchtime. Ask about today’s specials.') },
    { re: /menu|what do you|sell|bake|have you got|do you have/i, run: () => say(`Here’s what you’ll find:\n${svcList()}`).then(() => chips(['Order a cake', 'Find us'])) },
    { re: /enquir|message|question|get in touch/i, run: startLead },
    { re: /contact|phone|call|number|email|reach|talk|human|person|facebook/i, run: () => say(`You can reach us here:\n📞 <a href="${S.phoneHref}">${S.phone}</a>\n✉️ <a href="mailto:${S.email}">${S.email}</a>\n📍 43 Palmerston Road, Boscombe BH1 4HW\n👍 <a href="${FB}" target="_blank" rel="noopener">Facebook</a>`).then(() => chips(MAIN_CHIPS)) },
    { re: /^(hi|hello|hey|hiya|good (morning|afternoon|evening))\b/i, run: () => say('Hello! Fancy something sweet today?').then(() => chips(MAIN_CHIPS)) },
    { re: /thank|thanks|cheers|ta\b/i, run: () => say('You’re welcome. Hope to see you soon!').then(() => chips(MAIN_CHIPS)) },
  ];
  function svc(id, text) {
    const s = S.services.find((x) => x.id === id);
    return say(`<strong>${esc(s.title)}</strong>\n${text}\n\n<a href="${BASE}services.html#${id}">See more: ${esc(s.title.toLowerCase())}</a>`).then(() => chips(['Order a cake', 'Find us', 'Contact details']));
  }

  // ---------- lead capture ----------
  function startLead() {
    lead = { step: 'name' };
    chips([]);
    return say('Happy to pass that on. First, what’s your <strong>name</strong>?');
  }
  async function leadStep(text) {
    const v = text.trim();
    if (/^(cancel|stop|exit|quit)$/i.test(v)) { lead = null; await say('No problem, I’ve cancelled that. Anything else?'); chips(MAIN_CHIPS); return; }
    if (lead.step === 'name') {
      if (v.length < 2) return say('Could you tell me your name?');
      lead.name = v.slice(0, 80); lead.step = 'email';
      return say(`Thanks, ${esc(lead.name.split(' ')[0])}! What’s the best <strong>email address</strong> for our reply?`);
    }
    if (lead.step === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return say('That doesn’t look like a valid email — could you double-check it?');
      lead.email = v; lead.step = 'phone';
      chips(['Skip']);
      return say('And a <strong>phone number</strong>? (Optional — tap “Skip” if you’d rather not.)');
    }
    if (lead.step === 'phone') {
      if (!/^skip$/i.test(v)) {
        if (!/^[+\d][\d\s()-]{8,16}$/.test(v)) return say('Please enter a valid phone number, or tap “Skip”.');
        lead.phone = v;
      }
      lead.step = 'inquiry'; chips(['Birthday cake', 'Treat box', 'Large order', 'Something else']);
      return say('Lastly, what would you like, and what date do you need it?');
    }
    if (lead.step === 'inquiry') {
      if (v.length < 3) return say('Could you add a few more details?');
      lead.inquiry = v.slice(0, 1500); chips([]);
      const payload = {
        _subject: `New chatbot inquiry from ${lead.name}`,
        source: 'Website chat assistant', name: lead.name, email: lead.email, phone: lead.phone || 'Not provided', message: lead.inquiry,
      };
      const first = esc(lead.name.split(' ')[0]);
      if (!S.formEndpoint) {
        // No business email configured: hand the inquiry over via WhatsApp (needs a tap, so it isn't blocked as a pop-up)
        const link = window.SiteWhatsAppLink(payload);
        await say(`Thanks ${first}! I’ve put your request together. Tap below to send it to us on WhatsApp:\n<a class="btn btn-wa btn-sm" style="margin-top:8px;text-decoration:none" href="${link.url}" target="_blank" rel="noopener">Send on WhatsApp</a>\nNo WhatsApp? <a href="${link.sms}">Send as a text</a> or call <a href="${S.phoneHref}">${S.phone}</a>.`);
      } else {
        const t = typing();
        try {
          await window.SiteSubmit(payload);
          t.remove();
          add(`✅ <strong>Sent!</strong> Thanks ${first}, your request is with us and we’ll reply to <strong>${esc(lead.email)}</strong> shortly.\nNeed us sooner? Call <a href="${S.phoneHref}">${S.phone}</a>.`);
        } catch (e) {
          t.remove();
          const mail = `mailto:${S.email}?subject=${encodeURIComponent('Quote request')}&body=${encodeURIComponent(`Name: ${lead.name}\nEmail: ${lead.email}\nPhone: ${lead.phone || '-'}\n\n${lead.inquiry}`)}`;
          add(`Sorry, I couldn’t send that automatically. Please <a href="${mail}">send it by email</a> (I’ve filled it in for you) or call <a href="${S.phoneHref}">${S.phone}</a>.`);
        }
      }
      lead = null; chips(MAIN_CHIPS);
    }
  }

  // ---------- message handling ----------
  async function handle(text) {
    if (busy || !text.trim()) return;
    busy = true; lastText = text;
    add(esc(text), 'user');
    try {
      if (lead) { await leadStep(text); return; }
      const map = { 'What we bake': 'menu', 'Order a cake': 'enquiry', 'Send an order enquiry': 'enquiry', 'Opening times': 'hours', 'Find us': 'where', 'Contact details': 'contact' };
      const q = map[text] || text;
      const scripted = intents.find((it) => it.re.test(q));
      const isChip = Object.prototype.hasOwnProperty.call(map, text) ;
      if (live && !isChip && !(scripted && scripted.run === startLead)) { await askAI(text); return; }
      if (scripted) { await scripted.run(); return; }
      await say(`I’m only a demo assistant, so I don’t have an answer for that one. We’ll happily help:\n${contactHtml()}\n\nOr I can pass a question on to the team.`);
      chips(MAIN_CHIPS);
    } finally { busy = false; }
  }

  async function askAI(text) {
    history.push({ role: 'user', content: text });
    const t = typing();
    try {
      const r = await fetch(S.chatApi, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history.slice(-12) }) });
      if (!r.ok) throw new Error('status ' + r.status);
      const j = await r.json();
      t.remove();
      const reply = (j.reply || '').trim() || 'Sorry, I didn’t catch that.';
      history.push({ role: 'assistant', content: reply });
      add(linkify(esc(reply)));
      if (/\b(quote|book)/i.test(reply)) chips(['Get a free quote', 'Contact details']); else chips(MAIN_CHIPS);
    } catch (e) {
      t.remove(); history.pop();
      add(`Sorry, I’m having trouble connecting right now. You can reach us on ${contactHtml()}`);
      chips(MAIN_CHIPS);
    }
  }
  function linkify(s) {
    return s
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/(\b[\w.+-]+@[\w-]+\.[\w.]+\b)/g, '<a href="mailto:$1">$1</a>')
      .replace(/(07\d{3}\s?\d{6})/g, (m) => `<a href="${S.phoneHref}">${m}</a>`);
  }

  form.addEventListener('submit', (e) => { e.preventDefault(); const v = input.value; input.value = ''; handle(v); });
})();
