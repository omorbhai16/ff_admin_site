(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const getJSON = async u => { const r = await fetch(u, { cache: 'no-store' }); if (!r.ok) throw new Error(u + ' → ' + r.status); return r.json(); };
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = n => Number(n).toLocaleString('en-US');
const page = document.body.dataset.page;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FALLBACK = 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400"><rect width="640" height="400" fill="#f8f8fa"/><path d="M250 160h140v100H250z" fill="#e9e9ee" stroke="#c7c7d0" stroke-width="4"/><circle cx="285" cy="190" r="10" fill="#c7c7d0"/><path d="m255 245 45-40 28 24 22-18 35 34" fill="none" stroke="#c7c7d0" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><text x="320" y="300" font-family="Arial" font-size="24" font-weight="700" text-anchor="middle" fill="#8b8b96">FF I'D BUY SELL BD</text></svg>`);
const LOGOS = 13;
let cfg = {};

/* broken images → fallback (capture phase because error does not bubble) */
document.addEventListener('error', e => {
  const t = e.target;
  if (t.tagName === 'IMG' && t.dataset.fb !== undefined && t.src !== FALLBACK) t.src = FALLBACK;
}, true);

/* ---------- header / footer ---------- */
async function layout() {
  const [nav, c] = await Promise.all([getJSON('data/navigation.json').catch(() => []), getJSON('data/config.json').catch(() => ({}))]);
  cfg = c;
  const links = nav.map(n => `<a href="${esc(n.href)}"${n.key === page ? ' aria-current="page"' : ''}>${esc(n.label)}</a>`).join('');
  $('#site-header').outerHTML = `<header class="site-header"><div class="wrap bar">
    <a class="brand" href="index.html"><img src="logo/logo_1.jpg" alt="" data-hide><span>FF <b>I'D</b> BUY SELL BD</span></a>
    <button class="burger" aria-label="মেনু খুলুন" aria-expanded="false" aria-controls="nav">☰</button>
    <nav class="nav" id="nav" aria-label="Main">${links}</nav></div></header>`;
  $('#site-footer').outerHTML = `<footer class="site-footer"><div class="wrap fgrid">
    <div><strong>FF I'D BUY SELL BD</strong><p>অ্যাডমিন: JAHID HASSAN</p></div>
    <div><strong>দ্রুত লিংক</strong><div class="fl">${links}</div></div>
    <div><p>FF I'D BUY SELL BD একটি স্বাধীন মার্কেটপ্লেস। এটি Garena-এর অফিসিয়াল ওয়েবসাইট নয়। Free Fire সংশ্লিষ্ট মালিকের ট্রেডমার্ক।</p></div>
    </div><div class="wrap"><small>© <span id="yr"></span> FF I'D BUY SELL BD. All rights reserved.</small></div></footer>`;
  $('#yr').textContent = new Date().getFullYear();
  $$('img[data-hide]').forEach(i => i.addEventListener('error', () => i.remove()));
  const b = $('.burger'), n = $('#nav');
  const set = o => { n.classList.toggle('open', o); b.setAttribute('aria-expanded', o); b.textContent = o ? '✕' : '☰'; };
  b.addEventListener('click', () => set(!n.classList.contains('open')));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && n.classList.contains('open')) { set(false); b.focus(); } });
  n.addEventListener('click', e => { if (e.target.closest('a')) set(false); });
}

/* ---------- falling logos ---------- */
function leaves() {
  if (reduce) return;
  const layer = document.createElement('div');
  layer.className = 'fall'; layer.setAttribute('aria-hidden', 'true');
  document.body.prepend(layer);
  const bad = new Set(); let i = 0;
  setInterval(() => {
    if (document.hidden || layer.children.length > 14 || bad.size >= LOGOS) return;
    while (bad.has(i % LOGOS)) i++;
    const n = i++ % LOGOS, im = new Image();
    im.src = `logo/logo_${n + 1}.jpg`; im.alt = '';
    im.addEventListener('error', () => { bad.add(n); im.remove(); });
    im.addEventListener('animationend', () => im.remove());
    const s = im.style, d = Math.random() < .5 ? -1 : 1;
    s.left = (Math.random() * 92) + 'vw';
    s.setProperty('--t', (9 + Math.random() * 8).toFixed(1) + 's');
    s.setProperty('--x', d * (30 + Math.random() * 70) + 'px');
    s.setProperty('--r', d * (180 + Math.random() * 360) + 'deg');
    layer.append(im);
  }, 1000);
}

