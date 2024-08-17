const e=window,t=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,i=Symbol(),s=new WeakMap;class r{constructor(e,t,s){if(this._$cssResult$=!0,s!==i)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const i=this.t;if(t&&void 0===e){const t=void 0!==i&&1===i.length;t&&(e=s.get(i)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),t&&s.set(i,e))}return e}toString(){return this.cssText}}const o=(e,...t)=>{const s=1===e.length?e[0]:t.reduce(((t,i,s)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[s+1]),e[0]);return new r(s,e,i)},n=t?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return(e=>new r("string"==typeof e?e:e+"",void 0,i))(t)})(e):e;var a;const l=window,c=l.trustedTypes,h=c?c.emptyScript:"",d=l.reactiveElementPolyfillSupport,u={toAttribute(e,t){switch(t){case Boolean:e=e?h:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},f=(e,t)=>t!==e&&(t==t||e==e),p={attribute:!0,type:String,converter:u,reflect:!1,hasChanged:f},m="finalized";class v extends HTMLElement{constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this._$Eu()}static addInitializer(e){var t;this.finalize(),(null!==(t=this.h)&&void 0!==t?t:this.h=[]).push(e)}static get observedAttributes(){this.finalize();const e=[];return this.elementProperties.forEach(((t,i)=>{const s=this._$Ep(i,t);void 0!==s&&(this._$Ev.set(s,i),e.push(s))})),e}static createProperty(e,t=p){if(t.state&&(t.attribute=!1),this.finalize(),this.elementProperties.set(e,t),!t.noAccessor&&!this.prototype.hasOwnProperty(e)){const i="symbol"==typeof e?Symbol():"__"+e,s=this.getPropertyDescriptor(e,i,t);void 0!==s&&Object.defineProperty(this.prototype,e,s)}}static getPropertyDescriptor(e,t,i){return{get(){return this[t]},set(s){const r=this[e];this[t]=s,this.requestUpdate(e,r,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)||p}static finalize(){if(this.hasOwnProperty(m))return!1;this[m]=!0;const e=Object.getPrototypeOf(this);if(e.finalize(),void 0!==e.h&&(this.h=[...e.h]),this.elementProperties=new Map(e.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){const e=this.properties,t=[...Object.getOwnPropertyNames(e),...Object.getOwnPropertySymbols(e)];for(const i of t)this.createProperty(i,e[i])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(n(e))}else void 0!==e&&t.push(n(e));return t}static _$Ep(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}_$Eu(){var e;this._$E_=new Promise((e=>this.enableUpdating=e)),this._$AL=new Map,this._$Eg(),this.requestUpdate(),null===(e=this.constructor.h)||void 0===e||e.forEach((e=>e(this)))}addController(e){var t,i;(null!==(t=this._$ES)&&void 0!==t?t:this._$ES=[]).push(e),void 0!==this.renderRoot&&this.isConnected&&(null===(i=e.hostConnected)||void 0===i||i.call(e))}removeController(e){var t;null===(t=this._$ES)||void 0===t||t.splice(this._$ES.indexOf(e)>>>0,1)}_$Eg(){this.constructor.elementProperties.forEach(((e,t)=>{this.hasOwnProperty(t)&&(this._$Ei.set(t,this[t]),delete this[t])}))}createRenderRoot(){var i;const s=null!==(i=this.shadowRoot)&&void 0!==i?i:this.attachShadow(this.constructor.shadowRootOptions);return((i,s)=>{t?i.adoptedStyleSheets=s.map((e=>e instanceof CSSStyleSheet?e:e.styleSheet)):s.forEach((t=>{const s=document.createElement("style"),r=e.litNonce;void 0!==r&&s.setAttribute("nonce",r),s.textContent=t.cssText,i.appendChild(s)}))})(s,this.constructor.elementStyles),s}connectedCallback(){var e;void 0===this.renderRoot&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null===(e=this._$ES)||void 0===e||e.forEach((e=>{var t;return null===(t=e.hostConnected)||void 0===t?void 0:t.call(e)}))}enableUpdating(e){}disconnectedCallback(){var e;null===(e=this._$ES)||void 0===e||e.forEach((e=>{var t;return null===(t=e.hostDisconnected)||void 0===t?void 0:t.call(e)}))}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$EO(e,t,i=p){var s;const r=this.constructor._$Ep(e,i);if(void 0!==r&&!0===i.reflect){const o=(void 0!==(null===(s=i.converter)||void 0===s?void 0:s.toAttribute)?i.converter:u).toAttribute(t,i.type);this._$El=e,null==o?this.removeAttribute(r):this.setAttribute(r,o),this._$El=null}}_$AK(e,t){var i;const s=this.constructor,r=s._$Ev.get(e);if(void 0!==r&&this._$El!==r){const e=s.getPropertyOptions(r),o="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==(null===(i=e.converter)||void 0===i?void 0:i.fromAttribute)?e.converter:u;this._$El=r,this[r]=o.fromAttribute(t,e.type),this._$El=null}}requestUpdate(e,t,i){let s=!0;void 0!==e&&(((i=i||this.constructor.getPropertyOptions(e)).hasChanged||f)(this[e],t)?(this._$AL.has(e)||this._$AL.set(e,t),!0===i.reflect&&this._$El!==e&&(void 0===this._$EC&&(this._$EC=new Map),this._$EC.set(e,i))):s=!1),!this.isUpdatePending&&s&&(this._$E_=this._$Ej())}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var e;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach(((e,t)=>this[t]=e)),this._$Ei=void 0);let t=!1;const i=this._$AL;try{t=this.shouldUpdate(i),t?(this.willUpdate(i),null===(e=this._$ES)||void 0===e||e.forEach((e=>{var t;return null===(t=e.hostUpdate)||void 0===t?void 0:t.call(e)})),this.update(i)):this._$Ek()}catch(e){throw t=!1,this._$Ek(),e}t&&this._$AE(i)}willUpdate(e){}_$AE(e){var t;null===(t=this._$ES)||void 0===t||t.forEach((e=>{var t;return null===(t=e.hostUpdated)||void 0===t?void 0:t.call(e)})),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(e){return!0}update(e){void 0!==this._$EC&&(this._$EC.forEach(((e,t)=>this._$EO(t,this[t],e))),this._$EC=void 0),this._$Ek()}updated(e){}firstUpdated(e){}}var g;v[m]=!0,v.elementProperties=new Map,v.elementStyles=[],v.shadowRootOptions={mode:"open"},null==d||d({ReactiveElement:v}),(null!==(a=l.reactiveElementVersions)&&void 0!==a?a:l.reactiveElementVersions=[]).push("1.6.3");const _=window,$=_.trustedTypes,y=$?$.createPolicy("lit-html",{createHTML:e=>e}):void 0,w="$lit$",b=`lit$${(Math.random()+"").slice(9)}$`,x="?"+b,A=`<${x}>`,S=document,M=()=>S.createComment(""),E=e=>null===e||"object"!=typeof e&&"function"!=typeof e,D=Array.isArray,C="[ \t\n\f\r]",R=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,N=/-->/g,I=/>/g,T=RegExp(`>|${C}(?:([^\\s"'>=/]+)(${C}*=${C}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),O=/'/g,k=/"/g,L=/^(?:script|style|textarea|title)$/i,H=(e=>(t,...i)=>({_$litType$:e,strings:t,values:i}))(1),P=Symbol.for("lit-noChange"),Y=Symbol.for("lit-nothing"),U=new WeakMap,V=S.createTreeWalker(S,129,null,!1);function F(e,t){if(!Array.isArray(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==y?y.createHTML(t):t}const z=(e,t)=>{const i=e.length-1,s=[];let r,o=2===t?"<svg>":"",n=R;for(let a=0;a<i;a++){const t=e[a];let i,l,c=-1,h=0;for(;h<t.length&&(n.lastIndex=h,l=n.exec(t),null!==l);)h=n.lastIndex,n===R?"!--"===l[1]?n=N:void 0!==l[1]?n=I:void 0!==l[2]?(L.test(l[2])&&(r=RegExp("</"+l[2],"g")),n=T):void 0!==l[3]&&(n=T):n===T?">"===l[0]?(n=null!=r?r:R,c=-1):void 0===l[1]?c=-2:(c=n.lastIndex-l[2].length,i=l[1],n=void 0===l[3]?T:'"'===l[3]?k:O):n===k||n===O?n=T:n===N||n===I?n=R:(n=T,r=void 0);const d=n===T&&e[a+1].startsWith("/>")?" ":"";o+=n===R?t+A:c>=0?(s.push(i),t.slice(0,c)+w+t.slice(c)+b+d):t+b+(-2===c?(s.push(void 0),a):d)}return[F(e,o+(e[i]||"<?>")+(2===t?"</svg>":"")),s]};class j{constructor({strings:e,_$litType$:t},i){let s;this.parts=[];let r=0,o=0;const n=e.length-1,a=this.parts,[l,c]=z(e,t);if(this.el=j.createElement(l,i),V.currentNode=this.el.content,2===t){const e=this.el.content,t=e.firstChild;t.remove(),e.append(...t.childNodes)}for(;null!==(s=V.nextNode())&&a.length<n;){if(1===s.nodeType){if(s.hasAttributes()){const e=[];for(const t of s.getAttributeNames())if(t.endsWith(w)||t.startsWith(b)){const i=c[o++];if(e.push(t),void 0!==i){const e=s.getAttribute(i.toLowerCase()+w).split(b),t=/([.?@])?(.*)/.exec(i);a.push({type:1,index:r,name:t[2],strings:e,ctor:"."===t[1]?G:"?"===t[1]?X:"@"===t[1]?K:Z})}else a.push({type:6,index:r})}for(const t of e)s.removeAttribute(t)}if(L.test(s.tagName)){const e=s.textContent.split(b),t=e.length-1;if(t>0){s.textContent=$?$.emptyScript:"";for(let i=0;i<t;i++)s.append(e[i],M()),V.nextNode(),a.push({type:2,index:++r});s.append(e[t],M())}}}else if(8===s.nodeType)if(s.data===x)a.push({type:2,index:r});else{let e=-1;for(;-1!==(e=s.data.indexOf(b,e+1));)a.push({type:7,index:r}),e+=b.length-1}r++}}static createElement(e,t){const i=S.createElement("template");return i.innerHTML=e,i}}function W(e,t,i=e,s){var r,o,n,a;if(t===P)return t;let l=void 0!==s?null===(r=i._$Co)||void 0===r?void 0:r[s]:i._$Cl;const c=E(t)?void 0:t._$litDirective$;return(null==l?void 0:l.constructor)!==c&&(null===(o=null==l?void 0:l._$AO)||void 0===o||o.call(l,!1),void 0===c?l=void 0:(l=new c(e),l._$AT(e,i,s)),void 0!==s?(null!==(n=(a=i)._$Co)&&void 0!==n?n:a._$Co=[])[s]=l:i._$Cl=l),void 0!==l&&(t=W(e,l._$AS(e,t.values),l,s)),t}class B{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){var t;const{el:{content:i},parts:s}=this._$AD,r=(null!==(t=null==e?void 0:e.creationScope)&&void 0!==t?t:S).importNode(i,!0);V.currentNode=r;let o=V.nextNode(),n=0,a=0,l=s[0];for(;void 0!==l;){if(n===l.index){let t;2===l.type?t=new q(o,o.nextSibling,this,e):1===l.type?t=new l.ctor(o,l.name,l.strings,this,e):6===l.type&&(t=new Q(o,this,e)),this._$AV.push(t),l=s[++a]}n!==(null==l?void 0:l.index)&&(o=V.nextNode(),n++)}return V.currentNode=S,r}v(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class q{constructor(e,t,i,s){var r;this.type=2,this._$AH=Y,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=s,this._$Cp=null===(r=null==s?void 0:s.isConnected)||void 0===r||r}get _$AU(){var e,t;return null!==(t=null===(e=this._$AM)||void 0===e?void 0:e._$AU)&&void 0!==t?t:this._$Cp}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===(null==e?void 0:e.nodeType)&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=W(this,e,t),E(e)?e===Y||null==e||""===e?(this._$AH!==Y&&this._$AR(),this._$AH=Y):e!==this._$AH&&e!==P&&this._(e):void 0!==e._$litType$?this.g(e):void 0!==e.nodeType?this.$(e):(e=>D(e)||"function"==typeof(null==e?void 0:e[Symbol.iterator]))(e)?this.T(e):this._(e)}k(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}$(e){this._$AH!==e&&(this._$AR(),this._$AH=this.k(e))}_(e){this._$AH!==Y&&E(this._$AH)?this._$AA.nextSibling.data=e:this.$(S.createTextNode(e)),this._$AH=e}g(e){var t;const{values:i,_$litType$:s}=e,r="number"==typeof s?this._$AC(e):(void 0===s.el&&(s.el=j.createElement(F(s.h,s.h[0]),this.options)),s);if((null===(t=this._$AH)||void 0===t?void 0:t._$AD)===r)this._$AH.v(i);else{const e=new B(r,this),t=e.u(this.options);e.v(i),this.$(t),this._$AH=e}}_$AC(e){let t=U.get(e.strings);return void 0===t&&U.set(e.strings,t=new j(e)),t}T(e){D(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,s=0;for(const r of e)s===t.length?t.push(i=new q(this.k(M()),this.k(M()),this,this.options)):i=t[s],i._$AI(r),s++;s<t.length&&(this._$AR(i&&i._$AB.nextSibling,s),t.length=s)}_$AR(e=this._$AA.nextSibling,t){var i;for(null===(i=this._$AP)||void 0===i||i.call(this,!1,!0,t);e&&e!==this._$AB;){const t=e.nextSibling;e.remove(),e=t}}setConnected(e){var t;void 0===this._$AM&&(this._$Cp=e,null===(t=this._$AP)||void 0===t||t.call(this,e))}}class Z{constructor(e,t,i,s,r){this.type=1,this._$AH=Y,this._$AN=void 0,this.element=e,this.name=t,this._$AM=s,this.options=r,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=Y}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(e,t=this,i,s){const r=this.strings;let o=!1;if(void 0===r)e=W(this,e,t,0),o=!E(e)||e!==this._$AH&&e!==P,o&&(this._$AH=e);else{const s=e;let n,a;for(e=r[0],n=0;n<r.length-1;n++)a=W(this,s[i+n],t,n),a===P&&(a=this._$AH[n]),o||(o=!E(a)||a!==this._$AH[n]),a===Y?e=Y:e!==Y&&(e+=(null!=a?a:"")+r[n+1]),this._$AH[n]=a}o&&!s&&this.j(e)}j(e){e===Y?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=e?e:"")}}class G extends Z{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===Y?void 0:e}}const J=$?$.emptyScript:"";class X extends Z{constructor(){super(...arguments),this.type=4}j(e){e&&e!==Y?this.element.setAttribute(this.name,J):this.element.removeAttribute(this.name)}}class K extends Z{constructor(e,t,i,s,r){super(e,t,i,s,r),this.type=5}_$AI(e,t=this){var i;if((e=null!==(i=W(this,e,t,0))&&void 0!==i?i:Y)===P)return;const s=this._$AH,r=e===Y&&s!==Y||e.capture!==s.capture||e.once!==s.once||e.passive!==s.passive,o=e!==Y&&(s===Y||r);r&&this.element.removeEventListener(this.name,this,s),o&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){var t,i;"function"==typeof this._$AH?this._$AH.call(null!==(i=null===(t=this.options)||void 0===t?void 0:t.host)&&void 0!==i?i:this.element,e):this._$AH.handleEvent(e)}}class Q{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){W(this,e)}}const ee=_.litHtmlPolyfillSupport;null==ee||ee(j,q),(null!==(g=_.litHtmlVersions)&&void 0!==g?g:_.litHtmlVersions=[]).push("2.8.0");var te,ie;class se extends v{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var e,t;const i=super.createRenderRoot();return null!==(e=(t=this.renderOptions).renderBefore)&&void 0!==e||(t.renderBefore=i.firstChild),i}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,i)=>{var s,r;const o=null!==(s=null==i?void 0:i.renderBefore)&&void 0!==s?s:t;let n=o._$litPart$;if(void 0===n){const e=null!==(r=null==i?void 0:i.renderBefore)&&void 0!==r?r:null;o._$litPart$=n=new q(t.insertBefore(M(),e),e,void 0,null!=i?i:{})}return n._$AI(e),n})(t,this.renderRoot,this.renderOptions)}connectedCallback(){var e;super.connectedCallback(),null===(e=this._$Do)||void 0===e||e.setConnected(!0)}disconnectedCallback(){var e;super.disconnectedCallback(),null===(e=this._$Do)||void 0===e||e.setConnected(!1)}render(){return P}}se.finalized=!0,se._$litElement$=!0,null===(te=globalThis.litElementHydrateSupport)||void 0===te||te.call(globalThis,{LitElement:se});const re=globalThis.litElementPolyfillSupport;var oe;null==re||re({LitElement:se}),(null!==(ie=globalThis.litElementVersions)&&void 0!==ie?ie:globalThis.litElementVersions=[]).push("3.3.3"),null===(oe=window.HTMLSlotElement)||void 0===oe||oe.prototype.assignedElements,console.warn("The main 'lit-element' module entrypoint is deprecated. Please update your imports to use the 'lit' package: 'lit' and 'lit/decorators.ts' or import from 'lit-element/lit-element.ts'. See https://lit.dev/msg/deprecated-import-path for more information.");"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self&&self;function ne(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}var ae={exports:{}};ae.exports=function(){var e=1e3,t=6e4,i=36e5,s="millisecond",r="second",o="minute",n="hour",a="day",l="week",c="month",h="quarter",d="year",u="date",f="Invalid Date",p=/^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/,m=/\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,v={name:"en",weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_"),ordinal:function(e){var t=["th","st","nd","rd"],i=e%100;return"["+e+(t[(i-20)%10]||t[i]||t[0])+"]"}},g=function(e,t,i){var s=String(e);return!s||s.length>=t?e:""+Array(t+1-s.length).join(i)+e},_={s:g,z:function(e){var t=-e.utcOffset(),i=Math.abs(t),s=Math.floor(i/60),r=i%60;return(t<=0?"+":"-")+g(s,2,"0")+":"+g(r,2,"0")},m:function e(t,i){if(t.date()<i.date())return-e(i,t);var s=12*(i.year()-t.year())+(i.month()-t.month()),r=t.clone().add(s,c),o=i-r<0,n=t.clone().add(s+(o?-1:1),c);return+(-(s+(i-r)/(o?r-n:n-r))||0)},a:function(e){return e<0?Math.ceil(e)||0:Math.floor(e)},p:function(e){return{M:c,y:d,w:l,d:a,D:u,h:n,m:o,s:r,ms:s,Q:h}[e]||String(e||"").toLowerCase().replace(/s$/,"")},u:function(e){return void 0===e}},$="en",y={};y[$]=v;var w="$isDayjsObject",b=function(e){return e instanceof M||!(!e||!e[w])},x=function e(t,i,s){var r;if(!t)return $;if("string"==typeof t){var o=t.toLowerCase();y[o]&&(r=o),i&&(y[o]=i,r=o);var n=t.split("-");if(!r&&n.length>1)return e(n[0])}else{var a=t.name;y[a]=t,r=a}return!s&&r&&($=r),r||!s&&$},A=function(e,t){if(b(e))return e.clone();var i="object"==typeof t?t:{};return i.date=e,i.args=arguments,new M(i)},S=_;S.l=x,S.i=b,S.w=function(e,t){return A(e,{locale:t.$L,utc:t.$u,x:t.$x,$offset:t.$offset})};var M=function(){function v(e){this.$L=x(e.locale,null,!0),this.parse(e),this.$x=this.$x||e.x||{},this[w]=!0}var g=v.prototype;return g.parse=function(e){this.$d=function(e){var t=e.date,i=e.utc;if(null===t)return new Date(NaN);if(S.u(t))return new Date;if(t instanceof Date)return new Date(t);if("string"==typeof t&&!/Z$/i.test(t)){var s=t.match(p);if(s){var r=s[2]-1||0,o=(s[7]||"0").substring(0,3);return i?new Date(Date.UTC(s[1],r,s[3]||1,s[4]||0,s[5]||0,s[6]||0,o)):new Date(s[1],r,s[3]||1,s[4]||0,s[5]||0,s[6]||0,o)}}return new Date(t)}(e),this.init()},g.init=function(){var e=this.$d;this.$y=e.getFullYear(),this.$M=e.getMonth(),this.$D=e.getDate(),this.$W=e.getDay(),this.$H=e.getHours(),this.$m=e.getMinutes(),this.$s=e.getSeconds(),this.$ms=e.getMilliseconds()},g.$utils=function(){return S},g.isValid=function(){return!(this.$d.toString()===f)},g.isSame=function(e,t){var i=A(e);return this.startOf(t)<=i&&i<=this.endOf(t)},g.isAfter=function(e,t){return A(e)<this.startOf(t)},g.isBefore=function(e,t){return this.endOf(t)<A(e)},g.$g=function(e,t,i){return S.u(e)?this[t]:this.set(i,e)},g.unix=function(){return Math.floor(this.valueOf()/1e3)},g.valueOf=function(){return this.$d.getTime()},g.startOf=function(e,t){var i=this,s=!!S.u(t)||t,h=S.p(e),f=function(e,t){var r=S.w(i.$u?Date.UTC(i.$y,t,e):new Date(i.$y,t,e),i);return s?r:r.endOf(a)},p=function(e,t){return S.w(i.toDate()[e].apply(i.toDate("s"),(s?[0,0,0,0]:[23,59,59,999]).slice(t)),i)},m=this.$W,v=this.$M,g=this.$D,_="set"+(this.$u?"UTC":"");switch(h){case d:return s?f(1,0):f(31,11);case c:return s?f(1,v):f(0,v+1);case l:var $=this.$locale().weekStart||0,y=(m<$?m+7:m)-$;return f(s?g-y:g+(6-y),v);case a:case u:return p(_+"Hours",0);case n:return p(_+"Minutes",1);case o:return p(_+"Seconds",2);case r:return p(_+"Milliseconds",3);default:return this.clone()}},g.endOf=function(e){return this.startOf(e,!1)},g.$set=function(e,t){var i,l=S.p(e),h="set"+(this.$u?"UTC":""),f=(i={},i[a]=h+"Date",i[u]=h+"Date",i[c]=h+"Month",i[d]=h+"FullYear",i[n]=h+"Hours",i[o]=h+"Minutes",i[r]=h+"Seconds",i[s]=h+"Milliseconds",i)[l],p=l===a?this.$D+(t-this.$W):t;if(l===c||l===d){var m=this.clone().set(u,1);m.$d[f](p),m.init(),this.$d=m.set(u,Math.min(this.$D,m.daysInMonth())).$d}else f&&this.$d[f](p);return this.init(),this},g.set=function(e,t){return this.clone().$set(e,t)},g.get=function(e){return this[S.p(e)]()},g.add=function(s,h){var u,f=this;s=Number(s);var p=S.p(h),m=function(e){var t=A(f);return S.w(t.date(t.date()+Math.round(e*s)),f)};if(p===c)return this.set(c,this.$M+s);if(p===d)return this.set(d,this.$y+s);if(p===a)return m(1);if(p===l)return m(7);var v=(u={},u[o]=t,u[n]=i,u[r]=e,u)[p]||1,g=this.$d.getTime()+s*v;return S.w(g,this)},g.subtract=function(e,t){return this.add(-1*e,t)},g.format=function(e){var t=this,i=this.$locale();if(!this.isValid())return i.invalidDate||f;var s=e||"YYYY-MM-DDTHH:mm:ssZ",r=S.z(this),o=this.$H,n=this.$m,a=this.$M,l=i.weekdays,c=i.months,h=i.meridiem,d=function(e,i,r,o){return e&&(e[i]||e(t,s))||r[i].slice(0,o)},u=function(e){return S.s(o%12||12,e,"0")},p=h||function(e,t,i){var s=e<12?"AM":"PM";return i?s.toLowerCase():s};return s.replace(m,(function(e,s){return s||function(e){switch(e){case"YY":return String(t.$y).slice(-2);case"YYYY":return S.s(t.$y,4,"0");case"M":return a+1;case"MM":return S.s(a+1,2,"0");case"MMM":return d(i.monthsShort,a,c,3);case"MMMM":return d(c,a);case"D":return t.$D;case"DD":return S.s(t.$D,2,"0");case"d":return String(t.$W);case"dd":return d(i.weekdaysMin,t.$W,l,2);case"ddd":return d(i.weekdaysShort,t.$W,l,3);case"dddd":return l[t.$W];case"H":return String(o);case"HH":return S.s(o,2,"0");case"h":return u(1);case"hh":return u(2);case"a":return p(o,n,!0);case"A":return p(o,n,!1);case"m":return String(n);case"mm":return S.s(n,2,"0");case"s":return String(t.$s);case"ss":return S.s(t.$s,2,"0");case"SSS":return S.s(t.$ms,3,"0");case"Z":return r}return null}(e)||r.replace(":","")}))},g.utcOffset=function(){return 15*-Math.round(this.$d.getTimezoneOffset()/15)},g.diff=function(s,u,f){var p,m=this,v=S.p(u),g=A(s),_=(g.utcOffset()-this.utcOffset())*t,$=this-g,y=function(){return S.m(m,g)};switch(v){case d:p=y()/12;break;case c:p=y();break;case h:p=y()/3;break;case l:p=($-_)/6048e5;break;case a:p=($-_)/864e5;break;case n:p=$/i;break;case o:p=$/t;break;case r:p=$/e;break;default:p=$}return f?p:S.a(p)},g.daysInMonth=function(){return this.endOf(c).$D},g.$locale=function(){return y[this.$L]},g.locale=function(e,t){if(!e)return this.$L;var i=this.clone(),s=x(e,t,!0);return s&&(i.$L=s),i},g.clone=function(){return S.w(this.$d,this)},g.toDate=function(){return new Date(this.valueOf())},g.toJSON=function(){return this.isValid()?this.toISOString():null},g.toISOString=function(){return this.$d.toISOString()},g.toString=function(){return this.$d.toUTCString()},v}(),E=M.prototype;return A.prototype=E,[["$ms",s],["$s",r],["$m",o],["$H",n],["$W",a],["$M",c],["$y",d],["$D",u]].forEach((function(e){E[e[1]]=function(t){return this.$g(t,e[0],e[1])}})),A.extend=function(e,t){return e.$i||(e(t,M,A),e.$i=!0),A},A.locale=x,A.isDayjs=b,A.unix=function(e){return A(1e3*e)},A.en=y[$],A.Ls=y,A.p={},A}();var le=ne(ae.exports),ce={exports:{}};ce.exports=function(){var e={LTS:"h:mm:ss A",LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D, YYYY",LLL:"MMMM D, YYYY h:mm A",LLLL:"dddd, MMMM D, YYYY h:mm A"},t=/(\[[^[]*\])|([-_:/.,()\s]+)|(A|a|YYYY|YY?|MM?M?M?|Do|DD?|hh?|HH?|mm?|ss?|S{1,3}|z|ZZ?)/g,i=/\d\d/,s=/\d\d?/,r=/\d*[^-_:/,()\s\d]+/,o={},n=function(e){return(e=+e)+(e>68?1900:2e3)},a=function(e){return function(t){this[e]=+t}},l=[/[+-]\d\d:?(\d\d)?|Z/,function(e){(this.zone||(this.zone={})).offset=function(e){if(!e)return 0;if("Z"===e)return 0;var t=e.match(/([+-]|\d\d)/g),i=60*t[1]+(+t[2]||0);return 0===i?0:"+"===t[0]?-i:i}(e)}],c=function(e){var t=o[e];return t&&(t.indexOf?t:t.s.concat(t.f))},h=function(e,t){var i,s=o.meridiem;if(s){for(var r=1;r<=24;r+=1)if(e.indexOf(s(r,0,t))>-1){i=r>12;break}}else i=e===(t?"pm":"PM");return i},d={A:[r,function(e){this.afternoon=h(e,!1)}],a:[r,function(e){this.afternoon=h(e,!0)}],S:[/\d/,function(e){this.milliseconds=100*+e}],SS:[i,function(e){this.milliseconds=10*+e}],SSS:[/\d{3}/,function(e){this.milliseconds=+e}],s:[s,a("seconds")],ss:[s,a("seconds")],m:[s,a("minutes")],mm:[s,a("minutes")],H:[s,a("hours")],h:[s,a("hours")],HH:[s,a("hours")],hh:[s,a("hours")],D:[s,a("day")],DD:[i,a("day")],Do:[r,function(e){var t=o.ordinal,i=e.match(/\d+/);if(this.day=i[0],t)for(var s=1;s<=31;s+=1)t(s).replace(/\[|\]/g,"")===e&&(this.day=s)}],M:[s,a("month")],MM:[i,a("month")],MMM:[r,function(e){var t=c("months"),i=(c("monthsShort")||t.map((function(e){return e.slice(0,3)}))).indexOf(e)+1;if(i<1)throw new Error;this.month=i%12||i}],MMMM:[r,function(e){var t=c("months").indexOf(e)+1;if(t<1)throw new Error;this.month=t%12||t}],Y:[/[+-]?\d+/,a("year")],YY:[i,function(e){this.year=n(e)}],YYYY:[/\d{4}/,a("year")],Z:l,ZZ:l};function u(i){var s,r;s=i,r=o&&o.formats;for(var n=(i=s.replace(/(\[[^\]]+])|(LTS?|l{1,4}|L{1,4})/g,(function(t,i,s){var o=s&&s.toUpperCase();return i||r[s]||e[s]||r[o].replace(/(\[[^\]]+])|(MMMM|MM|DD|dddd)/g,(function(e,t,i){return t||i.slice(1)}))}))).match(t),a=n.length,l=0;l<a;l+=1){var c=n[l],h=d[c],u=h&&h[0],f=h&&h[1];n[l]=f?{regex:u,parser:f}:c.replace(/^\[|\]$/g,"")}return function(e){for(var t={},i=0,s=0;i<a;i+=1){var r=n[i];if("string"==typeof r)s+=r.length;else{var o=r.regex,l=r.parser,c=e.slice(s),h=o.exec(c)[0];l.call(t,h),e=e.replace(h,"")}}return function(e){var t=e.afternoon;if(void 0!==t){var i=e.hours;t?i<12&&(e.hours+=12):12===i&&(e.hours=0),delete e.afternoon}}(t),t}}return function(e,t,i){i.p.customParseFormat=!0,e&&e.parseTwoDigitYear&&(n=e.parseTwoDigitYear);var s=t.prototype,r=s.parse;s.parse=function(e){var t=e.date,s=e.utc,n=e.args;this.$u=s;var a=n[1];if("string"==typeof a){var l=!0===n[2],c=!0===n[3],h=l||c,d=n[2];c&&(d=n[2]),o=this.$locale(),!l&&d&&(o=i.Ls[d]),this.$d=function(e,t,i){try{if(["x","X"].indexOf(t)>-1)return new Date(("X"===t?1e3:1)*e);var s=u(t)(e),r=s.year,o=s.month,n=s.day,a=s.hours,l=s.minutes,c=s.seconds,h=s.milliseconds,d=s.zone,f=new Date,p=n||(r||o?1:f.getDate()),m=r||f.getFullYear(),v=0;r&&!o||(v=o>0?o-1:f.getMonth());var g=a||0,_=l||0,$=c||0,y=h||0;return d?new Date(Date.UTC(m,v,p,g,_,$,y+60*d.offset*1e3)):i?new Date(Date.UTC(m,v,p,g,_,$,y)):new Date(m,v,p,g,_,$,y)}catch(e){return new Date("")}}(t,a,s),this.init(),d&&!0!==d&&(this.$L=this.locale(d).$L),h&&t!=this.format(a)&&(this.$d=new Date("")),o={}}else if(a instanceof Array)for(var f=a.length,p=1;p<=f;p+=1){n[1]=a[p-1];var m=i.apply(this,n);if(m.isValid()){this.$d=m.$d,this.$L=m.$L,this.init();break}p===f&&(this.$d=new Date(""))}else r.call(this,e)}}}();var he=ne(ce.exports),de={exports:{}};de.exports=function(e,t,i){e=e||{};var s=t.prototype,r={future:"in %s",past:"%s ago",s:"a few seconds",m:"a minute",mm:"%d minutes",h:"an hour",hh:"%d hours",d:"a day",dd:"%d days",M:"a month",MM:"%d months",y:"a year",yy:"%d years"};function o(e,t,i,r){return s.fromToBase(e,t,i,r)}i.en.relativeTime=r,s.fromToBase=function(t,s,o,n,a){for(var l,c,h,d=o.$locale().relativeTime||r,u=e.thresholds||[{l:"s",r:44,d:"second"},{l:"m",r:89},{l:"mm",r:44,d:"minute"},{l:"h",r:89},{l:"hh",r:21,d:"hour"},{l:"d",r:35},{l:"dd",r:25,d:"day"},{l:"M",r:45},{l:"MM",r:10,d:"month"},{l:"y",r:17},{l:"yy",d:"year"}],f=u.length,p=0;p<f;p+=1){var m=u[p];m.d&&(l=n?i(t).diff(o,m.d,!0):o.diff(t,m.d,!0));var v=(e.rounding||Math.round)(Math.abs(l));if(h=l>0,v<=m.r||!m.r){v<=1&&p>0&&(m=u[p-1]);var g=d[m.l];a&&(v=a(""+v)),c="string"==typeof g?g.replace("%d",v):g(v,s,m.l,h);break}}if(s)return c;var _=h?d.future:d.past;return"function"==typeof _?_(c):_.replace("%s",c)},s.to=function(e,t){return o(e,t,this,!0)},s.from=function(e,t){return o(e,t,this)};var n=function(e){return e.$u?i.utc():i()};s.toNow=function(e){return this.to(n(this),e)},s.fromNow=function(e){return this.from(n(this),e)}};var ue=ne(de.exports);customElements.define("gallery-card",class extends se{static get properties(){return{_hass:{},config:{},resources:{},currentResourceIndex:{},selectedDate:{}}}render(){const e=(this.config.menu_alignment||"responsive").toLowerCase();return H`
      ${void 0===this.errors?H``:this.errors.map((e=>H`<hui-warning>${e}</hui-warning>`))}
      <ha-card .header=${this.config.title} class="menu-${e}">
        ${void 0!==this.currentResourceIndex&&this.config.enable_date_search?H`<input type="date" class="date-picker" @change="${this._handleDateChange}" value="${this._formatDateForInput(this.selectedDate)}">`:H``}
        ${void 0!==this.currentResourceIndex&&this.config.show_reload?H`<ha-progress-button class="btn-reload" @click="${()=>this._loadResources(this._hass)}">Reload</ha-progress-button>`:H``}
        <div class="resource-viewer" @touchstart="${e=>this._handleTouchStart(e)}" @touchmove="${e=>this._handleTouchMove(e)}">
          <figure style="margin:5px;">
            ${this._currentResource().isHass?H`
                  <hui-image @click="${e=>this._popupCamera(e)}"
                                      .hass=${this._hass}
                                      .cameraImage=${this._currentResource().name}
                                      .cameraView=${"live"}
                                    ></hui-image>
                `:this._isImageExtension(this._currentResource().extension)?H`<img @click="${e=>this._popupImage(e)}" src="${this._currentResource().url}"/>`:H`<video controls ?loop=${this.config.video_loop} ?autoplay=${this.config.video_autoplay} src="${this._currentResource().url}#t=0.1" @loadedmetadata="${e=>this._videoMetadataLoaded(e)}" @canplay="${e=>this._startVideo(e)}" 
                            @ended="${()=>this._videoHasEnded()}" preload="metadata"></video>`}
            <figcaption>${this._currentResource().caption} 
              ${this._isImageExtension(this._currentResource().extension)?H``:H`<span class="duration"></span> `}                  
              ${this.config.show_zoom?H`<a href= "${this._currentResource().url}" target="_blank">Zoom</a>`:H``}                  
            </figcaption>
          </figure>  
          <button class="btn btn-left" @click="${()=>this._selectResource(this.currentResourceIndex-1)}">&lt;</button> 
          <button class="btn btn-right" @click="${()=>this._selectResource(this.currentResourceIndex+1)}">&gt;</button> 
        </div>
        <div class="resource-menu">
          ${this.resources.map(((e,t)=>H`
                  <figure style="margin:5px;" id="resource${t}" data-imageIndex="${t}" @click="${()=>this._selectResource(t)}" class="${t===this.currentResourceIndex?"selected":""}">
                  ${e.isHass?H`
                        <hui-image
                          .hass=${this._hass}
                          .cameraImage=${e.name}
                          .cameraView=${"live"}
                        ></hui-image>
                      `:this._isImageExtension(e.extension)?H`<img class="lzy_img" src="/local/community/gallery-card/placeholder.jpg" data-src="${e.url}"/>`:this.config.video_preload??1?H`<video preload="none" data-src="${e.url}#t=${void 0===this.config.preview_video_at?.1:this.config.preview_video_at}" @loadedmetadata="${e=>this._videoMetadataLoaded(e)}" @canplay="${()=>this._downloadNextMenuVideo()}" preload="metadata"></video>`:H`<div style="text-align: center"><div class="lzy_img"><ha-icon id="play" icon="mdi:movie-play-outline"></ha-icon></div></div>`}
                  <figcaption>${e.caption} <span class="duration"></span></figcaption>
                  </figure>
                `))}
        </div>
        <div id="imageModal" class="modal" @touchstart="${e=>this._handleTouchStart(e)}" @touchmove="${e=>this._handleTouchMove(e)}">
          <img class="modal-content" id="popupImage">
          <div id="popupCaption"></div>
        </div>
      </ha-card>
    `}_downloadingVideos=!1;updated(e){const t=this.shadowRoot.querySelectorAll("img.lzy_img");for(const s of t)this.imageObserver.observe(s);const i=this.shadowRoot.querySelectorAll("video.lzy_video");for(const s of i)this.imageObserver.observe(s);this._downloadingVideos||this._downloadNextMenuVideo()}async _downloadNextMenuVideo(){this._downloadingVideos=!0;const e=this.shadowRoot.querySelector(".resource-menu figure video[data-src]");if(e){await new Promise((e=>setTimeout(e,100)));const t=e.dataset.src;delete e.dataset.src,e.src=t,e.load()}else this._downloadingVideos=!1}setConfig(e){if(le.extend(he),le.extend(ue),this.imageObserver=new IntersectionObserver((e=>{for(const t of e)if(t.isIntersecting){const e=t.target;e.src=e.dataset.src}})),!e.entity&&!e.entities)throw new Error("Required configuration for entities is missing");this.config=e,this.config.entity&&(this.config.entities||(this.config={...this.config,entities:[]}),this.config.entities.push(this.config.entity),delete this.config.entity),void 0!==this._hass&&this._loadResources(this._hass),this._doSlideShow(!0)}set hass(e){this._hass=e,void 0===this.resources&&this._loadResources(this._hass)}getCardSize(){return 1}_isImageExtension(e){return e.match(/(jpeg|jpg|gif|png|tiff|bmp)$/)}_doSlideShow(e){if(!e){const e=this.config.slideshow_every_other?Number.parseInt(this.config.slideshow_every_other,10):1;this.config.reverse_slideshow?this._selectResource(this.currentResourceIndex-e,!0):this._selectResource(this.currentResourceIndex+e,!0)}if(this.config.slideshow_timer){const e=Number.parseFloat(this.config.slideshow_timer);!Number.isNaN(e)&&e>0&&setTimeout((()=>{this._doSlideShow()}),1e3*e)}}_selectResource(e,t){this.autoPlayVideo=!0;let i=e;if(e<0?i=this.resources.length-1:e>=this.resources.length&&(i=0),this.currentResourceIndex=i,this._loadImageForPopup(),t&&this.parentNode&&this.parentNode.tagName&&"hui-card-preview"===this.parentNode.tagName.toLowerCase())return;const s=this.shadowRoot.querySelector("#resource"+this.currentResourceIndex);s&&s.scrollIntoView({behavior:"smooth",block:"nearest",inline:"nearest"})}_getResource(e){return void 0!==this.resources&&void 0!==e&&this.resources.length>0?this.resources[e]:{url:"",name:"",extension:"jpg",caption:void 0===e?"Loading resources...":"No images or videos to display",index:0}}_currentResource(){return this._getResource(this.currentResourceIndex)}_startVideo(e){this.autoPlayVideo&&e.target.play()}_videoMetadataLoaded(e){const t=this.config.show_duration??!0;!Number.isNaN(Number.parseInt(e.target.duration))&&t&&(e.target.parentNode.querySelector(".duration").innerHTML="["+this._getFormattedVideoDuration(e.target.duration)+"]"),this.config.video_muted&&(e.target.muted="muted")}_videoHasEnded(){this.config.slideshow_video_end&&this._doSlideShow()}_popupCamera(){const e=new Event("hass-more-info",{bubbles:!0,composed:!0});e.detail={entityId:this._currentResource().name},this.dispatchEvent(e)}_popupImage(){const e=this.shadowRoot.querySelector("#imageModal");e.style.display="block",this._loadImageForPopup(),e.scrollIntoView(!0),e.addEventListener("click",(function(){e.style.display="none"}))}_loadImageForPopup(){const e=this.shadowRoot.querySelector("#imageModal"),t=this.shadowRoot.querySelector("#popupImage"),i=this.shadowRoot.querySelector("#popupCaption");"block"===e.style.display&&(t.src=this._currentResource().url,i.innerHTML=this._currentResource().caption)}_getFormattedVideoDuration(e){let t=Number.parseInt(e/60);t<10&&(t="0"+t);let i=Number.parseInt(e%60);return i="0"+i,i=i.slice(Math.max(0,i.length-2)),t+":"+i}_keyNavigation(e){switch(e.code){case"ArrowDown":case"ArrowRight":this._selectResource(this.currentResourceIndex+1);break;case"ArrowUp":case"ArrowLeft":this._selectResource(this.currentResourceIndex-1)}}_handleTouchStart(e){this.xDown=e.touches[0].clientX,this.yDown=e.touches[0].clientY}_handleTouchMove(e){if(!this.xDown||!this.yDown)return;const t=e.touches[0].clientX,i=e.touches[0].clientY,s=this.xDown-t,r=this.yDown-i;Math.abs(s)>Math.abs(r)&&(s>0?(this._selectResource(this.currentResourceIndex+1),e.preventDefault()):(this._selectResource(this.currentResourceIndex-1),e.preventDefault())),this.xDown=void 0,this.yDown=void 0}_handleDateChange(e){this.selectedDate=e.target.valueAsDate,this._loadResources(this._hass)}_loadResources(e){const t=[];this.currentResourceIndex=void 0,this.resources=[],void 0===this.selectedDate&&(this.selectedDate=new Date);const i=this.config.maximum_files_per_entity??!0,s=i?this.config.maximum_files:void 0,r=i?void 0:this.config.maximum_files;let o=this.config.folder_format,n=this.config.file_name_format,a=this.config.file_name_date_begins,l=this.config.caption_format;const c=this.config.parsed_date_sort??!1,h=this.config.reverse_sort??!0,d=this.config.random_sort??!1,u=this.config.enable_date_search??!1;for(const f of this.config.entities){let i,r=!1,c=!0,d=!0;if("object"==typeof f?(i=f.path,f.recursive&&(r=f.recursive),void 0!==f.include_video&&(c=f.include_video),void 0!==f.include_images&&(d=f.include_images),f.folder_format&&(o=f.folder_format),f.file_name_format&&(n=f.file_name_format),f.file_name_date_begins&&(a=f.file_name_date_begins),f.caption_format&&(l=f.caption_format)):i=f,"media-source://"===i.substring(0,15).toLowerCase())t.push(this._loadMediaResource(e,i,s,o,n,a,l,r,h,c,d,u));else{const r=e.states[i];void 0===r?t.push(Promise.resolve({error:!0,entity:i,message:"Invalid Entity ID"})):(void 0!==r.attributes.entity_picture&&t.push(this._loadCameraResource(i,r)),void 0!==r.attributes.fileList&&t.push(this._loadFilesResources(r.attributes.fileList,s,n,a,l,h)),void 0!==r.attributes.file_list&&t.push(this._loadFilesResources(r.attributes.file_list,s,n,a,l,h)))}}Promise.all(t).then((e=>{if(this.resources=e.filter((e=>!e.error)).flat(Number.POSITIVE_INFINITY),c&&(h?this.resources.sort((function(e,t){return t.date-e.date})):this.resources.sort((function(e,t){return e.date-t.date}))),d)for(let t=this.resources.length-1;t>0;t--){const e=Math.floor(Math.random()*(t+1));t!==e&&([this.resources[t],this.resources[e]]=[this.resources[e],this.resources[t]])}void 0!==r&&!Number.isNaN(r)&&r<this.resources.length&&(this.resources=this.resources.filter((function(e){return!!e.isHass||this.count<r&&(this.count++,!0)}),{count:e.filter((e=>e.isHass)).length})),this.currentResourceIndex=0,this.parentNode&&this.parentNode.tagName&&"hui-card-preview"===this.parentNode.tagName.toLowerCase()||document.addEventListener("keydown",(e=>this._keyNavigation(e))),this.errors=[];for(const t of e.filter((e=>e.error)).flat(Number.POSITIVE_INFINITY))this.errors.push(t.message+" "+t.entity),this._hass.callService("system_log","write",{message:"Gallery Card Error:  "+t.message+"   "+t.entity})}))}_loadMediaResource(e,t,i,s,r,o,n,a,l,c,h,d){return new Promise((async u=>{let f=t;try{let m=[];if(s&&l&&void 0!==i&&!Number.isNaN(i)){let r=le(),o="";const n=[];for(;m.length<i;){const a=r.format(s);if(f=t+"/"+a,a!==o)try{const t=await this._loadMedia(this,e,f,i,!1,l,c,h,d);m.push(...t)}catch(p){if("browse_media_failed"!==p.code)throw p;n.push(f)}if(n.length>2){if(0===m.length)throw f=n.join(","),new Error("Failed to browse several folders and found no media files.  Verify your settings are correct.");break}o=a,r=r.subtract(12,"hour")}m.length>i&&(m.length=i)}else m=await this._loadMedia(this,e,f,i,a,l,c,h,d);const v=[];for(const e of m){const t=this._createFileResource(e.authenticated_path,r,o,n);void 0!==t&&v.push(t)}u(v)}catch(p){console.log(p),u({error:!0,entity:f,message:p.message})}}))}_loadMedia(e,t,i,s,r,o,n,a,l){const c={media_class:"directory",media_content_id:i};return"/"!==i.substring(i.length-1,i.length)&&"media-source://media_source"!==i&&(c.media_content_id+="/"),Promise.all(this._fetchMedia(e,t,c,r,n,a,l)).then((function(i){let r=i.flat(Number.POSITIVE_INFINITY);if(e.config.filter_regex){const t=new RegExp(e.config.filter_regex);r=r.filter((e=>e.title.match(t)))}return r=r.filter((function(e){return void 0!==e})),r.sort((function(e,t){return e.title>t.title?1:e.title<t.title?-1:0})),o&&r.reverse(),void 0!==s&&!Number.isNaN(s)&&s<r.length&&(r.length=s),Promise.all(r.map((function(i){return e._fetchMediaItem(t,i.media_content_id).then((function(e){return{...i,authenticated_path:e.url}}))})))}))}_fetchMedia(e,t,i,s,r,o,n){const a=[];return"directory"===i.media_class&&(i.children?a.push(...i.children.filter((t=>(r&&"video"===t.media_class||o&&"image"===t.media_class||s&&"directory"===t.media_class&&(!n||t.title===e._folderDateFormatter(void 0===e.config.search_date_folder_format?"DD_MM_YYYY":e.config.search_date_folder_format,e.selectedDate)))&&"@eaDir/"!==t.title)).map((i=>Promise.all(e._fetchMedia(e,t,i,s,r,o,n))))):a.push(e._fetchMediaContents(t,i.media_content_id).then((i=>Promise.all(e._fetchMedia(e,t,i,s,r,o,n)))))),"directory"!==i.media_class&&a.push(Promise.resolve(i)),a}_fetchMediaContents(e,t){return e.callWS({type:"media_source/browse_media",media_content_id:t})}_fetchMediaItem(e,t){return e.callWS({type:"media_source/resolve_media",media_content_id:t,expires:10800})}_loadCameraResource(e,t){const i={url:t.attributes.entity_picture,name:e,extension:"jpg",caption:t.attributes.friendly_name??e,isHass:!0};return Promise.resolve(i)}_loadFilesResources(e,t,i,s,r,o){const n=[];if(e){e=e.filter((e=>!e.includes("@eaDir"))),o&&e.reverse(),void 0!==t&&!Number.isNaN(t)&&t<e.length&&(e.length=t);for(const t of e){const e=t;let o=e.replace("/config/www/","/local/");e.includes("/config/www/")||(o="/local/"+e.slice(Math.max(0,e.indexOf("/www/")+5)));const a=this._createFileResource(o,i,s,r);void 0!==a&&n.push(a)}}return Promise.resolve(n)}_createFileResource(e,t,i,s){let r;const o=e.split("?")[0];let n=o.split("/").at(-1),a="",l="";if("@eaDir"!==n){const c=n.split(".").at(-1).toLowerCase();n=n.slice(0,Math.max(0,n.length-c.length-1)),n=decodeURIComponent(n)," "!==s&&(l=n);let h=n;i&&!Number.isNaN(Number.parseInt(i))&&(h=h.slice(Math.max(0,Number.parseInt(i)-1))),console.log(h),t&&(a=le(h,t)),a&&s&&("AGO"===s.toUpperCase().trim()?l=a.fromNow():(l=a.format(s),l=l.replaceAll(/ago/gi,a.fromNow()))),r={url:e,base_url:o,name:n,extension:c,caption:l,index:-1,date:a}}return r}_folderDateFormatter(e,t){return le(t).format(e)}_formatDateForInput(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}static get styles(){return o`
      .content {
        overflow: hidden;
      }
      .content hui-card-preview {
        max-width: 100%;
      }
      ha-card {
        height: 100%;
        overflow: hidden;
      }
      .btn-reload {
        float: right;
        margin-right: 25px;
        text-align: right;
      }
      .date-picker {
        padding-left: 5px;
        margin-left: 5px;
        margin-top: 8px;
      }
      figcaption {
        text-align:center;
        white-space: nowrap;
      }
      img, video {
        width: 100%;
        object-fit: contain;
      }
      .resource-viewer .btn {
        position: absolute;
        transform: translate(-50%, -50%);
        -ms-transform: translate(-50%, -50%);
        background-color: #555;
        color: white;
        font-size: 16px;
        padding: 12px 12px;
        border: none;
        cursor: pointer;
        border-radius: 5px;
        opacity: 0;
        transition: opacity .35s ease;
      }
      .resource-viewer:hover .btn {
        opacity: 1;
      }
      .resource-viewer .btn-left {
        left: 0%;
        margin-left: 25px;
      }
      .resource-viewer .btn-right {
        right: 0%;
        margin-right: -10px
      }
      figure.selected {
        opacity: 0.5;
      }
      .duration {
        font-style:italic;
      }
      @media all and (max-width: 599px) {
        .menu-responsive .resource-viewer {
          width: 100%;
        }
        .menu-responsive .resource-viewer .btn {
          top: 33%;
        }
        .menu-responsive .resource-menu {
          width:100%; 
          overflow-y: hidden;
          overflow-x: scroll;
          display: flex;
        }
        .menu-responsive .resource-menu figure {
          margin: 0px;
          padding: 12px;
        }
      }
      @media all and (min-width: 600px) {
        .menu-responsive .resource-viewer {
          float: left;
          width: 75%;
          position: relative;
        }
        .menu-responsive .resource-viewer .btn {
          top: 40%;
        }
                
        .menu-responsive .resource-menu {
          width:25%; 
          height: calc(100vh - 120px);
          overflow-y: scroll; 
          float: right;
        }
      }
      .menu-bottom .resource-viewer {
        width: 100%;
      }
      .menu-bottom .resource-viewer .btn {
        top: 33%;
      }
      .menu-bottom .resource-menu {
        width:100%; 
        overflow-y: hidden;
        overflow-x: scroll;
        display: flex;
      }
      .menu-bottom .resource-menu figure {
        margin: 0px;
        padding: 12px;
        width: 25%;
      }
      .menu-bottom .resource-viewer figure img,
      .menu-bottom .resource-viewer figure video {
        max-height: 70vh;
      }
      .menu-right .resource-viewer {
        float: left;
        width: 75%;
        position: relative;
      }
      .menu-right .resource-viewer .btn {
        top: 40%;
      }
              
      .menu-right .resource-menu {
        width:25%; 
        height: calc(100vh - 120px);
        overflow-y: scroll; 
        float: right;
      }
      .menu-left .resource-viewer {
        float: right;
        width: 75%;
        position: relative;
      }
      .menu-left .resource-viewer .btn {
        top: 40%;
      }
              
      .menu-left .resource-menu {
        width:25%; 
        height: calc(100vh - 120px);
        overflow-y: scroll; 
        float: left;
      }
      .menu-left .btn-reload {
        float: left;
        margin-left: 25px;
      }
      .menu-top {
        display: flex;
        flex-direction: column;
      }
      .menu-top .resource-viewer {
        width: 100%;
        order: 2
      }
      .menu-top .resource-viewer .btn {
        top: 45%;
      }
      .menu-top .resource-menu {
        width:100%; 
        overflow-y: hidden;
        overflow-x: scroll;
        display: flex;
        order: 1
      }
      .menu-top .resource-menu figure {
        margin: 0px;
        padding: 12px;
        width: 25%;
      }
      .menu-top .resource-viewer figure img,
      .menu-top .resource-viewer figure video {
        max-height: 70vh;
      }
      .menu-hidden .resource-viewer {
        width: 100%;
      }
      .menu-hidden .resource-viewer .btn {
        top: 33%;
      }
      .menu-hidden .resource-menu {
        width:100%; 
        overflow-y: hidden;
        overflow-x: scroll;
        display: none;
      }
      /* The Modal (background) */
      .modal {
        display: none; /* Hidden by default */
        position: fixed; /* Stay in place */
        z-index: 1; /* Sit on top */
        padding-top: 100px; /* Location of the box */
        left: 0;
        top: 0;
        width: 100%; /* Full width */
        height: 100%; /* Full height */
        overflow: auto; /* Enable scroll if needed */
        background-color: rgb(0,0,0); /* Fallback color */
        background-color: rgba(0,0,0,0.9); /* Black w/ opacity */
      }
      /* Modal Content (Image) */
      .modal-content {
        margin: auto;
        display: block;
        width: 95%;
      }
      /* Caption of Modal Image (Image Text) - Same Width as the Image */
      #popupCaption {
        margin: auto;
        display: block;
        width: 80%;
        max-width: 700px;
        text-align: center;
        color: #ccc;
        padding: 10px 0;
        height: 150px;
      }
      /* Add Animation - Zoom in the Modal */
      .modal-content, #popupCaption {
        animation-name: zoom;
        animation-duration: 0.6s;
      }
      @keyframes zoom {
        from {transform:scale(0)}
        to {transform:scale(1)}
      }
      /* 100% Image Width on Smaller Screens */
      @media only screen and (max-width: 700px){
        .modal-content {
          width: 100%;
        }
      }
    `}}),console.groupCollapsed("%cGALLERY-CARD 1.0.0 IS INSTALLED","color: green; font-weight: bold"),console.log("Readme:","https://github.com/lukelalo/gallery-card"),console.groupEnd(),window.customCards=window.customCards||[],window.customCards.push({type:"gallery-card",name:"Gallery Card",preview:!1,description:"The Gallery Card allows for viewing multiple images/videos.  Requires the Files sensor available at https://github.com/TarheelGrad1998"});
