/* greeting-card: greeting header with weather chips, with a visual editor. */
(() => {
const C = {red:'244,67,54',pink:'233,30,99',purple:'156,39,176',blue:'33,150,243',cyan:'0,188,212',green:'76,175,80',orange:'255,152,0',amber:'255,193,7','deep-orange':'255,87,34','blue-grey':'96,125,139',grey:'158,158,158',disabled:'111,111,111'};
const rgb = c => { c = String(c || ''); if (C[c]) return C[c]; const m = /^#([0-9a-f]{6})$/i.exec(c); if (m) { const n = parseInt(m[1], 16); return [n >> 16, (n >> 8) & 255, n & 255].join(','); } return C.disabled; };
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
    if (!f) { try { f = new Function('s', 'a', 'is', 'hass', 'entity', m[1]); } catch (e) { console.warn('greeting-card', e); f = () => ''; } this._f[v] = f; }
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
const rand = a => a[Math.floor(Math.random() * a.length)];
const WX = {'clear-night':['weather-night','Clear Night','#7986cb'],sunny:['weather-sunny','Sunny','#ffc107'],partlycloudy:['weather-partly-cloudy','Partly Cloudy','#90a4ae'],cloudy:['weather-cloudy','Cloudy','#90a4ae'],rainy:['weather-rainy','Rainy','#42a5f5'],'lightning-rainy':['weather-lightning-rainy','Thundery Showers','#ffb300'],snowy:['weather-snowy','Snow','#b3e5fc'],'snowy-rainy':['weather-snowy-rainy','Sleet','#81d4fa'],fog:['weather-fog','Foggy','#b0bec5'],windy:['weather-windy','Windy','#80cbc4'],pouring:['weather-pouring','Heavy Rain','#1e88e5'],hail:['weather-hail','Hail','#81d4fa']};
const ADV = {
  rainy:['☔ Grand day for the ducks!','☔ Bring a brolly!','🌧️ Bit damp out!',"💧 It's lashing!"],
  'lightning-rainy':['🌩️ Thunder about—mind yourself.','⚡ Stay inside—thunderstorms!','🌩️ Fierce stormy out!'],
  snowy:["⛄ Rare as hen's teeth—drive safe!",'❄️ Snow! Mind the roads.',"🌨️ White Christmas in January!"],
  'snowy-rainy':["🌨️ Sleet—roads'll be dodgy.",'❄️ Slushy out there.','🌨️ Wintry mix—take it easy.'],
  fog:['🌫️ Fierce foggy—slow down.','🌫️ Can barely see your hand!','🌫️ Pea souper out there.'],
  cloudy:['☁️ Soft day, thank God.','☁️ Bit overcast.','☁️ Grey skies today.']
};
const GCSS = `:host{display:block}.g{padding:4px 4px 8px}.h{font-size:28px;font-weight:600;color:var(--primary-text-color);display:flex;align-items:center;gap:8px;line-height:1.2}
.h ha-icon{--mdc-icon-size:28px;color:#ffc107;display:flex}
.cs{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
.c{display:inline-flex;align-items:center;gap:6px;padding:5px 12px 5px 8px;border-radius:16px;font-size:14px;font-weight:500;color:var(--primary-text-color);background:var(--secondary-background-color)}
.c ha-icon{--mdc-icon-size:20px;display:flex}
.c.w{background:rgba(var(--c),.18)}.c.w ha-icon{color:rgb(var(--c))}.c.m{padding:5px 12px}
`;
class Greeting extends Base {
  static async getConfigElement() { return document.createElement('greeting-card-editor'); }
  static getStubConfig(hass) {
    const w = hass && Object.keys(hass.states).find(e => e.startsWith('weather.'));
    return w ? { weather_entity: w } : {};
  }
  constructor() { super(); this.attachShadow({ mode: 'open' }); }
  setConfig(c) { this._c = c || {}; this._ok = false; this._sn = null; this._key = null; }
  _u() {
    const h = this._h; if (!h) return;
    this._ok = true;
    const c = this._c, wid = c.weather_entity || 'weather.home';
    const o = h.states[wid], at = o ? o.attributes : {};
    this._sn = new Map([[wid, o]]);
    const w = String(o ? o.state : 'unknown').toLowerCase();
    const t = parseFloat(at.temperature), has = !isNaN(t), hour = new Date().getHours();
    let msg;
    if (ADV[w]) msg = rand(ADV[w]);
    else if (w === 'sunny' && hour < 12) msg = rand(['😎 Get out while it lasts!', '☀️ Rare bit of sun!', '🌞 Make hay while the sun shines!']);
    else if (has && t < 2 && hour < 10) msg = rand(['❄️ Frost—scrape the windscreen!', '🧊 Frosty morning!', '❄️ Brass monkeys out there!']);
    else if (has && t < 10) msg = rand(['🧥 Bit nippy—layer up!', '🧣 Chilly one today!', '🥶 Baltic out!']);
    else if (has && t >= 20) msg = rand(['🥵 Roasting! Stay hydrated.', '☀️ Scorcher today!', "🌡️ We're not used to this heat!"]);
    else msg = rand(['😊 Grand stretch in the evenings!', '👌 Not bad at all!', '🙂 Decent day!']);
    const x = WX[w] || ['help-circle-outline', w ? w[0].toUpperCase() + w.slice(1) : 'N/A', '#9e9e9e'];
    const user = c.name !== undefined ? String(this._e(c.name) ?? '') : ((h.user && h.user.name) || '');
    const hello = (c.greeting !== undefined ? String(this._e(c.greeting) ?? '') : 'Dia Duit') + (user ? ', ' + user : '');
    const icon = c.show_icon === false ? '' : (c.icon || 'mdi:hand-wave');
    const showMsg = c.show_message !== false;
    const chip = (ic, tx, col) => '<span class="c"><ha-icon icon="mdi:' + ic + '" style="color:' + col + '"></ha-icon>' + tx + '</span>';
    let cs = '<span class="c w" style="--c:' + rgb(x[2]) + '"><ha-icon icon="mdi:' + x[0] + '"></ha-icon>' + x[1] + '</span>';
    if (has) cs += chip('thermometer', (Number.isInteger(t) ? t.toFixed(1) : t) + '°C', '#ff7043');
    if (at.humidity != null) cs += chip('water-percent', at.humidity + '%', '#42a5f5');
    if (at.wind_speed != null) cs += chip('weather-windy', Math.round(at.wind_speed) + ' ' + (at.wind_speed_unit || 'km/h'), '#4db6ac');
    if (showMsg) cs += '<span class="c m"></span>';
    const html = '<style>' + GCSS + '</style><div class="g"><div class="h"><span></span>' + (icon ? '<ha-icon></ha-icon>' : '') + '</div><div class="cs">' + cs + '</div></div>';
    const r = this.shadowRoot, key = html + hello + icon + (showMsg ? msg : '');
    if (this._key === key) return;
    this._key = key; r.innerHTML = html;
    r.querySelector('.h span').textContent = hello;
    const hi = r.querySelector('.h ha-icon'); if (hi) hi.setAttribute('icon', icon);
    const mm = r.querySelector('.c.m'); if (mm) mm.textContent = msg;
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

const GREETING_FIELDS = [
  { p: 'weather_entity', s: { entity: { domain: 'weather' } }, l: 'Weather entity', h: 'Default is weather.home.' },
  { p: 'greeting', s: TM, l: 'Greeting', h: 'Default is "Dia Duit".' + TPL },
  { p: 'name', s: TM, l: 'Name', h: 'Default is the name of the logged-in user.' + TPL },
  { p: 'icon', s: T, l: 'Icon after the greeting', h: 'Default is mdi:hand-wave.' },
  { p: 'show_icon', s: { boolean: {} }, l: 'Show the icon', h: 'On by default.' },
  { p: 'show_message', s: { boolean: {} }, l: 'Show the weather message', h: 'The funny line at the end. On by default.' },
];
class GreetingEditor extends EditorBase {
  _build(r) {
    const main = this._sec('main', 'Main');
    main._b.append(this._form(GREETING_FIELDS, this._cfg));
    r.append(main);
  }
}
const reg = (n, c) => { if (!customElements.get(n)) customElements.define(n, c); };
reg('greeting-card', Greeting); reg('greeting-card-editor', GreetingEditor);
window.customCards = window.customCards || [];
if (!window.customCards.some(y => y.type === 'greeting-card')) window.customCards.push({ type: 'greeting-card', name: 'Greeting', preview: true, description: 'Greeting with weather.' });
})();