/* ---------- account data ---------- */
/* যেকোনো ফরম্যাটের আইডি ডাটা (name/title, likes/like, primeLevel সংখ্যা/লেখা) একই রূপে আনে */
function clean(a) {
  if (!a || typeof a !== 'object') return null;
  const num = (v, d = 0) => Number.isFinite(+v) && v !== '' && v !== null ? +v : d;
  const prime = a.primeLevel ?? a.prime ?? '';
  const primeText = prime === '' ? '—' : (/^\d+$/.test(String(prime).trim()) ? 'Prime ' + String(prime).trim() : String(prime));
  const imgs = Array.isArray(a.images) ? a.images : (typeof a.images === 'string' && a.images ? [a.images] : []);
  return { id: String(a.id ?? '').trim(), name: String(a.name || a.title || 'Free Fire অ্যাকাউন্ট'),
    status: String(a.status || '').trim().toLowerCase() === 'sold' ? 'sold' : 'available',
    price: num(a.price), uid: String(a.uid ?? '—'), level: num(a.level), likes: num(a.likes ?? a.like), primeLevel: primeText,
    images: imgs.filter(x => typeof x === 'string' && x.trim()).map(x => x.trim()), description: String(a.description || ''),
    createdAt: String(a.createdAt || '') };
}
async function loadIds() {
  const data = await getJSON('data/ids.json');
  /* ids.json সরাসরি অ্যারে [ ... ] অথবা { "ids": [ ... ] } — দুটোই চলবে */
  const raw = Array.isArray(data) ? data : (data && Array.isArray(data.ids) ? data.ids : null);
  if (!raw) throw new Error('ids.json অবশ্যই একটি তালিকা (array) হতে হবে');
  return raw.map(clean).filter(Boolean).map((a, i) => (a.id ? a : { ...a, id: 'ID-' + (i + 1) }));
}
const priceText = a => a.price > 0 ? '৳' + fmt(a.price) : 'দাম জানতে যোগাযোগ করুন';
const badge = a => `<span class="badge ${a.status}">${a.status === 'sold' ? 'SOLD · বিক্রি হয়েছে' : 'AVAILABLE · আইডি আছে'}</span>`;
const spec = a => `<dl class="sp"><div><dt>UID</dt><dd>${esc(a.uid)}</dd></div><div><dt>Level</dt><dd>${a.level}</dd></div><div><dt>Likes</dt><dd>${fmt(a.likes)}</dd></div><div><dt>Prime Level</dt><dd>${esc(a.primeLevel)}</dd></div></dl>`;
const card = a => { const im = a.images.length ? a.images : [FALLBACK];
  return `<article class="card reveal ${a.status === 'sold' ? 'is-sold' : ''}">
  <a class="media" href="ids.html#${encodeURIComponent(a.id)}" data-open="${esc(a.id)}" data-imgs="${esc(JSON.stringify(im))}" data-k="0" aria-label="${esc(a.name)} – সব ছবি দেখুন"><img src="${esc(im[0])}" data-fb alt="${esc(a.name)} – account screenshot" loading="lazy">${badge(a)}${im.length > 1 ? `<span class="count">১/${im.length} ছবি</span>` : ''}</a>
  <div class="body"><h3>${esc(a.name)}</h3><p class="price">${priceText(a)}</p>${spec(a)}
  <div class="acts"><a class="btn ghost sm" href="ids.html#${encodeURIComponent(a.id)}" data-open="${esc(a.id)}">বিস্তারিত</a>
  ${a.status === 'sold' ? '<span class="soldlbl">বিক্রি হয়ে গেছে</span>' : `<a class="btn go sm" href="contact.html?id=${encodeURIComponent(a.id)}">যোগাযোগ করুন</a>`}</div></div></article>`; };

