// Floating glass sidebar and top bars, on every screen. Only active while the theme sets
// --glass-chrome: floating (set in the "Glass Graphite" theme). With any other value the styles are removed.
//
// Home Assistant frontend targets:
//   ha-drawer            > .sidebar-shell (fixed sidebar), .app-content (padding for it)
//   home-assistant-main  > --ha-top-app-bar-width
//   hui-root             > .header (fixed dashboard bar), #view (top padding), ha-tab-group-tab
//   ha-top-app-bar-fixed > header.top-app-bar (absolute bar used by several panels)
//   hass-subpage / hass-tabs-subpage > .toolbar (in-flow bar: Apps, Settings, Automations ...), ha-tab
const GAP = 12;

const GLASS_BAR = `
  border-radius: 24px !important;
  overflow: hidden !important;
  border: 1px solid rgba(255,255,255,0.09) !important;
  background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(11,11,12,0.55)) !important;
  box-shadow: 0 10px 34px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.07) !important;
  -webkit-backdrop-filter: blur(18px) saturate(140%);
  backdrop-filter: blur(18px) saturate(140%);
`;

const DRAWER = `
.sidebar-shell {
  top: ${GAP}px !important;
  left: ${GAP}px !important;
  height: calc(100% - ${GAP * 2}px) !important;
  border: 1px solid rgba(255,255,255,0.09) !important;
  border-radius: 26px !important;
  overflow: hidden !important;
  background: linear-gradient(160deg, rgba(255,255,255,0.09), rgba(255,255,255,0.025)) !important;
  box-shadow: 0 12px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.07) !important;
  -webkit-backdrop-filter: blur(18px) saturate(140%);
  backdrop-filter: blur(18px) saturate(140%);
}
.layout {
  background: var(--lovelace-background, var(--primary-background-color)) !important;
  background-attachment: fixed !important;
}
.app-content { padding-inline-start: calc(var(--ha-sidebar-width) + ${GAP * 2}px) !important; }
`;

const MAIN = `
:host(:not([modal])) { --ha-top-app-bar-width: calc(100% - var(--ha-sidebar-width) - ${GAP * 3}px); }
`;

const HUI_ROOT = `
.header {
  margin-top: ${GAP}px !important;
  ${GLASS_BAR}
}
hui-view-container#view { padding-top: calc(var(--header-height, 56px) + var(--safe-area-inset-top, 0px) + ${GAP + 8}px) !important; }
ha-tab-group {
  --ha-tab-indicator-color: transparent;
  --indicator-color: transparent;
  --track-width: 0px;
}
ha-tab-group-tab { position: relative; }
ha-tab-group-tab::before {
  content: '';
  position: absolute;
  inset: 6px 2px;
  border-radius: 999px;
  background: transparent;
  transition: background 0.2s ease;
  pointer-events: none;
  z-index: -1;
}
ha-tab-group-tab:hover::before { background: rgba(255,255,255,0.07); }
ha-tab-group-tab[active]::before { background: color-mix(in srgb, var(--primary-color) 22%, transparent); }
`;
const HUI_ROOT_NARROW = `
.header { margin: ${GAP}px ${GAP}px 0 ${GAP}px !important; width: calc(var(--ha-top-app-bar-width, 100%) - ${GAP * 2}px) !important; }
`;

const TOP_APP_BAR = `
.top-app-bar {
  top: ${GAP}px !important;
  left: ${GAP}px !important;
  width: calc(100% - ${GAP * 2}px) !important;
  ${GLASS_BAR}
}
.row { border-bottom: none !important; }
.top-app-bar-fixed-adjust { margin-top: ${GAP + 8}px !important; left: ${GAP}px !important; right: ${GAP}px !important; }
`;

// In-flow bars: the inset is done with padding on the host, so the content height (a percentage of the host) shrinks with it.
const SUBPAGE = `
:host { padding: ${GAP}px ${GAP}px 0 ${GAP}px !important; box-sizing: border-box !important; }
.toolbar { ${GLASS_BAR} }
.content, .container { padding-top: 8px !important; box-sizing: border-box !important; }
`;

const TAB = `
:host(:not([narrow])) { display: block; position: relative; padding: 0 14px; }
:host(:not([narrow])[active]) div { border-bottom: none !important; }
:host(:not([narrow]))::before {
  content: '';
  position: absolute;
  inset: 6px 0;
  border-radius: 999px;
  background: transparent;
  transition: background 0.2s ease;
  pointer-events: none;
  z-index: -1;
}
:host(:not([narrow]):hover)::before { background: rgba(255,255,255,0.07); }
:host(:not([narrow])[active])::before { background: color-mix(in srgb, var(--primary-color) 22%, transparent); }
`;

// Search and text fields: glass fill instead of the solid card colour.
const INPUT = `
wa-input::part(base) {
  background-color: rgba(255,255,255,0.05) !important;
  border-color: rgba(255,255,255,0.09) !important;
}
wa-input::part(base):hover { background-color: rgba(255,255,255,0.08) !important; }
`;

const TARGETS = {
  'hui-root': (narrow) => HUI_ROOT + (narrow ? HUI_ROOT_NARROW : ''),
  'ha-top-app-bar-fixed': () => TOP_APP_BAR,
  'hass-subpage': () => SUBPAGE,
  'hass-tabs-subpage': () => SUBPAGE,
  'ha-tab': () => TAB,
  'ha-input': () => INPUT,
  'ha-input-search': () => INPUT,
};
const SELECTOR = Object.keys(TARGETS).join(',');

const put = (root, css) => {
  if (!root) return;
  let s = root.querySelector('style#glass-chrome');
  if (!css) { if (s) s.remove(); return; }
  if (!s) { s = document.createElement('style'); s.id = 'glass-chrome'; root.appendChild(s); }
  if (s.textContent !== css) s.textContent = css;
};

const scan = (root, on, narrow) => {
  root.querySelectorAll(SELECTOR).forEach((el) => {
    if (el.shadowRoot) put(el.shadowRoot, on ? TARGETS[el.localName](narrow) : '');
  });
  root.querySelectorAll('*').forEach((el) => { if (el.shadowRoot) scan(el.shadowRoot, on, narrow); });
};

const apply = () => {
  if (document.hidden) return;
  const on = getComputedStyle(document.documentElement).getPropertyValue('--glass-chrome').trim().replace(/['"]/g, '') === 'floating';
  const main = document.querySelector('home-assistant')?.shadowRoot?.querySelector('home-assistant-main');
  if (!main?.shadowRoot) return;
  const narrow = main.hasAttribute('modal');
  put(main.shadowRoot, on ? MAIN : '');
  put(main.shadowRoot.querySelector('ha-drawer')?.shadowRoot, on && !narrow ? DRAWER : '');
  scan(main.shadowRoot, on, narrow);
};

apply();
setInterval(apply, 1500);
window.addEventListener('location-changed', () => { setTimeout(apply, 150); setTimeout(apply, 600); });
console.info('%cGLASS-CHROME', 'color:#89B3F8;font-weight:bold');
