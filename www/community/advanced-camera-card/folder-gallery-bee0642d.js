import{dd as e,d9 as a,dn as r,de as t,_ as n,n as s,t as o,a as i,x as l,e as d,dO as c,a4 as h,l as u,dP as m,r as g}from"./card-dff1f268.js";import"./gallery-core-38dd2d51.js";import"./endOfDay-3c12575c.js";import"./parse-6375321c.js";import"./date-picker-9ad8a45a.js";class p{constructor(e){this._host=e}setThumbnailSize(a){this._host.style.setProperty("--advanced-camera-card-thumbnail-size",`${a??e}px`)}getColumnWidth(a){return a?a.show_details?200:a.size:e}getColumnCountRoundMethod(e){return e?.show_details?"floor":"ceil"}itemClickHandler(e,n,s){a(s);const o=e.getView();if(o)if(r.isMedia(n))e.setViewByParameters({params:{view:"media",queryResults:o.queryResults?.clone().selectResultIfFound((e=>e===n))}});else if(r.isFolder(n)&&t.isFolderQuery(o.query)){const a=o.query.getQuery(),r=n.getID();if(!a||!r)return;e.setViewByParametersWithExistingQuery({params:{query:o.query.clone().setQuery({folder:a.folder,path:[...a.path,{id:r}]})}})}}}let v=class extends i{constructor(){super(...arguments),this._controller=new p(this)}willUpdate(e){e.has("galleryConfig")&&this._controller.setThumbnailSize(this.galleryConfig?.controls.thumbnails.size)}_renderThumbnail(e,a,r){return l`<advanced-camera-card-thumbnail
      class=${d({selected:a})}
      .hass=${this.hass}
      .item=${e}
      .viewManagerEpoch=${this.viewManagerEpoch}
      .viewItemManager=${this.viewItemManager}
      ?selected=${a}
      ?details=${!!this.galleryConfig?.controls.thumbnails.show_details}
      ?show_favorite_control=${!!this.galleryConfig?.controls.thumbnails.show_favorite_control}
      ?show_timeline_control=${!!this.galleryConfig?.controls.thumbnails.show_timeline_control}
      ?show_download_control=${!!this.galleryConfig?.controls.thumbnails.show_download_control}
      @click=${a=>r(e,a)}
    >
    </advanced-camera-card-thumbnail>`}_renderThumbnails(){const e=this.viewManagerEpoch?.manager.getView()?.queryResults?.getSelectedResult();return l`
      ${this.viewManagerEpoch?.manager.getView()?.queryResults?.getResults()?.map((a=>this._renderThumbnail(a,a===e,((e,a)=>{const r=this.viewManagerEpoch?.manager;r&&this._controller.itemClickHandler(r,e,a)}))))}
    `}render(){const e=!!this.viewManagerEpoch?.manager.getView()?.context?.loading?.query,a=c(this.viewManagerEpoch?.manager.getView());return l`
      <advanced-camera-card-surround-basic>
        ${this.viewManagerEpoch?.manager.getView()?.queryResults?.hasResults()||!e&&a?l`<advanced-camera-card-gallery-core
              .hass=${this.hass}
              .columnWidth=${this._controller.getColumnWidth(this.galleryConfig?.controls.thumbnails)}
              .columnCountRoundMethod=${this._controller.getColumnCountRoundMethod(this.galleryConfig?.controls.thumbnails)}
            >
              ${a?this._renderThumbnail(a,!1,((e,a)=>m(e,a,this.viewManagerEpoch))):""}
              ${this._renderThumbnails()}
            </advanced-camera-card-gallery-core>`:h({type:"info",message:u(e?"error.awaiting_folder":"common.no_folder"),icon:"mdi:folder-play",dotdotdot:e})}
      </advanced-camera-card-surround-basic>
    `}static get styles(){return g(":host {\n  width: 100%;\n  height: 100%;\n  display: block;\n}\n\nadvanced-camera-card-surround-basic {\n  max-height: 110dvh;\n}\n\nadvanced-camera-card-thumbnail {\n  height: 100%;\n  min-height: var(--advanced-camera-card-thumbnail-size);\n  background-color: var(--secondary-background-color);\n}\n\nadvanced-camera-card-thumbnail:not([details]) {\n  width: 100%;\n}\n\nadvanced-camera-card-thumbnail.selected {\n  border: 4px solid var(--accent-color);\n  border-radius: calc(var(--advanced-camera-card-css-border-radius, var(--ha-card-border-radius, 4px)) + 4px);\n}")}};n([s({attribute:!1})],v.prototype,"hass",void 0),n([s({attribute:!1})],v.prototype,"viewManagerEpoch",void 0),n([s({attribute:!1})],v.prototype,"viewItemManager",void 0),n([s({attribute:!1})],v.prototype,"galleryConfig",void 0),v=n([o("advanced-camera-card-folder-gallery")],v);export{v as AdvancedCameraCardFolderGallery};