/* কার্ডের ছবি প্রতি ৩ সেকেন্ডে নিজে নিজে বদলায় */
const SLIDE_MS = 6000;
function cardSlider() {
  setInterval(() => {
    if (document.hidden) return;
    $$('.card .media[data-imgs]').forEach(m => {
      let list; try { list = JSON.parse(m.dataset.imgs); } catch { return; }
      if (list.length < 2) return;
      const k = ((+m.dataset.k || 0) + 1) % list.length, img = $('img', m), cnt = $('.count', m), nx = new Image();
      m.dataset.k = k;
      const swap = () => { img.style.opacity = 0; setTimeout(() => { img.src = list[k]; img.style.opacity = 1; if (cnt) cnt.textContent = `${k + 1}/${list.length} ছবি`; }, 250); };
      nx.onload = swap; nx.onerror = swap; nx.src = list[k];
    });
  }, SLIDE_MS);
}

function count(el, to) {
  if (reduce) { el.textContent = fmt(to); return; }
  const t0 = performance.now();
  (function f(t) { const p = Math.min((t - t0) / 900, 1); el.textContent = fmt(Math.round(to * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(f); })(t0);
}

/* ---------- home ---------- */
async function home() {
  const host = $('#featured');
  try {
    const ids = await loadIds();
    const av = ids.filter(a => a.status === 'available').length;
    count($('#st-av'), av); count($('#st-sold'), ids.length - av); count($('#st-total'), ids.length);
    const rec = [...ids].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 3);
    host.innerHTML = rec.length ? rec.map(card).join('') : '<p class="empty">এখনো কোনো আইডি যোগ করা হয়নি।</p>';
  } catch (e) { console.error(e); host.innerHTML = '<p class="empty">ডেটা লোড করা যায়নি। ১) সাইটটি local server/hosting দিয়ে চালান, ২) data/ids.json-এ কমা/ব্র্যাকেটের ভুল আছে কিনা দেখুন। (বিস্তারিত: ব্রাউজার Console) — README দেখুন।</p>'; $$('.stat .n').forEach(n => n.textContent = '—'); }
}

/* ---------- marketplace ---------- */
async function marketplace() {
  const grid = $('#grid'), dlg = $('#dlg'), st = { status: 'all', q: '', sort: 'new', level: 0, prime: '' };
  let ids = [];
  try { ids = await loadIds(); } catch (e) { console.error(e); grid.innerHTML = '<p class="empty">ডেটা লোড করা যায়নি। ১) সাইটটি local server/hosting দিয়ে চালান, ২) data/ids.json-এ কমা/ব্র্যাকেটের ভুল আছে কিনা দেখুন। (বিস্তারিত: ব্রাউজার Console) — README দেখুন।</p>'; return; }
  [...new Set(ids.map(a => a.primeLevel))].sort().forEach(p => $('#f-prime').insertAdjacentHTML('beforeend', `<option>${esc(p)}</option>`));
  const render = () => {
    const q = st.q.trim().toLowerCase();
    let L = ids.filter(a => (st.status === 'all' || a.status === st.status) && (!q || a.uid.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)) && a.level >= st.level && (!st.prime || a.primeLevel === st.prime));
    L.sort((a, b) => st.sort === 'lo' ? a.price - b.price : st.sort === 'hi' ? b.price - a.price : b.createdAt.localeCompare(a.createdAt));
    $('#count').textContent = `${L.length} টি আইডি পাওয়া গেছে`;
    grid.innerHTML = L.map(card).join(''); $('#empty').hidden = L.length > 0;
  };
  $$('#seg button').forEach(b => b.addEventListener('click', () => { st.status = b.dataset.s; $$('#seg button').forEach(x => x.setAttribute('aria-pressed', x === b)); render(); }));
  $('#f-q').addEventListener('input', e => { st.q = e.target.value; render(); });
  $('#f-sort').addEventListener('change', e => { st.sort = e.target.value; render(); });
  $('#f-level').addEventListener('change', e => { st.level = +e.target.value; render(); });
  $('#f-prime').addEventListener('change', e => { st.prime = e.target.value; render(); });
  $('#reset').addEventListener('click', () => { Object.assign(st, { status: 'all', q: '', sort: 'new', level: 0, prime: '' }); $('#f-q').value = ''; $('#f-sort').value = 'new'; $('#f-level').value = 0; $('#f-prime').value = ''; $$('#seg button').forEach(x => x.setAttribute('aria-pressed', x.dataset.s === 'all')); render(); });

  let cur = null, k = 0;
  const show = () => {
    const a = cur, imgs = a.images.length ? a.images : [FALLBACK];
    $('#dlg-body').innerHTML = `<div class="gal"><div class="media"><img src="${esc(imgs[k])}" data-fb alt="${esc(a.name)} – ছবি ${k + 1}">${badge(a)}${imgs.length > 1 ? `<span class="count">${k + 1}/${imgs.length} ছবি</span>` : ''}
      ${imgs.length > 1 ? '<button class="nv p" aria-label="আগের ছবি">‹</button><button class="nv n" aria-label="পরের ছবি">›</button>' : ''}</div>
      ${imgs.length > 1 ? `<div class="thumbs">${imgs.map((s, i) => `<button data-i="${i}" aria-label="ছবি ${i + 1}"${i === k ? ' aria-current="true"' : ''}><img src="${esc(s)}" data-fb alt="" loading="lazy"></button>`).join('')}</div>` : ''}</div>
      <div><button class="x" aria-label="বন্ধ করুন">✕</button><h2 id="dlg-t">${esc(a.name)}</h2><p class="price">${priceText(a)}</p>${spec(a)}
      <p>${esc(a.description) || 'কোনো বিবরণ নেই।'}</p><p><small>ID: ${esc(a.id)}${a.createdAt ? ' · ' + esc(a.createdAt) : ''}</small></p>
      ${a.status === 'sold' ? '<p class="soldlbl">বিক্রি হয়ে গেছে</p>' : `<a class="btn go" href="contact.html?id=${encodeURIComponent(a.id)}">কেনার জন্য যোগাযোগ করুন</a>`}</div>`;
  };
  let timer = null;
  const play = () => { clearInterval(timer); if (cur && cur.images.length > 1) timer = setInterval(() => { if (dlg.open) step(1); }, SLIDE_MS); };
  const open = id => { const a = ids.find(x => x.id === id); if (!a) return; cur = a; k = 0; show(); if (!dlg.open) dlg.showModal(); play(); };
  const step = d => { const n = Math.max(cur.images.length, 1); k = (k + d + n) % n; show(); const t = $('.thumbs [aria-current]'); if (t) t.parentElement.scrollLeft = t.offsetLeft - t.parentElement.clientWidth / 2 + t.offsetWidth / 2; };
  dlg.addEventListener('click', e => {
    const t = e.target;
    if (t === dlg || t.closest('.x')) dlg.close();
    else if (t.closest('.nv.p')) { step(-1); play(); } else if (t.closest('.nv.n')) { step(1); play(); }
    else if (t.closest('[data-i]')) { k = +t.closest('[data-i]').dataset.i; show(); play(); }
  });
  dlg.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') { step(-1); play(); } if (e.key === 'ArrowRight') { step(1); play(); } });
  dlg.addEventListener('close', () => { clearInterval(timer); history.replaceState(null, '', location.pathname); });
  grid.addEventListener('click', e => { const a = e.target.closest('[data-open]'); if (a) { e.preventDefault(); open(a.dataset.open); } });
  render();
  const h = decodeURIComponent(location.hash.slice(1)); if (h) open(h);
}

