/* room-tile: one fast card for the room-style tiles. Everything is worked out in the browser. */
(() => {
const C = {red:'244,67,54',pink:'233,30,99',purple:'156,39,176','deep-purple':'103,58,183',indigo:'63,81,181',blue:'33,150,243','light-blue':'3,169,244',cyan:'0,188,212',teal:'0,150,136',green:'76,175,80','light-green':'139,195,74',lime:'205,220,57',yellow:'255,235,59',amber:'255,193,7',orange:'255,152,0','deep-orange':'255,87,34',brown:'121,85,72',grey:'158,158,158','blue-grey':'96,125,139',black:'0,0,0',white:'255,255,255',disabled:'111,111,111'};
const rgb = c => {
  if (!c) return C.disabled;
  c = String(c);
  if (C[c]) return C[c];
  if (/^\d+\s*,\s*\d+\s*,\s*\d+$/.test(c)) return c;
  let m = /^#([0-9a-f]{6})$/i.exec(c);
  if (m) { const n = parseInt(m[1], 16); return [n >> 16, (n >> 8) & 255, n & 255].join(','); }
  m = /^rgba?\(([^)]+)\)/.exec(c);
  return m ? m[1].split(',').slice(0, 3).join(',') : C.disabled;
};
const rel = t => {
  const d = Math.max(0, (Date.now() - new Date(t)) / 1000);
  const u = d < 60 ? [d, 'second'] : d < 3600 ? [d / 60, 'minute'] : d < 86400 ? [d / 3600, 'hour'] : [d / 86400, 'day'];
  const n = Math.floor(u[0]);
  return n + ' ' + u[1] + (n === 1 ? '' : 's');
};
const dur = s => { const p = String(s || '').split(':').map(Number); return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : 0; };
const auto = o => {
  if (!o || ['off', 'unavailable', 'unknown'].includes(o.state)) return 'disabled';
  if (o.entity_id.startsWith('light.')) return o.attributes.rgb_color ? 'rgb(' + o.attributes.rgb_color + ')' : '255,190,137';
  return o.state === 'on' ? 'orange' : 'disabled';
};
const IC = {'mdi:thermometer':'#ff7043','mdi:water':'#42a5f5','mdi:wifi':'#4db6ac','mdi:download':'#f24d1b','mdi:upload':'#2979ff'};
const rich = (e, v) => { e.textContent = ''; v.split(/(\{mdi:[a-z0-9-]+\})/).forEach(p => { const m = /^\{(mdi:[a-z0-9-]+)\}$/.exec(p); if (m) { const i = document.createElement('ha-icon'); i.setAttribute('icon', m[1]); if (IC[m[1]]) i.style.color = IC[m[1]]; e.appendChild(i); } else if (p) e.appendChild(document.createTextNode(p)); }); };
const set = (el, k, v, fn) => { const c = el._c || (el._c = {}); if (c[k] !== v) { c[k] = v; fn(el, v); } };
const RE = /^\s*\[\[\[([\s\S]*)\]\]\]\s*$/;
const WASH = 'polygon(0 0,0 100%,35% 100%,36% 74%,31% 43%,61% 40%,71% 69%,62% 78%,36% 73%,35% 100%,100% 100%,100% 0)';
const CSS = `
:host{display:block}
ha-card{position:relative;height:200px;overflow:hidden;box-sizing:border-box;border:2px dashed var(--ha-card-border-color,var(--divider-color));--ts:21px;--st:72px;--sl:-28px;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent}
.t{position:absolute;left:14px;top:16px;font-size:var(--ts);font-weight:500;line-height:1.2;color:var(--primary-text-color);white-space:nowrap}
.u{position:absolute;left:14px;top:calc(20px + var(--ts)*1.2 + var(--so,-3px));font-size:var(--us,14px);line-height:18px;color:var(--primary-text-color);white-space:nowrap}
.u ha-icon{display:inline-flex;--mdc-icon-size:calc(var(--us,14px)*1.25);vertical-align:middle;margin:0;color:var(--secondary-text-color)}
.bar{position:absolute;left:14px;top:52px;width:62%;height:14px;border-radius:10px;background:rgba(var(--bc),.2);overflow:hidden;display:none}
.bar i{display:block;height:100%;background:rgb(var(--bc));border-radius:10px;transition:width 1s linear}
.sh{position:absolute;left:var(--sl);top:var(--st);width:160px;height:160px;border-radius:50%;background:rgba(var(--c),.2);display:flex;align-items:center;justify-content:center}
.sh ha-icon{--mdc-icon-size:110px;color:rgb(var(--c));display:flex}
.sh img,.b img{display:none;width:100%;height:100%;object-fit:cover;border-radius:50%}
.mb{position:absolute;display:none;width:30px;height:30px;border-radius:50%;align-items:center;justify-content:center;color:#000;font-size:18px;font-weight:bolder}
.x{position:absolute;left:calc(40% + 12px)}
.x b{display:block;font-size:20px;font-weight:500;color:var(--primary-text-color)}
.x span{display:block;font-size:13px;color:var(--secondary-text-color)}
.b{position:absolute;width:var(--z);height:var(--z);cursor:pointer;perspective:900px}
.b .s{width:100%;height:100%;border-radius:50%;background:rgba(var(--c),.2);display:flex;align-items:center;justify-content:center;transform-origin:center bottom}
.b:active .s{transform:rotateX(25deg)}
.b ha-icon{--mdc-icon-size:calc(var(--z)*.667);color:rgb(var(--c));display:flex}
.b.pic .s{background:none}
.b img{object-fit:contain;border-radius:0}
.bb{position:absolute;right:-2px;top:-2px;width:16px;height:16px;border-radius:50%;display:none;align-items:center;justify-content:center;background:rgb(var(--bc))}
.bb ha-icon{--mdc-icon-size:12px;color:#fff;display:flex}
.a-washing{animation:shake-washing .4s ease-in-out infinite,drum-washing 2s ease infinite;transform-origin:50% 110%}
.a-spinning{animation:spin 2s linear infinite}
.a-rinsing{animation:bounce 1.5s ease-in-out infinite,wash 1s ease-in-out infinite;transform-origin:50% 75%}
.a-drying{animation:shake-drying .4s ease-in-out infinite,wash 1s infinite;transform-origin:50% 65%}
.a-cleaning{animation:clean-pattern 10s ease-in-out infinite;transform-origin:50% 65%}
.a-returning{animation:navigate 5s ease-in-out infinite;transform-origin:50% 60%}
.a-paused{animation:pulse-slow 3s ease-in-out infinite}
.a-charging{animation:charging 4s ease-in-out infinite}
.a-charged{animation:charged .6s ease-out 3 forwards}
.a-fire{animation:fire 1.5s infinite;transform-origin:50% 85%}
.a-boil{animation:boil .6s infinite}
.a-pulse{animation:pulse 2s ease-in-out infinite}
.p-ping{animation:ping 2s infinite}
@keyframes shake-washing{0%,100%{transform:translate(0,0) rotate(0)}20%{transform:translate(.4px,-.4px) rotate(-4deg)}40%{transform:translate(-.4px,.4px) rotate(4deg)}60%{transform:translate(.4px,.4px) rotate(-4deg)}80%{transform:translate(-.4px,-.4px) rotate(4deg)}}
@keyframes drum-washing{50%{clip-path:${WASH}}}
@keyframes wash{50%{clip-path:${WASH}}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes bounce{0%,20%,50%,80%,100%{transform:translateY(0)}40%{transform:translateY(-1.2px) rotate(5deg)}60%{transform:translateY(-1.1px) rotate(-4deg)}}
@keyframes shake-drying{0%,100%{transform:rotate(4deg)}50%{transform:rotate(-4deg)}}
@keyframes clean-pattern{0%{transform:rotate(0) translateY(0)}10%{transform:rotate(40deg) translateY(0)}25%{transform:rotate(40deg) translateY(-8px)}35%{transform:rotate(40deg) translateY(0)}50%{transform:rotate(0) translateY(0)}60%{transform:rotate(-40deg) translateY(0)}75%{transform:rotate(-40deg) translateY(-8px)}85%{transform:rotate(-40deg) translateY(0)}100%{transform:rotate(0) translateY(0)}}
@keyframes navigate{0%,100%{transform:rotate(-20deg)}50%{transform:rotate(20deg)}}
@keyframes pulse-slow{0%,100%{opacity:1}50%{opacity:.45}}
@keyframes charging{0%,100%{opacity:.55;transform:scale(1)}50%{opacity:.85;transform:scale(1.04)}}
@keyframes charged{0%{transform:scale(1);opacity:1}40%{transform:scale(1.12);opacity:1}60%{transform:scale(.95);opacity:.9}100%{transform:scale(1);opacity:1}}
@keyframes fire{0%{transform:rotate(1deg) scaleY(1.1);color:#f44336;opacity:.8}10%{transform:rotate(-1.5deg) scaleY(.95);color:#f44336;opacity:.9}20%{transform:rotate(1.8deg) scaleY(1.15);color:#ff5722;opacity:.75}35%{transform:rotate(-1deg) scaleY(1);color:#ff5722;opacity:.95}50%{transform:rotate(1.2deg) scaleY(1.2);color:#f44336;opacity:.7}65%{transform:rotate(-1.8deg) scaleY(.9);color:#ff5722;opacity:.9}80%{transform:rotate(1.5deg) scaleY(1.1);color:#f44336;opacity:.8}100%{transform:rotate(1deg) scaleY(1.1);color:#f44336;opacity:.8}}
@keyframes boil{0%,100%{transform:translate(1px,-1px) rotate(8deg)}20%{transform:translate(-1.5px,1px) rotate(-10deg)}40%{transform:translate(1.5px,1.5px) rotate(12deg)}60%{transform:translate(-1px,-1.5px) rotate(-6deg)}80%{transform:translate(1px,1px) rotate(9deg)}}
@keyframes pulse{0%{opacity:1}50%{opacity:.2}100%{opacity:1}}
@keyframes ping{0%{box-shadow:0 0 0 0 rgba(244,67,54,1)}100%{box-shadow:0 0 5px 15px transparent}}
`;

class RoomTile extends HTMLElement {
  static async getConfigElement() { return document.createElement('room-tile-editor'); }
  static getStubConfig(hass) {
    const light = hass && Object.keys(hass.states).find(e => e.startsWith('light.'));
    return {
      name: 'Living Room', secondary: 'Room details', icon: 'mdi:sofa', color: 'amber',
      buttons: light ? [{ entity: light, icon: 'mdi:lightbulb' }] : [],
    };
  }
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._f = {}; this._n = 0;
    this._s = id => { this._d && this._d.add(id); const o = this._h.states[id]; return o ? o.state : 'unknown'; };
    this._a = (id, n) => { this._d && this._d.add(id); const o = this._h.states[id]; return o ? o.attributes[n] : undefined; };
    this._i = (id, v) => this._s(id) === v;
    this._o = id => { this._d && this._d.add(id); return this._h.states[id]; };
  }
  setConfig(c) { if (!c) throw new Error('room-tile: no config'); this._c = c; this._b = false; this._sn = null; }
  getCardSize() { return 4; }
  getGridOptions() { return { columns: 6, rows: 'auto' }; }
  connectedCallback() {
    this._tm = setInterval(() => {
      if (!this._h || !this._c) return;
      if (this._anim || (this._c.refresh && ++this._n % this._c.refresh === 0)) this._u();
    }, 1000);
  }
  disconnectedCallback() { clearInterval(this._tm); }
  set hass(h) {
    this._h = h;
    if (this._b && this._sn && [...this._sn].every(([k, o]) => h.states[k] === o)) return;
    this._u();
  }
  _e(v, x) {
    if (typeof v !== 'string') return v;
    const m = RE.exec(v);
    if (!m) return v;
    let f = this._f[v];
    if (!f) {
      try { f = new Function('s', 'a', 'is', 'rel', 'o', 'hass', 'entity', m[1]); } catch (e) { console.warn('room-tile', e); f = () => ''; }
      this._f[v] = f;
    }
    try { return f(this._s, this._a, this._i, rel, this._o, this._h, x); } catch (e) { return ''; }
  }
  _act(a, ent) {
    if (!a || a.action === 'none') return;
    const id = a.entity || ent, h = this._h;
    if (a.action === 'toggle') h.callService('homeassistant', 'toggle', { entity_id: id });
    else if (a.action === 'more-info') this.dispatchEvent(new CustomEvent('hass-more-info', { detail: { entityId: id }, bubbles: true, composed: true }));
    else if (a.action === 'navigate') { history.pushState(null, '', a.navigation_path); window.dispatchEvent(new CustomEvent('location-changed', { detail: { replace: false } })); }
    else if (a.action === 'call-service' || a.action === 'perform-action') {
      const [d, s] = (a.perform_action || a.service).split('.');
      h.callService(d, s, a.data || a.service_data || {}, a.target);
    }
  }
  _bind(el, k, ent) {
    let t, held = false, dt = null;
    el.addEventListener('pointerdown', () => { held = false; t = setTimeout(() => { held = true; this._act(k.hold_action, ent); }, 500); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(n => el.addEventListener(n, () => clearTimeout(t)));
    el.addEventListener('contextmenu', e => e.preventDefault());
    el.addEventListener('click', e => {
      e.stopPropagation();
      if (held) { held = false; return; }
      const d = k.double_tap_action;
      if (d && d.action !== 'none') {
        if (dt) { clearTimeout(dt); dt = null; this._act(d, ent); }
        else dt = setTimeout(() => { dt = null; this._act(k.tap_action, ent); }, 250);
      } else this._act(k.tap_action, ent);
    });
  }
  _build() {
    const c = this._c, r = this.shadowRoot, bs = c.buttons || [], xs = c.extras || [];
    r.innerHTML = '<style>' + CSS + '</style><ha-card><div class="t"></div><div class="u"></div><div class="bar"><i></i></div><div class="sh"><ha-icon></ha-icon><img></div><div class="mb"></div>'
      + xs.map(() => '<div class="x"><b></b><span></span></div>').join('')
      + bs.map(() => '<div class="b"><div class="s"><ha-icon></ha-icon><img></div><div class="bb"><ha-icon></ha-icon></div></div>').join('') + '</ha-card>';
    const card = r.querySelector('ha-card');
    card.style.setProperty('--ts', (c.title_size || 21) + 'px');
    if (c.secondary_size) card.style.setProperty('--us', c.secondary_size + 'px');
    if (c.secondary_offset !== undefined) card.style.setProperty('--so', c.secondary_offset + 'px');
    if (c.shape_top !== undefined) card.style.setProperty('--st', c.shape_top + 'px');
    if (c.shape_left !== undefined) card.style.setProperty('--sl', c.shape_left + 'px');
    let y = 8;
    r.querySelectorAll('.b').forEach((el, i) => {
      const b = bs[i], z = b.size || (bs.length > 3 ? 36 : 45);
      el.style.cssText = 'top:' + (b.top !== undefined ? b.top : y) + 'px;right:22px;--z:' + z + 'px';
      y += z + (bs.length > 3 ? 14 : 20);
      if (b.picture !== undefined) el.classList.add('pic');
      this._bind(el, { tap_action: b.tap_action || { action: 'toggle' }, hold_action: b.hold_action || { action: 'more-info' }, double_tap_action: b.double_tap_action }, b.entity);
    });
    r.querySelectorAll('.x').forEach((el, i) => { el.style.top = (xs[i].top !== undefined ? xs[i].top : 64 + i * 54) + 'px'; });
    if (c.badge) { const m = r.querySelector('.mb'); m.style.left = (c.badge.left !== undefined ? c.badge.left : 70) + 'px'; m.style.top = (c.badge.top !== undefined ? c.badge.top : 43) + 'px'; }
    this._bind(card, c, c.entity);
    if (c.tap_action && c.tap_action.action !== 'none') card.style.cursor = 'pointer';
    this._b = true;
  }
  _u() {
    const c = this._c, h = this._h;
    if (!c || !h) return;
    if (!this._b) this._build();
    const r = this.shadowRoot, q = s => r.querySelector(s), E = (v, x) => this._e(v, x);
    this._d = new Set();
    // title and text
    set(q('.t'), 't', String(E(c.name) ?? ''), (e, v) => { e.textContent = v; });
    set(q('.u'), 't', String(E(c.secondary) ?? ''), rich);
    // big icon or picture
    const col = rgb(E(c.color)), pic = E(c.picture), ic = E(c.icon);
    set(q('.sh'), 'c', col, (e, v) => e.style.setProperty('--c', v));
    const hi = q('.sh ha-icon'), im = q('.sh img');
    set(hi, 'i', (ic || '') + '|' + !!pic, (e) => { if (ic) e.setAttribute('icon', ic); e.style.display = (ic && !pic) ? 'flex' : 'none'; });
    set(im, 'p', (pic || '') + '|' + (c.picture_style || ''), (e) => { q('.sh').style.background = pic ? 'none' : ''; e.style.cssText = c.picture_style || ''; if (pic) { e.src = pic; e.style.display = 'block'; } else e.style.display = 'none'; });
    set(hi, 'a', E(c.animation) || '', (e, v) => { e.className = v ? 'a-' + v : ''; });
    // timer bar
    let tm = null;
    if (c.timer) {
      this._d.add(c.timer.entity);
      const o = h.states[c.timer.entity];
      if (o && o.state === 'active') {
        const d = dur(o.attributes.duration), left = Math.max(0, (Date.parse(o.attributes.finishes_at) - Date.now()) / 1000);
        tm = d ? Math.min(1, left / d) : 0;
      }
    }
    this._anim = tm !== null;
    const bar = q('.bar');
    set(bar, 'h', tm !== null, (e, v) => { e.style.display = v ? 'block' : 'none'; q('.u').style.display = v ? 'none' : ''; });
    if (tm !== null) { bar.style.setProperty('--bc', rgb(c.timer.color || 'red')); bar.firstChild.style.width = (tm * 100) + '%'; }
    // badge on the big icon
    if (c.badge) {
      const t = E(c.badge.text), m = q('.mb');
      set(m, 't', t == null ? '' : String(t), (e, v) => { e.textContent = v; e.style.display = v ? 'flex' : 'none'; });
      set(m, 'c', rgb(E(c.badge.color)), (e, v) => { e.style.background = 'rgb(' + v + ')'; });
    }
    // text blocks on the right
    const xs = r.querySelectorAll('.x');
    (c.extras || []).forEach((x, i) => {
      const el = xs[i];
      if (x.entity) this._d.add(x.entity);
      const show = E(x.show) !== false;
      set(el, 'h', show, (e, v) => { e.style.display = v ? '' : 'none'; });
      if (show) {
        set(el.firstChild, 't', String(x.value !== undefined ? E(x.value) : (x.entity ? this._s(x.entity) : '')), (e, v) => { e.textContent = v; });
        set(el.lastChild, 't', String(E(x.label) ?? ''), (e, v) => { e.textContent = v; });
      }
    });
    // round buttons
    const els = r.querySelectorAll('.b');
    (c.buttons || []).forEach((b, i) => {
      const el = els[i], o = b.entity ? h.states[b.entity] : undefined;
      if (b.entity) this._d.add(b.entity);
      const s = el.firstChild, bi = s.querySelector('ha-icon'), bm = s.querySelector('img');
      const bc = rgb(b.color !== undefined ? E(b.color, o) : auto(o)), bic = E(b.icon, o), bpic = E(b.picture, o);
      set(s, 'c', bc, (e, v) => e.style.setProperty('--c', v));
      set(bi, 'i', (bic || '') + '|' + !!bpic, (e) => { if (bic) e.setAttribute('icon', bic); e.style.display = (bic && !bpic) ? 'flex' : 'none'; });
      set(bm, 'p', (bpic || '') + '|' + (b.picture_style || ''), (e) => { e.style.cssText = b.picture_style || ''; if (bpic) { e.src = bpic; e.style.display = 'block'; } else e.style.display = 'none'; });
      set(bi, 'a', E(b.animation, o) || '', (e, v) => { e.className = v ? 'a-' + v : ''; });
      set(s, 'p', E(b.shape_animation, o) || '', (e, v) => { e.className = 's' + (v ? ' p-' + v : ''); });
      const bb = el.lastChild, bgi = b.badge ? E(b.badge.icon, o) : '';
      set(bb, 'i', bgi || '', (e, v) => { e.style.display = v ? 'flex' : 'none'; if (v) e.firstChild.setAttribute('icon', v); });
      set(bb, 'c', rgb(b.badge ? E(b.badge.color, o) : ''), (e, v) => e.style.setProperty('--bc', v));
    });
    this._sn = new Map([...this._d].map(k => [k, h.states[k]]));
  }
}
/* ---------- visual editor ---------- */
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
const T = { text: {} }, TM = { text: { multiline: true } }, E = { entity: {} }, N = { number: { mode: 'box' } };
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

const ACTIONS = [
  { p: 'tap_action', s: A(), l: 'Tap action' },
  { p: 'hold_action', s: A(), l: 'Hold action' },
  { p: 'double_tap_action', s: A(), l: 'Double tap action' },
];
const COLORS = 'red, pink, purple, deep-purple, indigo, blue, light-blue, cyan, teal, green, light-green, lime, yellow, amber, orange, deep-orange, brown, grey, blue-grey, black, white, disabled';
const TILE_MAIN = [
  { p: 'name', s: TM, l: 'Name', h: 'Title of the tile.' + TPL },
  { p: 'secondary', s: TM, l: 'Secondary text', h: 'Line under the title. Use {mdi:thermometer} for small icons.' + TPL },
  { p: 'entity', s: E, l: 'Entity', h: 'Used by actions that do not name their own entity.' },
  { p: 'icon', s: TM, l: 'Big icon', h: 'For example mdi:sofa.' + TPL },
  { p: 'color', s: TM, l: 'Colour', h: 'One of: ' + COLORS + '. Or #hex, "r,g,b".' + TPL },
  { p: 'animation', s: TM, l: 'Icon animation', h: 'washing, spinning, rinsing, drying, cleaning, returning, paused, charging, charged, fire, boil, pulse.' + TPL },
  { p: 'picture', s: TM, l: 'Picture', h: 'Image URL such as /local/room.svg. Replaces the big icon.' + TPL },
  { p: 'picture_style', s: T, l: 'Picture CSS', h: 'For example object-fit:contain' },
  { p: 'refresh', s: N, l: 'Refresh every N seconds', h: 'Needed when a template uses the time, such as "5 minutes ago".' },
];
const TILE_LAYOUT = [
  { p: 'title_size', s: N, l: 'Title size (px)' },
  { p: 'secondary_size', s: N, l: 'Secondary text size (px)' },
  { p: 'secondary_offset', s: N, l: 'Secondary text offset (px)' },
  { p: 'shape_top', s: N, l: 'Big icon top (px)' },
  { p: 'shape_left', s: N, l: 'Big icon left (px)' },
];
const TILE_TIMER = [
  { p: 'timer.entity', s: { entity: { domain: 'timer' } }, l: 'Timer entity', h: 'Shows a progress bar while the timer is active.' },
  { p: 'timer.color', s: T, l: 'Bar colour' },
];
const TILE_BADGE = [
  { p: 'badge.text', s: TM, l: 'Badge text' + '', h: 'Small circle on the big icon.' + TPL },
  { p: 'badge.color', s: TM, l: 'Badge colour' },
  { p: 'badge.left', s: N, l: 'Left (px)' },
  { p: 'badge.top', s: N, l: 'Top (px)' },
];
const TILE_BUTTON = [
  { p: 'entity', s: E, l: 'Entity' },
  { p: 'icon', s: TM, l: 'Icon', h: 'For example mdi:lightbulb.' + TPL },
  { p: 'color', s: TM, l: 'Colour', h: 'Leave empty to follow the entity state.' + TPL },
  { p: 'picture', s: TM, l: 'Picture', h: 'Image URL shown instead of the icon.' + TPL },
  { p: 'picture_style', s: T, l: 'Picture CSS' },
  { p: 'size', s: N, l: 'Size (px)' },
  { p: 'top', s: N, l: 'Top (px)' },
  { p: 'animation', s: TM, l: 'Icon animation' },
  { p: 'shape_animation', s: TM, l: 'Circle animation', h: 'ping or leave empty.' + TPL },
  { p: 'badge.icon', s: TM, l: 'Badge icon' },
  { p: 'badge.color', s: TM, l: 'Badge colour' },
  { p: 'tap_action', s: A('toggle'), l: 'Tap action' },
  { p: 'hold_action', s: A('more-info'), l: 'Hold action' },
  { p: 'double_tap_action', s: A(), l: 'Double tap action' },
];
const TILE_EXTRA = [
  { p: 'entity', s: E, l: 'Entity' },
  { p: 'label', s: TM, l: 'Label', h: 'Small text under the value.' + TPL },
  { p: 'value', s: TM, l: 'Value', h: 'Leave empty to show the entity state.' + TPL },
  { p: 'show', s: TM, l: 'Show when', h: 'A template that returns true or false.' },
  { p: 'top', s: N, l: 'Top (px)' },
];

class RoomTileEditor extends EditorBase {
  _build(r) {
    const c = this._cfg;
    const main = this._sec('main', 'Main'); main._b.append(this._form(TILE_MAIN, c));
    const act = this._sec('actions', 'Actions'); act._b.append(this._form(ACTIONS, c));
    const lay = this._sec('layout', 'Layout'); lay._b.append(this._form(TILE_LAYOUT, c));
    const tim = this._sec('timer', 'Timer bar'); tim._b.append(this._form(TILE_TIMER, c));
    const bad = this._sec('badge', 'Badge on big icon'); bad._b.append(this._form(TILE_BADGE, c));
    const btn = this._list('buttons', 'Round buttons (' + (c.buttons || []).length + ')', 'buttons', TILE_BUTTON, { icon: 'mdi:lightbulb' },
      (b, i) => 'Button ' + (i + 1) + (b.entity ? ': ' + b.entity : ''), 'Add button');
    const ext = this._list('extras', 'Text blocks (' + (c.extras || []).length + ')', 'extras', TILE_EXTRA, { label: 'Label' },
      (x, i) => 'Text block ' + (i + 1) + (x.entity ? ': ' + x.entity : ''), 'Add text block');
    r.append(main, act, btn, ext, tim, bad, lay);
  }
}

if (!customElements.get('room-tile')) customElements.define('room-tile', RoomTile);
if (!customElements.get('room-tile-editor')) customElements.define('room-tile-editor', RoomTileEditor);
window.customCards = window.customCards || [];
if (!window.customCards.some(x => x.type === 'room-tile')) window.customCards.push({ type: 'room-tile', name: 'Room Tile', preview: true, description: 'Fast room-style tile with big icon or picture, round buttons, timer bar and animations.' });
})();