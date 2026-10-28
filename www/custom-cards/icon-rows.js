/* icon-rows: rows with an icon, a title and a small line of text, with a visual editor. */
(() => {
const C = {red:'244,67,54',pink:'233,30,99',purple:'156,39,176',blue:'33,150,243',cyan:'0,188,212',green:'76,175,80',orange:'255,152,0',amber:'255,193,7','deep-orange':'255,87,34','blue-grey':'96,125,139',grey:'158,158,158',disabled:'111,111,111'};
const rgb = c => { c = String(c || ''); if (C[c]) return C[c]; const m = /^#([0-9a-f]{6})$/i.exec(c); if (m) { const n = parseInt(m[1], 16); return [n >> 16, (n >> 8) & 255, n & 255].join(','); } return C.disabled; };
const IC = {'mdi:thermometer':'#ff7043','mdi:water':'#42a5f5','mdi:wifi':'#4db6ac','mdi:download':'#f24d1b','mdi:upload':'#2979ff'};
const rich = (e, v) => { e.textContent = ''; v.split(/(\{mdi:[a-z0-9-]+\})/).forEach(p => { const m = /^\{(mdi:[a-z0-9-]+)\}$/.exec(p); if (m) { const i = document.createElement('ha-icon'); i.setAttribute('icon', m[1]); i.style.cssText = 'display:inline-flex;--mdc-icon-size:15px;vertical-align:middle;margin:0'; if (IC[m[1]]) i.style.color = IC[m[1]]; e.appendChild(i); } else if (p) e.appendChild(document.createTextNode(p)); }); };
const RE = /^\s*\[\[\[([\s\S]*)\]\]\]\s*$/;
class Base extends HTMLElement {
  constructor() {
    super(); this._f = {}; this._d = null; this._sn = null;
    this._s = id => { this._d && this._d.add(id); const o = this._h.states[id]; return o ? o.state : 'unknown'; };
    this._a = (id, n) => { this._d && this._d.add(id); const o = this._h.states[id]; return o ? o.attributes[n] : undefined; };
    this._i = (id, v) => this._s(id) === v;
  }
  getCardSize() { return 1; }
  set hass(h) {
    this._h = h;
    if (this._ok && this._sn && [...this._sn].every(([k, o]) => h.states[k] === o)) return;
    this._u();
  }
  _e(v, x) {
    if (typeof v !== 'string') return v;
    const m = RE.exec(v);
    if (!m) return v;
    let f = this._f[v];
    if (!f) { try { f = new Function('s', 'a', 'is', 'hass', 'entity', m[1]); } catch (e) { console.warn('icon-rows', e); f = () => ''; } this._f[v] = f; }
    try { return f(this._s, this._a, this._i, this._h, x); } catch (e) { return ''; }
  }
  _act(a, ent) {
    if (!a || a.action === 'none') return;
    const id = a.entity || ent, h = this._h;
    if (a.action === 'toggle') h.callService('homeassistant', 'toggle', { entity_id: id });
    else if (a.action === 'more-info') this.dispatchEvent(new CustomEvent('hass-more-info', { detail: { entityId: id }, bubbles: true, composed: true }));
    else if (a.action === 'navigate') { history.pushState(null, '', a.navigation_path); window.dispatchEvent(new CustomEvent('location-changed', { detail: { replace: false } })); }
    else if (a.action === 'call-service' || a.action === 'perform-action') { const [d, s] = (a.perform_action || a.service).split('.'); h.callService(d, s, a.data || a.service_data || {}, a.target); }
  }
  _bind(el, k, ent) {
    let t, held = false, dt = null;
    el.addEventListener('pointerdown', () => { held = false; t = setTimeout(() => { held = true; this._act(k.hold_action, ent); }, 500); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(n => el.addEventListener(n, () => clearTimeout(t)));
    el.addEventListener('click', () => {
      if (held) { held = false; return; }
      const d = k.double_tap_action;
      if (d && d.action !== 'none') {
        if (dt) { clearTimeout(dt); dt = null; this._act(d, ent); }
        else dt = setTimeout(() => { dt = null; this._act(k.tap_action, ent); }, 250);
      } else this._act(k.tap_action, ent);
    });
  }
}
const CSS = `:host{display:block}.r{display:flex;align-items:center;gap:12px;padding:10px 12px;min-height:56px;box-sizing:border-box;cursor:pointer;-webkit-tap-highlight-color:transparent}
.i{width:36px;height:36px;border-radius:50%;flex:none;display:none;align-items:center;justify-content:center;background:rgba(var(--c),.2)}
.i ha-icon{color:rgb(var(--c));--mdc-icon-size:24px;display:flex}
.p{font-size:14px;font-weight:500;color:var(--primary-text-color);line-height:1.3}.q{font-size:12px;color:var(--secondary-text-color);line-height:1.3}`;
class Rows extends Base {
  static async getConfigElement() { return document.createElement('icon-rows-editor'); }
  static getStubConfig() { return { rows: [{ icon: 'mdi:information-outline', color: 'blue', primary: 'Title', secondary: 'Subtitle' }] }; }
  constructor() { super(); this.attachShadow({ mode: 'open' }); }
  setConfig(c) { if (!c) throw new Error('icon-rows: no config'); this._c = c; this._ok = false; this._sn = null; }
  _build() {
    const rows = this._c.rows || [], r = this.shadowRoot;
    r.innerHTML = '<style>' + CSS + '</style>' + rows.map(() => '<div class="r"><div class="i"><ha-icon></ha-icon></div><div><div class="p"></div><div class="q"></div></div></div>').join('');
    r.querySelectorAll('.r').forEach((el, i) => {
      const k = rows[i];
      this._bind(el, { tap_action: k.tap_action || { action: 'more-info' }, hold_action: k.hold_action, double_tap_action: k.double_tap_action }, k.entity);
    });
    this._ok = true;
  }
  _u() {
    if (!this._h || !this._c) return;
    if (!this._ok) this._build();
    this._d = new Set();
    const rows = this._c.rows || [], els = this.shadowRoot.querySelectorAll('.r');
    rows.forEach((k, i) => {
      const el = els[i]; if (k.entity) this._d.add(k.entity);
      const ic = this._e(k.icon), col = rgb(this._e(k.color)), p = String(this._e(k.primary) ?? ''), q = String(this._e(k.secondary) ?? '');
      const b = el.firstChild;
      b.style.display = ic ? 'flex' : 'none'; b.style.setProperty('--c', col);
      if (ic && b.firstChild.getAttribute('icon') !== ic) b.firstChild.setAttribute('icon', ic);
      const tx = el.lastChild;
      if (tx.firstChild.textContent !== p) tx.firstChild.textContent = p;
      tx.firstChild.style.display = p ? '' : 'none';
      if (tx.lastChild._q !== q) { tx.lastChild._q = q; rich(tx.lastChild, q); }
      tx.lastChild.style.display = q ? '' : 'none';
    });
    this._sn = new Map([...this._d].map(k => [k, this._h.states[k]]));
  }
}

/* ---------- visual editors ---------- */
const clone = o => JSON.parse(JSON.stringify(o));
const get = (o, p) => p.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
const put = (o, p, v) => {
  const ks = p.split('.'), last = ks.pop(), chain = [];
  let cur = o;
  for (const k of ks) {
    if (cur[k] == null || typeof cur[k] !== 'object') { if (v === undefined || v === '' || v === null) return; cur[k] = {}; }
    chain.push([cur, k]); cur = cur[k];
  }
  if (v === undefined || v === '' || v === null) delete cur[last]; else cur[last] = v;
  for (let i = chain.length - 1; i >= 0; i--) { const [par, k] = chain[i]; if (!Object.keys(par[k]).length) delete par[k]; else break; }
};
const flat = p => p.replace(/\./g, '__');
const T = { text: {} }, TM = { text: { multiline: true } }, E = { entity: {} };
const A = d => ({ ui_action: d ? { default_action: d } : {} });
const TPL = ' Supports [[[ template ]]].';
const ECSS = `:host{display:block}
details{border:1px solid var(--divider-color);border-radius:8px;margin:8px 0;padding:0 12px}
summary{cursor:pointer;padding:12px 0;font-weight:500;color:var(--primary-text-color)}
.in{padding-bottom:12px}.in details{background:var(--secondary-background-color)}
.bar{display:flex;gap:8px;margin:0 0 8px;flex-wrap:wrap}
button{font:inherit;cursor:pointer;border:1px solid var(--divider-color);background:none;color:var(--primary-text-color);border-radius:16px;padding:6px 14px}
button.d{color:var(--error-color);border-color:var(--error-color)}
ha-form{display:block;margin-top:4px}`;

class EditorBase extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: 'open' }); this._cfg = {}; this._forms = []; this._open = new Set(['main']); }
  set hass(h) { this._h = h; this._forms.forEach(f => { f.hass = h; }); }
  setConfig(c) {
    if (this._emit === JSON.stringify(c || {})) return;
    this._cfg = clone(c || {}); this._render();
  }
  _fire() {
    this._emit = JSON.stringify(this._cfg);
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: clone(this._cfg) }, bubbles: true, composed: true }));
  }
  _render() {
    this._forms = [];
    const r = this.shadowRoot;
    r.innerHTML = '<style>' + ECSS + '</style>';
    this._build(r);
  }
  _form(fields, obj) {
    const f = document.createElement('ha-form');
    const lab = {}, hlp = {};
    fields.forEach(x => { lab[flat(x.p)] = x.l; hlp[flat(x.p)] = x.h || ''; });
    f.schema = fields.map(x => ({ name: flat(x.p), selector: x.s }));
    f.computeLabel = s => lab[s.name] || s.name;
    f.computeHelper = s => hlp[s.name] || '';
    const toData = () => { const d = {}; fields.forEach(x => { const v = get(obj, x.p); if (v !== undefined) d[flat(x.p)] = v; }); return d; };
    f.data = toData();
    f.hass = this._h;
    f.addEventListener('value-changed', e => {
      e.stopPropagation();
      const d = e.detail.value || {};
      fields.forEach(x => {
        const nv = d[flat(x.p)];
        if (JSON.stringify(nv) !== JSON.stringify(get(obj, x.p))) put(obj, x.p, nv);
      });
      f.data = toData();
      this._fire();
    });
    this._forms.push(f);
    return f;
  }
  _sec(id, title) {
    const d = document.createElement('details'), s = document.createElement('summary'), b = document.createElement('div');
    d.open = this._open.has(id); s.textContent = title; b.className = 'in'; d.append(s, b); d._b = b;
    d.addEventListener('toggle', () => { d.open ? this._open.add(id) : this._open.delete(id); });
    return d;
  }
  _btn(text, fn, cls) { const b = document.createElement('button'); b.textContent = text; if (cls) b.className = cls; b.addEventListener('click', fn); return b; }
  _list(id, title, key, fields, blank, label, addText) {
    const sec = this._sec(id, title), items = this._cfg[key] || [];
    items.forEach((it, i) => {
      const d = this._sec(id + i, label(it, i)), bar = document.createElement('div');
      bar.className = 'bar';
      if (i > 0) bar.append(this._btn('Move up', () => this._move(key, i, i - 1)));
      if (i < items.length - 1) bar.append(this._btn('Move down', () => this._move(key, i, i + 1)));
      bar.append(this._btn('Remove', () => { items.splice(i, 1); if (!items.length) delete this._cfg[key]; this._fire(); this._render(); }, 'd'));
      d._b.append(bar, this._form(fields, it));
      sec._b.append(d);
    });
    sec._b.append(this._btn(addText, () => { this._cfg[key] = [...items, clone(blank)]; this._open.add(id + items.length); this._fire(); this._render(); }));
    return sec;
  }
  _move(key, a, b) { const l = this._cfg[key]; [l[a], l[b]] = [l[b], l[a]]; this._fire(); this._render(); }
}

