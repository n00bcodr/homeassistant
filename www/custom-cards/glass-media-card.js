// Glass now-playing card (matches the JellyHA now-playing look) for any music media_player.
class GlassMediaCard extends HTMLElement {
  setConfig(c) {
    if (!c.entity) throw new Error('entity required');
    this._c = c;
    if (!this.shadowRoot) this._build();
  }
  getCardSize() { return 4; }
  set hass(h) { this._h = h; this._render(); }

  _build() {
    const r = this.attachShadow({ mode: 'open' });
    r.innerHTML = `<style>
      :host{display:block;height:100%}
      ha-card{container-type:inline-size;position:relative;overflow:hidden;height:100%;box-sizing:border-box;display:flex;flex-direction:column;min-height:272px;border-radius:var(--ha-card-border-radius,28px);
        background:rgba(20,26,32,.55);color:#fff;font-family:var(--primary-font-family,inherit)}
      .bg{position:absolute;inset:-30px;background-size:cover;background-position:center;filter:blur(28px) saturate(1.4) brightness(.38);transform:scale(1.1)}
      .wrap{position:relative;flex:1;display:flex;gap:20px;padding:18px;height:100%;box-sizing:border-box;align-items:stretch}
      .art{flex:0 0 auto;width:clamp(110px,30%,236px);aspect-ratio:1;align-self:center;border-radius:16px;background-size:cover;background-position:center;
        box-shadow:0 8px 24px rgba(0,0,0,.45);background-color:rgba(255,255,255,.08);position:relative}
      .art ha-icon{position:absolute;right:8px;bottom:8px;color:#1DB954;--mdc-icon-size:26px;filter:drop-shadow(0 1px 3px #000)}
      .main{flex:1;min-width:0;display:flex;flex-direction:column}
      .t{font-size:22px;font-weight:700;color:#8fc3ea;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.2}
      .a{font-size:15px;color:#8fc3ea;opacity:.85;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px}
      .al{font-size:12px;opacity:.7;margin-top:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .tag{position:absolute;top:0;right:0;display:flex;gap:6px;align-items:center}
      .pill{font-size:11px;font-weight:700;padding:3px 9px;border-radius:9px;background:#1DB954;color:#fff}
      .top{position:relative;padding-right:90px}
      .ctl{margin-top:auto;margin-bottom:10px;display:flex;justify-content:center;gap:12px;align-items:center}
      .b{width:44px;height:44px;border-radius:50%;border:0;background:rgba(255,255,255,.14);color:#fff;cursor:pointer;
        display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px);transition:background .15s,transform .1s}
      .b:hover{background:rgba(255,255,255,.26)} .b:active{transform:scale(.94)}
      .b.big{width:52px;height:52px} .b ha-icon{--mdc-icon-size:26px}
      .art.noimg ha-icon{--mdc-icon-size:64px!important;right:50%;bottom:50%;transform:translate(50%,50%);opacity:.8}
      .b.on{background:rgba(29,185,84,.35);color:#7dffa8}
      .bar{height:6px;border-radius:3px;background:rgba(255,255,255,.2);cursor:pointer;position:relative}
      .fill{position:absolute;left:0;top:0;bottom:0;border-radius:3px;background:#1DB954}
      .dot{position:absolute;top:50%;width:14px;height:14px;border-radius:50%;background:#1DB954;transform:translate(-50%,-50%);box-shadow:0 0 6px rgba(0,0,0,.5)}
      .tm{display:flex;justify-content:space-between;font-size:11px;opacity:.75;margin-top:6px}
      @media (max-width:600px){ha-card{min-height:0}}
      .ai{display:none;flex:0 0 auto;width:52px;height:52px;border-radius:14px;background:rgba(255,255,255,.14);align-items:center;justify-content:center;
        box-shadow:0 4px 14px rgba(0,0,0,.35);backdrop-filter:blur(6px);align-self:flex-start}
      .ai ha-icon{--mdc-icon-size:32px}
      .art.wide{aspect-ratio:16/9;width:clamp(150px,38%,300px)}
      .noart .art{display:none}
      .noart .ai{display:flex}
      .noart .wrap{gap:16px}
      .noart .main{justify-content:flex-start}
      @container (max-width:560px){
        .wrap{display:grid;grid-template-columns:38% minmax(0,1fr);grid-template-rows:auto auto auto;column-gap:14px;row-gap:12px;align-items:start}
        .main{display:contents}
        .art{grid-area:1/1;width:auto;max-width:none;align-self:start}
        .art.wide{width:auto}
        .top{grid-area:1/2;padding-right:0!important;min-width:0}
        .ctl,.bw{min-width:0}
        .ctl{grid-area:2/1/3/3;margin:0;gap:8px}
        .bw{grid-area:3/1/4/3}
        .b{width:40px;height:40px}.b.big{width:48px;height:48px}.b ha-icon{--mdc-icon-size:22px}
        .tag,.vol{position:static!important;margin-top:8px}
        .vol{width:100%!important;justify-content:flex-start!important}
        .vol input{flex:1;width:auto;min-width:0;max-width:240px}
        .vol{gap:10px}
        .t{font-size:20px}
        .noart .wrap{grid-template-columns:52px minmax(0,1fr)}
        .noart .ai{grid-area:1/1}
      }
      .top{padding-right:150px}
      .vol{position:absolute;right:0;top:30px;display:flex;align-items:center;gap:4px;width:140px;justify-content:flex-end}
      .vol ha-icon{--mdc-icon-size:20px;opacity:.85;cursor:pointer}
      .vol input{-webkit-appearance:none;appearance:none;width:96px;height:20px;background:transparent;cursor:pointer;margin:0;padding:0;touch-action:none;
        --p:50%}
      .vol input::-webkit-slider-runnable-track{height:6px;border-radius:3px;background:linear-gradient(to right,#fff var(--p),rgba(255,255,255,.25) var(--p))}
      .vol input::-moz-range-track{height:6px;border-radius:3px;background:rgba(255,255,255,.25)}
      .vol input::-moz-range-progress{height:6px;border-radius:3px;background:#fff}
      .vol input::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:#fff;margin-top:-5px;box-shadow:0 1px 4px rgba(0,0,0,.5)}
      .vol input::-moz-range-thumb{width:16px;height:16px;border:0;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.5)}
      .vb{width:30px;height:30px}.vb ha-icon{--mdc-icon-size:18px}
      .b.dis{opacity:.3;pointer-events:none}
      .idle{opacity:.6;padding:30px;text-align:center}
    </style>
    <ha-card><div class="bg"></div><div class="wrap"></div></ha-card>`;
    this._wrap = r.querySelector('.wrap'); this._bg = r.querySelector('.bg');
    this._wrap.innerHTML = `
      <div class="art"><ha-icon icon="mdi:spotify"></ha-icon></div>
      <div class="ai"><ha-icon icon="mdi:television-play"></ha-icon></div>
      <div class="main">
        <div class="top"><div class="t"></div><div class="a"></div><div class="al"></div>
          <div class="tag"><span class="pill"></span></div>
          <div class="vol"><ha-icon class="vi" icon="mdi:volume-high"></ha-icon><input class="vr" type="range" min="0" max="100" step="1">
            <button class="b vb vd" data-s="vol_down"><ha-icon icon="mdi:volume-minus"></ha-icon></button>
            <button class="b vb vu" data-s="vol_up"><ha-icon icon="mdi:volume-plus"></ha-icon></button></div></div>
        <div class="ctl">
          <button class="b" data-s="shuffle_set"><ha-icon icon="mdi:shuffle-variant"></ha-icon></button>
          <button class="b" data-s="media_previous_track"><ha-icon icon="mdi:skip-previous"></ha-icon></button>
          <button class="b big" data-s="media_play_pause"><ha-icon class="pp" icon="mdi:pause"></ha-icon></button>
          <button class="b" data-s="media_next_track"><ha-icon icon="mdi:skip-next"></ha-icon></button>
          <button class="b stp" data-s="media_stop" title="Stop"><ha-icon icon="mdi:stop"></ha-icon></button>
          <button class="b" data-s="repeat_set"><ha-icon class="rp" icon="mdi:repeat"></ha-icon></button>
          <button class="b dj" data-s="dj" title="Spotify DJ"><ha-icon icon="mdi:microphone-variant"></ha-icon></button>
        </div>
        <div class="bw"><div class="bar"><div class="fill"></div><div class="dot"></div></div>
          <div class="tm"><span class="p"></span><span class="d"></span></div></div>
      </div>`;
    const q = s => r.querySelector(s);
    this._e = { art: q('.art'), t: q('.t'), a: q('.a'), al: q('.al'), pill: q('.pill'), pp: q('.pp'), rp: q('.rp'),
      fill: q('.fill'), dot: q('.dot'), p: q('.p'), d: q('.d'), bar: q('.bar'),
      sh: q('[data-s=shuffle_set]'), rpb: q('[data-s=repeat_set]'), dj: q('.dj'), stp: q('.stp'), ai: q('.ai'), wrap: q('.wrap'), vol: q('.vol'), vr: q('.vr'), vi: q('.vi'), vd: q('.vd'), vu: q('.vu') };
    r.querySelectorAll('.b').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); this._act(b.dataset.s); }));
    this._e.bar.addEventListener('click', e => {
      const s = this._st(); if (!s || !(s.attributes.media_duration > 1)) return;
      const rc = this._e.bar.getBoundingClientRect();
      this._h.callService('media_player', 'media_seek', { entity_id: s._target, seek_position: Math.max(0, (e.clientX - rc.left) / rc.width) * s.attributes.media_duration });
    });
    // keep the swipe-card (swiper) from grabbing drags that start on the slider / progress bar / buttons
    ['.vol', '.bar', '.ctl'].forEach(sel => ['pointerdown', 'mousedown', 'touchstart', 'pointermove', 'mousemove', 'touchmove'].forEach(ev =>
      r.querySelector(sel).addEventListener(ev, e => e.stopPropagation(), { passive: true })));
    const vr = this._e.vr;
    vr.addEventListener('input', () => vr.style.setProperty('--p', vr.value + '%'));
    vr.addEventListener('pointerdown', () => { this._drag = true; });
    ['pointerup', 'pointercancel', 'blur'].forEach(ev => vr.addEventListener(ev, () => { this._drag = false; }));
    vr.addEventListener('change', () => { this._drag = false; const v = this._vt(); if (v) this._h.callService('media_player', 'volume_set', { entity_id: v.id, volume_level: vr.value / 100 }); });
    this._e.vi.addEventListener('click', e => { e.stopPropagation(); const v = this._vt(); if (v) this._h.callService('media_player', 'volume_mute', { entity_id: v.id, is_volume_muted: !(this._st().attributes.is_volume_muted) }); });
    r.querySelector('.art').addEventListener('click', () => this.dispatchEvent(new CustomEvent('hass-more-info', { bubbles: true, composed: true, detail: { entityId: this._c.entity } })));
    setInterval(() => this._tick(), 1000);
  }

  // Merge sibling entities of one device. Priority for what is playing: *_cast > ADB (no suffix) > *_remote.
  _ids() {
    const e = this._c.entity, c = this._c;
    if (c.sources) return c.sources;
    if (/_remote$/.test(e)) { const b = e.replace(/_remote$/, ''); return [e, b, c.cast_entity || b + '_cast']; }
    return [e];
  }
  _st() {
    const h = this._h; if (!h) return null;
    const ids = this._ids(), base = h.states[ids[0]]; if (!base) return base;
    const live = ['playing', 'paused', 'buffering'];
    let attrs = { ...base.attributes }, out = { state: base.state, _target: ids[0] };
    for (const id of ids.slice(1)) {
      const o = h.states[id]; if (!o || !live.includes(o.state)) continue;
      for (const [k, v] of Object.entries(o.attributes)) if (v !== null && v !== undefined && v !== '') attrs[k] = v;
      out.state = o.state; out._target = id;
    }
    attrs.friendly_name = base.attributes.friendly_name;
    out.attributes = attrs;
    // the ADB (Android TV) sibling exposes a live screen-capture of the TV as its entity_picture
    const adb = ids.length > 2 && h.states[ids[1]];
    out._frame = adb && adb.attributes.entity_picture;
    return out;
  }
  // entity that takes volume commands: first sibling that supports VOLUME_SET, else the base (step only)
  _vt() {
    const h = this._h, ids = this._ids();
    for (const id of [ids[0], ...ids.slice(1).reverse()]) { const o = h.states[id]; if (o && (o.attributes.supported_features & 4)) return { id, set: true }; }
    return h.states[ids[0]] ? { id: ids[0], set: false } : null;
  }
  _act(s) {
    const st = this._st(), id = st._target, a = st.attributes;
    if (s === 'vol_up' || s === 'vol_down') { const v = this._vt(); this._h.callService('media_player', s === 'vol_up' ? 'volume_up' : 'volume_down', { entity_id: v.id }); }
    else if (s === 'dj') this._h.callService('spotcast', 'play_dj', {});
    else if (s === 'shuffle_set') this._h.callService('media_player', 'shuffle_set', { entity_id: id, shuffle: !a.shuffle });
    else if (s === 'repeat_set') this._h.callService('media_player', 'repeat_set', { entity_id: id, repeat: a.repeat === 'off' ? 'all' : a.repeat === 'all' ? 'one' : 'off' });
    else {
      // a cast session without a real duration (e.g. Wholphin) ignores transport commands: use the remote sibling's key presses
      const rem = this._ids().find(i => /_remote$/.test(i) && this._h.states[i] && this._h.states[i].state !== 'unavailable');
      const tgt = (/_cast$/.test(id) && !(a.media_duration > 1) && rem) ? rem : id;
      this._h.callService('media_player', s, { entity_id: tgt });
    }
  }
  _fmt(s) { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
  _pos() {
    const st = this._st(); if (!st) return 0; const a = st.attributes;
    let p = a.media_position || 0;
    if (st.state === 'playing' && a.media_position_updated_at) p += (Date.now() - new Date(a.media_position_updated_at).getTime()) / 1000;
    return a.media_duration > 1 ? Math.min(p, a.media_duration) : p;
  }
  // Inside a swipe-card every slide should be as tall as the tallest one: grow to the slide's height.
  _fit() {
    let n = this;
    for (let i = 0; i < 8 && n; i++) {
      n = n.parentElement || (n.getRootNode && n.getRootNode().host);
      if (n && n.classList && n.classList.contains('swiper-slide')) {
        const c = this.shadowRoot.querySelector('ha-card'), h = n.clientHeight;
        if (h && h > c.offsetHeight) c.style.minHeight = h + 'px';
        return;
      }
    }
  }
  _tick() {
    const st = this._st(); if (!st || !this._e) return;
    const d = st.attributes.media_duration > 1 ? st.attributes.media_duration : 0, p = this._pos(), pc = d ? (p / d) * 100 : 0;
    this._e.fill.style.width = pc + '%'; this._e.dot.style.left = pc + '%';
    this._fit();
    this._e.p.textContent = this._fmt(p); this._e.d.textContent = d ? '-' + this._fmt(d - p) : '';
  }
  _render() {
    const st = this._st(); if (!st || !this._e) return;
    const a = st.attributes, e = this._e;
    let pic = a.entity_picture_local || a.entity_picture, frame = false;
    if (!pic && st._frame) { pic = st._frame; frame = true; }
    const url = pic ? `url("${pic}")` : '';
    e.art.style.backgroundImage = url; this._bg.style.backgroundImage = url;
    e.t.textContent = a.media_title || a.app_name || a.friendly_name || '';
    e.a.textContent = a.media_artist || (a.media_title ? '' : (a.app_name ? (st.state === 'on' ? 'Open' : st.state) : ''));
    const hasDur = a.media_duration > 1;
    e.bar.parentElement.style.visibility = hasDur ? 'visible' : 'hidden';
    e.wrap.classList.toggle('noart', !pic);
    e.art.classList.toggle('wide', frame);
    const APPS = [['youtube music','mdi:music-circle','#ff0033'],['youtube','mdi:youtube','#ff0033'],['netflix','mdi:netflix','#e50914'],['spotify','mdi:spotify','#1DB954'],
      ['jellyfin','mdi:jellyfish','#a95ce6'],['wholphin','mdi:jellyfish','#a95ce6'],['hotstar','mdi:movie-open','#4a7bff'],['prime','mdi:amazon','#00a8e1'],
      ['plex','mdi:plex','#e5a00d'],['twitch','mdi:twitch','#9146ff'],['sony','mdi:television-play','#ffffff'],['kodi','mdi:kodi','#17b2e7']];
    const an = (a.app_name || '').toLowerCase(), hit = APPS.find(x => an.includes(x[0]));
    e.ai.firstElementChild.setAttribute('icon', hit ? hit[1] : (this._c.icon || 'mdi:television-play'));
    e.ai.firstElementChild.style.color = hit ? hit[2] : '#fff';
    e.al.textContent = (a.media_album_name && a.media_album_name !== a.media_artist) ? a.media_album_name : '';
    e.pill.textContent = this._c.dj ? (a.source || 'Spotify') : (a.friendly_name || '').replace(/ (Remote|Cast)$/, '');
    e.art.querySelector('ha-icon').setAttribute('icon', this._c.icon || 'mdi:spotify');
    e.art.querySelector('ha-icon').style.color = this._c.dj ? '#1DB954' : '#fff';
    e.pill.style.background = this._c.dj ? '#1DB954' : 'rgba(255,255,255,.22)';
    e.dj.style.display = this._c.dj ? '' : 'none';
    // stop ends the cast session (a pause leaves it open); only when the player supports STOP (4096)
    const canStop = (a.supported_features & 4096) && ['playing', 'paused', 'buffering'].includes(st.state);
    e.stp.style.display = canStop ? '' : 'none';
    const hasMode = a.shuffle !== undefined;
    e.sh.style.display = hasMode ? '' : 'none'; e.rpb.style.display = hasMode ? '' : 'none';
    e.pp.setAttribute('icon', st.state === 'playing' ? 'mdi:pause' : 'mdi:play');
    e.dj.classList.toggle('on', a.media_playlist === 'DJ');
    e.sh.classList.toggle('on', !!a.shuffle);
    e.rpb.classList.toggle('on', a.repeat && a.repeat !== 'off');
    e.rp.setAttribute('icon', a.repeat === 'one' ? 'mdi:repeat-once' : 'mdi:repeat');
    const dj = a.media_playlist === 'DJ';
    e.sh.classList.toggle('dis', dj); e.rpb.classList.toggle('dis', dj);
    e.sh.title = e.rpb.title = dj ? 'Not available while the DJ is playing' : '';
    const v = this._vt();
    if (!v || a.volume_level === undefined) e.vol.style.display = 'none';
    else {
      e.vol.style.display = 'flex';
      e.vr.style.display = v.set ? '' : 'none'; e.vd.style.display = e.vu.style.display = v.set ? 'none' : '';
      if (!this._drag) e.vr.value = Math.round((a.volume_level || 0) * 100);
      e.vr.style.setProperty('--p', e.vr.value + '%');
      e.vi.setAttribute('icon', a.is_volume_muted ? 'mdi:volume-off' : a.volume_level < .35 ? 'mdi:volume-low' : a.volume_level < .7 ? 'mdi:volume-medium' : 'mdi:volume-high');
    }
    if (frame) { const ic = e.art.querySelector('ha-icon'); ic.setAttribute('icon', hit ? hit[1] : 'mdi:television-play'); ic.style.color = hit ? hit[2] : '#fff'; }
    this._tick();
  }
}
customElements.define('glass-media-card', GlassMediaCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: 'glass-media-card', name: 'Glass media card', description: 'Glassy now-playing card' });
