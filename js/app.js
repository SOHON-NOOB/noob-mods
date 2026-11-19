const CATS = {
  'addons': { label: 'Addons', one: 'Addon' },
  'texture-packs': { label: 'Texture packs', one: 'Texture pack' },
  'worlds': { label: 'Worlds', one: 'World' },
  'apps': { label: 'Apps', one: 'App' }
};

const data = {};
let current = 'addons';

const listEl = document.getElementById('list');
const searchEl = document.getElementById('search');
const headingEl = document.getElementById('heading');
const countEl = document.getElementById('count');
const tabs = document.querySelectorAll('.tab');

function el(tag, cls) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  return e;
}

function load(cat) {
  return fetch(cat + '/list.json')
    .then(r => (r.ok ? r.json() : []))
    .then(a => (Array.isArray(a) ? a : []))
    .catch(() => []);
}

function makeThumb(item, cat) {
  if (!item.image) return el('div', 'thumb');
  const img = el('img', 'thumb');
  img.loading = 'lazy';
  img.alt = item.name || '';
  img.src = cat + '/' + item.image;
  img.onerror = () => img.replaceWith(el('div', 'thumb'));
  return img;
}

function makeVideo(label, sub, url) {
  const a = el('a', 'v');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener';
  const i1 = el('i', 'ti ti-player-play');
  const vt = el('div', 'vt');
  const b = document.createElement('b');
  b.textContent = label;
  const s = document.createElement('span');
  s.textContent = sub;
  vt.append(b, s);
  const i2 = el('i', 'ti ti-external-link go');
  a.append(i1, vt, i2);
  return a;
}

function makeCard(item, cat, showTag) {
  const fileUrl = item.file ? cat + '/' + item.file : '';
  const card = el('div', 'card');

  const row = el('div', 'row');
  row.appendChild(makeThumb(item, cat));

  const t = el('div', 't');
  if (showTag) {
    const tag = el('div', 'tag');
    tag.textContent = CATS[cat].one;
    t.appendChild(tag);
  }
  const name = document.createElement('b');
  name.textContent = item.name || 'Untitled';
  t.appendChild(name);
  const sub = document.createElement('span');
  sub.textContent = [
    item.version ? 'v' + item.version : '',
    item.mcVersion ? 'Minecraft ' + item.mcVersion : ''
  ].filter(Boolean).join(' • ');
  t.appendChild(sub);
  row.appendChild(t);

  if (fileUrl) {
    const dl = el('a', 'dl');
    dl.href = fileUrl;
    dl.setAttribute('download', '');
    dl.setAttribute('aria-label', 'Download');
    dl.innerHTML = '<i class="ti ti-download"></i>';
    dl.addEventListener('click', e => e.stopPropagation());
    row.appendChild(dl);
  }
  row.addEventListener('click', () => card.classList.toggle('open'));
  card.appendChild(row);

  const detail = el('div', 'detail');
  const meta = el('div', 'meta');
  [
    item.version ? 'v' + item.version : '',
    item.mcVersion ? 'Minecraft ' + item.mcVersion : '',
    item.size || ''
  ].filter(Boolean).forEach(txt => {
    const s = document.createElement('span');
    s.textContent = txt;
    meta.appendChild(s);
  });
  if (meta.children.length) detail.appendChild(meta);

  const vl = el('div', 'vl');
  if (item.shortVideo) vl.appendChild(makeVideo('Short video', 'Quick overview', item.shortVideo));
  if (item.longVideo) vl.appendChild(makeVideo('Long video', 'Full guide, step by step', item.longVideo));
  if (vl.children.length) detail.appendChild(vl);

  if (fileUrl) {
    const big = el('a', 'big');
    big.href = fileUrl;
    big.setAttribute('download', '');
    big.textContent = 'Download';
    detail.appendChild(big);
  }
  card.appendChild(detail);
  return card;
}

function show() {
  const q = searchEl.value.trim().toLowerCase();
  listEl.innerHTML = '';
  let total = 0;

  if (q) {
    tabs.forEach(t => t.classList.remove('active'));
    headingEl.textContent = 'Search results';
    Object.keys(CATS).forEach(cat => {
      (data[cat] || []).forEach(it => {
        if ((it.name || '').toLowerCase().includes(q)) {
          listEl.appendChild(makeCard(it, cat, true));
          total++;
        }
      });
    });
    countEl.textContent = total + ' found';
    if (!total) {
      const p = el('p', 'empty');
      p.textContent = 'Nothing found.';
      listEl.appendChild(p);
    }
  } else {
    tabs.forEach(t => t.classList.toggle('active', t.dataset.cat === current));
    headingEl.textContent = CATS[current].label;
    const items = data[current] || [];
    items.forEach(it => listEl.appendChild(makeCard(it, current, false)));
    total = items.length;
    countEl.textContent = total + (total === 1 ? ' file' : ' files');
    if (!total) {
      const p = el('p', 'empty');
      p.textContent = 'No files yet.';
      listEl.appendChild(p);
    }
  }
}

tabs.forEach(t => {
  t.addEventListener('click', () => {
    current = t.dataset.cat;
    searchEl.value = '';
    show();
  });
});

searchEl.addEventListener('input', show);

Promise.all(
  Object.keys(CATS).map(cat => load(cat).then(items => { data[cat] = items; }))
).then(show);