const ROW_FIELDS = [
  { p: 'entity', s: E, l: 'Entity', h: 'Used by tap and hold actions.' },
  { p: 'icon', s: TM, l: 'Icon', h: 'For example mdi:harddisk. Leave empty for no icon.' + TPL },
  { p: 'color', s: TM, l: 'Colour', h: 'Names such as red, green, orange, blue, cyan, purple, or #hex.' + TPL },
  { p: 'primary', s: TM, l: 'Primary text', h: 'Main line.' + TPL },
  { p: 'secondary', s: TM, l: 'Secondary text', h: 'Small line. Use {mdi:download} for small icons.' + TPL },
  { p: 'tap_action', s: A('more-info'), l: 'Tap action' },
  { p: 'hold_action', s: A(), l: 'Hold action' },
  { p: 'double_tap_action', s: A(), l: 'Double tap action' },
];
class RowsEditor extends EditorBase {
  _build(r) {
    const rows = this._list('main', 'Rows (' + (this._cfg.rows || []).length + ')', 'rows', ROW_FIELDS, { primary: 'New row', icon: 'mdi:information-outline' },
      (x, i) => 'Row ' + (i + 1) + (typeof x.primary === 'string' && x.primary.slice(0, 3) !== '[[[' && x.primary ? ': ' + x.primary : x.entity ? ': ' + x.entity : ''), 'Add row');
    r.append(rows);
  }
}

const reg = (n, c) => { if (!customElements.get(n)) customElements.define(n, c); };
reg('icon-rows', Rows); reg('icon-rows-editor', RowsEditor);
window.customCards = window.customCards || [];
if (!window.customCards.some(y => y.type === 'icon-rows')) window.customCards.push({ type: 'icon-rows', name: 'Icon rows', preview: true, description: 'Rows with an icon, a title and a small line of text.' });
})();