/* ---------- reviews ---------- */
async function reviews() {
  const host = $('#reviews');
  try {
    const L = (await getJSON('data/reviews.json')).filter(r => r && r.name && r.text);
    if (!L.length) { $('#rv-empty').hidden = false; return; }
    host.innerHTML = L.map(r => { const n = Math.max(0, Math.min(5, Math.round(+r.rating || 0)));
      return `<article class="card reveal"><div class="body"><span class="stars" role="img" aria-label="${n} out of 5">${'★'.repeat(n)}<span class="o">${'★'.repeat(5 - n)}</span></span>
      <p>${esc(r.text)}</p><strong>${esc(r.name)}</strong><small>${esc(r.date || '')}</small></div></article>`; }).join('');
  } catch (e) { console.error(e); $('#rv-empty').hidden = false; }
}

/* ---------- contact ---------- */
const SOCIAL = {
  facebook: {
    color: '#0866ff',
    icon: '<svg viewBox="0 0 320 512" role="img" aria-label="Facebook" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06H297V6.26S260.43 0 225.36 0C152.77 0 105.06 44.38 105.06 124.72v70.62H24V288h81.06v224h99.2V288z"/></svg>'
  },
  telegram: {
    color: '#229ed9',
    icon: '<svg viewBox="0 0 24 24" role="img" aria-label="Telegram" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M23.91 4.79 20.3 21.83c-.27 1.2-.98 1.5-1.98.94l-5.47-4.03-2.64 2.54c-.29.29-.54.54-1.1.54l.39-5.57L19.64 7.9c.43-.39-.09-.61-.66-.22L6.82 15.36l-5.4-1.69c-1.17-.37-1.2-1.17.24-1.74L22.8 3.47c1.01-.37 1.9.25 1.11 1.32Z"/></svg>'
  },
  whatsapp: {
    color: '#25d366',
    icon: '<svg viewBox="0 0 448 512" role="img" aria-label="WhatsApp" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M380.9 97.1A222.1 222.1 0 0 0 224.1 32C101.6 32 1.9 131.7 1.9 254.2c0 39.2 10.3 77.5 29.9 111.2L0 480l117.4-30.8a222.7 222.7 0 0 0 106.6 27.1h.1c122.4 0 222.1-99.7 222.1-222.1 0-59.4-23.1-115.2-65.3-157.1ZM224.1 438.7a184.5 184.5 0 0 1-94-25.7l-6.7-4-69.7 18.3 18.6-68-4.4-7A183.1 183.1 0 0 1 39.7 254c0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.7 19.2 130.5 54.1a183.2 183.2 0 0 1 54 130.6c0 101.8-82.8 184.5-184.7 184.5Zm101.3-138.2c-5.5-2.8-32.7-16.1-37.8-17.9-5-1.9-8.7-2.8-12.4 2.8-3.7 5.5-14.2 17.9-17.4 21.6-3.2 3.7-6.4 4.2-11.9 1.4-5.5-2.8-23.3-8.6-44.4-27.5-16.4-14.6-27.5-32.7-30.7-38.2-3.2-5.5-.3-8.5 2.4-11.2 2.5-2.5 5.5-6.4 8.3-9.6 2.8-3.2 3.7-5.5 5.5-9.2 1.8-3.7.9-6.9-.5-9.6-1.4-2.8-12.4-29.9-17-40.9-4.5-10.7-9.1-9.2-12.4-9.4l-10.6-.2c-3.7 0-9.6 1.4-14.7 6.9-5 5.5-19.2 18.8-19.2 45.9s19.7 53.2 22.4 56.9c2.8 3.7 38.7 59.1 93.8 82.9 13.1 5.7 23.3 9.1 31.2 11.6 13.1 4.2 25 3.6 34.4 2.2 10.5-1.6 32.7-13.3 37.3-26.2 4.6-12.8 4.6-23.8 3.2-26.2-1.4-2.3-5.1-3.7-10.6-6.4Z"/></svg>'
  }
};
function contact() {
  const host = $('#contacts');
  host.innerHTML = (cfg.contacts || []).map(c => {
    const icon = SOCIAL[c.key];
    if (!icon || !c.url) return '';
    return `<a class="cc" href="${esc(c.url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(c.label)}: ${esc(c.value)}">
      <span class="ic" style="--social:${icon.color}" aria-hidden="true">${icon.icon}</span>
      <span class="contact-copy"><strong>${esc(c.label)}</strong><small>${esc(c.value)}</small></span>
    </a>`;
  }).join('');
}
/* ---------- live visitors counter ---------- */
function liveNow() {
  const el = document.createElement('div');
  el.className = 'live';
  el.setAttribute('role', 'status');
  el.innerHTML = '<span class="dot" aria-hidden="true"></span><span class="num" id="live-n"></span><span class="lbl">জন দেখছেন</span>';
  document.body.appendChild(el);
  const n = $('#live-n');
  let cur = 5 + Math.floor(Math.random() * 16);
  n.textContent = cur;
  setInterval(() => {
    let next = cur;
    while (next === cur) {
      const step = 1 + Math.floor(Math.random() * 3);
      next = Math.min(20, Math.max(5, cur + (Math.random() < .5 ? -step : step)));
    }
    cur = next;
    n.textContent = cur;
  }, 5000);
}
(async () => {
  await layout(); leaves(); cardSlider(); liveNow();
  ({ home, ids: marketplace, review: reviews, contact })[page]?.();
})();
})();
