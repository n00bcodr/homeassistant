import {LitElement, html, css} from "lit-element";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

const CameraCardVersion = "2.0.1";

class CameraCard extends LitElement {
  static get properties() {
    return {
      _hass: {},
      config: {},
      resources: {},
      currentResourceIndex: {},
      selectedDate: {}
    };
  }

  render() {
    const menuAlignment = (this.config.menu_alignment || "responsive").toLowerCase();

    return html`
      ${this.errors === undefined ? html`` :
         this.errors.map((error) => {
          return html`<hui-warning>${error}</hui-warning>`;
         })}
      <ha-card .header=${this.config.title} class="menu-${menuAlignment}">
        ${this.currentResourceIndex === undefined || !(this.config.enable_date_search ?? false) ?
            html`` : html`<input type="date" class="date-picker" @change="${this._handleDateChange}" value="${this._formatDateForInput(this.selectedDate)}">` }
        ${this.currentResourceIndex === undefined || !(this.config.show_reload ?? false) ?
            html`` : html`<ha-progress-button class="btn-reload" @click="${() => this._loadResources(this._hass)}">Reload</ha-progress-button>` }
        <div class="resource-viewer" @touchstart="${event => this._handleTouchStart(event)}" @touchmove="${event => this._handleTouchMove(event)}">
          <figure style="margin:5px;">
            ${
                this._currentResource().isHass ?
                html`
                  <hui-image @click="${event => this._popupCamera(event)}"
                                      .hass=${this._hass}
                                      .cameraImage=${this._currentResource().name}
                                      .cameraView=${"live"}
                                    ></hui-image>
                ` :
                this._isImageExtension(this._currentResource().extension) ?
                html`<img @click="${event => this._popupImage(event)}" src="${this._currentResource().url}"/>` :
                html`<video controls ?loop=${this.config.video_loop} ?autoplay=${this.config.video_autoplay} src="${this._currentResource().url}#t=0.1" @loadedmetadata="${event => this._videoMetadataLoaded(event)}" @canplay="${event => this._startVideo(event)}"
                            @ended="${() => this._videoHasEnded()}" preload="metadata"></video>`
              }
            <figcaption>${this._currentResource().caption}
              ${this._isImageExtension(this._currentResource().extension) ?
                  html`` : html`<span class="duration"></span> ` }
              ${this.config.show_zoom ? html`<a href= "${this._currentResource().url}" target="_blank">Zoom</a>` : html`` }
            </figcaption>
          </figure>
          <button class="btn btn-left" @click="${() => this._selectResource(this.currentResourceIndex-1)}">&lt;</button>
          <button class="btn btn-right" @click="${() => this._selectResource(this.currentResourceIndex+1)}">&gt;</button>
        </div>
        <div class="resource-menu">
          ${this.resources.map((resource, index) => {
                return html`
                  <figure style="margin:5px;" id="resource${index}" data-imageIndex="${index}" @click="${() => this._selectResource(index)}" class="${(index === this.currentResourceIndex) ? 'selected' : ''}">
                  ${
                      resource.isHass ?
                      html`
                        <hui-image
                          .hass=${this._hass}
                          .cameraImage=${resource.name}
                          .cameraView=${"live"}
                        ></hui-image>
                      ` :
                      this._isImageExtension(resource.extension) ?
                      html`<img class="lzy_img" src="/local/community/camera-card/placeholder.jpg" data-src="${resource.url}"/>` :
                        (this.config.video_preload ?? true) ?
                        html`<video preload="none" data-src="${resource.url}#t=${(this.config.preview_video_at === undefined) ? 0.1 : this.config.preview_video_at }" @loadedmetadata="${event => this._videoMetadataLoaded(event)}" @canplay="${() => this._downloadNextMenuVideo()}" preload="metadata"></video>` :
                          html`<div style="text-align: center"><div class="lzy_img"><ha-icon id="play" icon="mdi:movie-play-outline"></ha-icon></div></div>`
                    }
                  <figcaption>${resource.caption} <span class="duration"></span></figcaption>
                  </figure>
                `;
            })}
        </div>
        <div id="imageModal" class="modal" @touchstart="${event => this._handleTouchStart(event)}" @touchmove="${event => this._handleTouchMove(event)}">
          <img class="modal-content" id="popupImage">
          <div id="popupCaption"></div>
        </div>
      </ha-card>
    `;
  }

  _downloadingVideos = false;
  // eslint-disable-next-line no-unused-vars
  updated(changedProperties) {
    const imageArray = this.shadowRoot.querySelectorAll('img.lzy_img');

    for (const v of imageArray) {
        this.imageObserver.observe(v);
    }
    const videoArray = this.shadowRoot.querySelectorAll('video.lzy_video');

    for (const v of videoArray) {
        this.imageObserver.observe(v);
    }
    // changedProperties.forEach((oldValue, propName) => {
    //   console.log(`${propName} changed. oldValue: ${oldValue}`);
    // });

    if (!this._downloadingVideos)
      this._downloadNextMenuVideo();
  }

  async _downloadNextMenuVideo() {
    this._downloadingVideos = true;
    const v = this.shadowRoot.querySelector(".resource-menu figure video[data-src]");

    if (v)
    {
      await new Promise(resolve => setTimeout(resolve, 100));
      const source = v.dataset.src;

      delete v.dataset.src;
      v.src = source;
      v.load();
    }
    else {
      this._downloadingVideos = false;
    }
  }

  setConfig(config) {
    dayjs.extend(customParseFormat);
    dayjs.extend(relativeTime);
    dayjs.extend(utc);
    dayjs.extend(timezone);

    this.imageObserver = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                const lazyImage = entry.target;
                // console.log("lazy loading ", lazyImage)

                lazyImage.src = lazyImage.dataset.src;
            }
        }
    });
    if (!config.entity && !config.entities) {
      throw new Error("Required configuration for entities is missing");
    }

    this.config = config;
    if (this.config.entity) {
      if (!this.config.entities) {
        this.config = { ...this.config, entities: [] };
      }
      this.config.entities.push(this.config.entity);
      delete this.config.entity;
    }

    if (this._hass !== undefined)
      this._loadResources(this._hass);

    this._doSlideShow(true);
  }

  set hass(hass) {
    this._hass = hass;

    if (this.resources === undefined)
      this._loadResources(this._hass);
  }

  getCardSize() {
    return 1;
  }

  _isImageExtension(extension) {
    return(extension.match(/(jpeg|jpg|gif|png|tiff|bmp)$/));
  }

  _doSlideShow(firstTime) {
  if (!firstTime) {
    const step = this.config.slideshow_every_other ? Number.parseInt(this.config.slideshow_every_other, 10) : 1;

    if (this.config.reverse_slideshow) {
      this._selectResource(this.currentResourceIndex - step, true);
    } else {
      this._selectResource(this.currentResourceIndex + step, true);
    }
  }

    if (this.config.slideshow_timer) {
      const time = Number.parseFloat(this.config.slideshow_timer);

      if (!Number.isNaN(time) && time > 0) {
        setTimeout(() => {this._doSlideShow();}, (time * 1000));
      }
    }
  }

  _selectResource(index, fromSlideshow) {
    this.autoPlayVideo = true;

    let nextResourceIndex = index;

    if (index < 0)
      nextResourceIndex = this.resources.length - 1;
    else if (index >= this.resources.length)
      nextResourceIndex = 0;

    this.currentResourceIndex = nextResourceIndex;
    this._loadImageForPopup();

    if (fromSlideshow && this.parentNode && this.parentNode.tagName && this.parentNode.tagName.toLowerCase() === "hui-card-preview") {
      return;
    }

    const elt = this.shadowRoot.querySelector("#resource" + this.currentResourceIndex);

    if (elt)
      elt.scrollIntoView({behavior: "smooth", block: "nearest", inline: "nearest"});
  }

  _getResource(index) {
    return this.resources !== undefined && index !== undefined && this.resources.length > 0 ? this.resources[index] : {
        url: "",
        name: "",
        extension: "jpg",
        caption: index === undefined ? "Loading resources..." : "No images or videos to display",
        index: 0
      };
  }

  _currentResource() {
    return this._getResource(this.currentResourceIndex);
  }

  _startVideo(event) {
  	if (this.autoPlayVideo)
  		event.target.play();
  }

  _videoMetadataLoaded(event) {
    const showDuration = this.config.show_duration ?? true;

    if (!Number.isNaN(Number.parseInt(event.target.duration)) && showDuration)
      event.target.parentNode.querySelector(".duration").innerHTML = "[" + this._getFormattedVideoDuration(event.target.duration) + "]";

    if (this.config.video_muted)
      event.target.muted = "muted";
  }

  _videoHasEnded() {
    if (this.config.slideshow_video_end) {
      this._doSlideShow();
    }
  }

  _popupCamera() {
    const event = new Event("hass-more-info", {
      bubbles: true,
      composed: true
    });

    event.detail = {entityId: this._currentResource().name};
    this.dispatchEvent(event);
  }

  _popupImage() {
    const modal = this.shadowRoot.querySelector("#imageModal");

    modal.style.display = "block";
    this._loadImageForPopup();
    modal.scrollIntoView(true);

    modal.addEventListener('click', function() {
      modal.style.display = "none";
    });
  }

  _loadImageForPopup() {
    const modal = this.shadowRoot.querySelector("#imageModal");
    const modalImg = this.shadowRoot.querySelector("#popupImage");
    const captionText = this.shadowRoot.querySelector("#popupCaption");

    if (modal.style.display === "block") {
      modalImg.src = this._currentResource().url;
      captionText.innerHTML = this._currentResource().caption;
    }
  }

  _getFormattedVideoDuration(duration) {
  	let minutes = Number.parseInt(duration / 60);

    if (minutes < 10)
      minutes = "0" + minutes;

    let seconds = Number.parseInt(duration % 60);

    seconds = "0" + seconds;
    seconds = seconds.slice(Math.max(0, seconds.length - 2));

    return minutes + ":" + seconds;
  }

  _keyNavigation(event) {
    switch(event.code) {
      case "ArrowDown":
      case "ArrowRight": {
        this._selectResource(this.currentResourceIndex+1);
        break;
      }
      case "ArrowUp":
      case "ArrowLeft": {
        this._selectResource(this.currentResourceIndex-1);
        break;
      }
      default:
        // null
    }
  }

  _handleTouchStart(event) {
      this.xDown = event.touches[0].clientX;
      this.yDown = event.touches[0].clientY;
  }

  _handleTouchMove(event) {
      if ( ! this.xDown || ! this.yDown ) {
          return;
      }
      const xUp = event.touches[0].clientX;
      const yUp = event.touches[0].clientY;
      const xDiff = this.xDown - xUp;
      const yDiff = this.yDown - yUp;

      if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/* most significant */
          if ( xDiff > 0 ) {
          /* left swipe */
          this._selectResource(this.currentResourceIndex+1);
          event.preventDefault();
          } else {
          /* right swipe */
          this._selectResource(this.currentResourceIndex-1);
          event.preventDefault();
          }
      } else {
          // if ( yDiff > 0 ) {
          /* up swipe */
          // } else {
          /* down swipe */
          // }
      }

      /* reset values */
      this.xDown = undefined;
      this.yDown = undefined;
  }

  _handleDateChange(event) {
    this.selectedDate = dayjs(event.target.value);
    this._loadResources(this._hass);
  }

  _loadResources(hass) {
    const commands = [];

    this.currentResourceIndex = undefined;
    this.resources = [];
    if(this.selectedDate === undefined)
        this.selectedDate = dayjs().startOf('date');

    const maximumFilesPerEntity = this.config.maximum_files_per_entity ?? true;
    const maximumFiles = maximumFilesPerEntity ? this.config.maximum_files : undefined;
    const maximumFilesTotal = maximumFilesPerEntity ? undefined: this.config.maximum_files;
    let folderFormat = this.config.folder_format;
    let fileNameFormat = this.config.file_name_format;
    let fileNameTimeZone = this.config.file_name_time_zone;
    let fileNameDateBegins = this.config.file_name_date_begins;
    let captionFormat = this.config.caption_format;
    const parsedDateSort = this.config.parsed_date_sort ?? false;
    const reverseSort = this.config.reverse_sort ?? true;
    const randomSort = this.config.random_sort ?? false;
    const filterForDate = this.config.enable_date_search ?? false;

    for (const entity of this.config.entities) {
      let entityId;
      let recursive = false;
      let includeVideo = true;
      let includeImages = true;

      if (typeof entity === 'object') {
        entityId = entity.path;
        if (entity.recursive)
          recursive = entity.recursive;
        if (entity.include_video !== undefined)
          includeVideo = entity.include_video;
        if (entity.include_images !== undefined)
          includeImages = entity.include_images;
        if (entity.folder_format)
          folderFormat = entity.folder_format;
        if (entity.file_name_format)
          fileNameFormat = entity.file_name_format;
        if (entity.file_name_time_zone)
          fileNameTimeZone = entity.file_name_time_zone;
        if (entity.file_name_date_begins)
          fileNameDateBegins = entity.file_name_date_begins;
        if (entity.caption_format)
          captionFormat = entity.caption_format;
      }
      else {
        entityId = entity;
      }

      if (entityId.substring(0, 15).toLowerCase() === "media-source://") {
        commands.push(this._loadMediaResource(hass, entityId, maximumFiles, folderFormat, fileNameFormat, fileNameTimeZone, fileNameDateBegins, captionFormat, recursive, reverseSort, includeVideo, includeImages, filterForDate));
      }
      else {
        const entityState = hass.states[entityId];

        if (entityState === undefined) {
          commands.push(Promise.resolve({
            error: true,
            entity: entityId,
            message: "Invalid Entity ID"
          }));
        }
        else {
          if (entityState.attributes.entity_picture !== undefined)
            commands.push(this._loadCameraResource(entityId, entityState));

          // Custom Files component
          if (entityState.attributes.fileList !== undefined)
            commands.push(this._loadFilesResources(entityState.attributes.fileList, maximumFiles, fileNameFormat, fileNameTimeZone, fileNameDateBegins, captionFormat, reverseSort));

          // HA Folder component
          if (entityState.attributes.file_list !== undefined)
            commands.push(this._loadFilesResources(entityState.attributes.file_list, maximumFiles, fileNameFormat, fileNameTimeZone, fileNameDateBegins, captionFormat, reverseSort));
        }
      }
    }

    Promise.all(commands).then(resources => {
      this.resources = resources.filter(result => !result.error).flat(Number.POSITIVE_INFINITY);

      if (parsedDateSort) {
        if (reverseSort) {
          this.resources.sort(function (x, y) { return y.date - x.date; });
        }
        else {
          this.resources.sort(function (x, y) { return x.date - y.date; });
        }
      }

      if (randomSort) {
        for(let index = this.resources.length - 1; index > 0; index--) {
          const r = Math.floor(Math.random() * (index + 1) );

          if(index !== r) {
            [this.resources[index], this.resources[r]] = [this.resources[r], this.resources[index]];
          }
        }
      }

      if (maximumFilesTotal !== undefined && !Number.isNaN(maximumFilesTotal) && maximumFilesTotal < this.resources.length) {
        // Keep only N total, but make sure camera resources remain
        this.resources = this.resources.filter(function(resource) {
          if (resource.isHass)
            return true;
          else if (this.count < maximumFilesTotal) {
            this.count++;
            return true;
          }
          return false;
        }, {count: resources.filter(resource => resource.isHass).length});
      }

      this.currentResourceIndex = 0;
      if (!(this.parentNode && this.parentNode.tagName && this.parentNode.tagName.toLowerCase() === "hui-card-preview")) {
        document.addEventListener('keydown',event=>this._keyNavigation(event));
      }

      this.errors = [];
      for (const error of resources.filter(result => result.error).flat(Number.POSITIVE_INFINITY)) {
        this.errors.push(error.message + ' ' + error.entity);
        this._hass.callService('system_log', 'write', {
          message: 'Camera Card Error:  ' + error.message + '   ' + error.entity
        });
      }
    });
  }

  _loadMediaResource(hass, contentId, maximumFiles, folderFormat, fileNameFormat, fileNameTimeZone, fileNameDateBegins, captionFormat, recursive, reverseSort, includeVideo, includeImages, filterForDate) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      let mediaPath = contentId;

      try {
        let values = [];

        if (folderFormat && reverseSort && maximumFiles !== undefined && !Number.isNaN(maximumFiles)) {  // Can do more targeted folder searching under these conditions
          let date = dayjs();
          let folderPrevious = "";
          const failedPaths = [];

          while (values.length < maximumFiles) {
            const folder = date.format(folderFormat);

            mediaPath = contentId + (folder ? ("/" + folder) : "");

            if (folder !== folderPrevious) {
              try {
                const folderValues = await this._loadMedia(this, hass, mediaPath, maximumFiles, false, reverseSort, includeVideo, includeImages, filterForDate);

                values.push(...folderValues);
              } catch (error) {
                if (error.code === 'browse_media_failed')
                  failedPaths.push(mediaPath);
                else
                  throw error;
              }
            }

            if (failedPaths.length > 2) {
              if (values.length === 0) {
                mediaPath = failedPaths.join(',');
                throw new Error('Failed to browse several folders and found no media files.  Verify your settings are correct.');
              }
              break;
            }

            folderPrevious = folder;
            date = date.subtract(12, 'hour');  // Allows for AM/PM folders
          }

          if (values.length > maximumFiles)
            values.length = maximumFiles;
        } else
          values = await this._loadMedia(this, hass, mediaPath, maximumFiles, recursive, reverseSort, includeVideo, includeImages, filterForDate);

        const resources = [];

        for (const mediaItem of values) {
          const resource = this._createFileResource(mediaItem.authenticated_path, fileNameFormat, fileNameTimeZone, fileNameDateBegins, captionFormat);

          if (resource !== undefined) {
            resources.push(resource);
          }
        }
        resolve(resources);
      } catch (error) {
        console.log(error);
        resolve({
          error: true,
          entity: mediaPath,
          message: error.message
        });
      }

    });
  }

  _loadMedia(reference, hass, contentId, maximumFiles, recursive, reverseSort, includeVideo, includeImages, filterForDate) {
    const mediaItem = {
      media_class: "directory",
      media_content_id: contentId
    };

    if (contentId.substring(contentId.length - 1, contentId.length) !== "/" && contentId !== "media-source://media_source") {
      //mediaItem.media_content_id += "/";
    }

    return Promise.all(this._fetchMedia(reference, hass, mediaItem, recursive, includeVideo, includeImages, filterForDate))
      .then(function(values) {
        let mediaItems = values.flat(Number.POSITIVE_INFINITY);

        // Apply regex filter if specified in config right after fetching and flattening
        if (reference.config.filter_regex) {
          const regex = new RegExp(reference.config.filter_regex);
          mediaItems = mediaItems.filter(item => item.title.match(regex));
        }

        mediaItems = mediaItems.filter(function(item) {return item !== undefined;});

        mediaItems.sort(function (a, b) {
          if (a.title > b.title) {
            return 1;
          }
          if (a.title < b.title) {
            return -1;
          }
          return 0;
        });

        if (reverseSort)
          mediaItems.reverse();

        if (maximumFiles !== undefined && !Number.isNaN(maximumFiles) && maximumFiles < mediaItems.length) {
          mediaItems.length = maximumFiles;
        }

        return Promise.all(mediaItems.map(function(mediaItem) {
          return reference._fetchMediaItem(hass, mediaItem.media_content_id)
            .then(function(auth) {
              return {
                ...mediaItem,
                authenticated_path: auth.url
              };
            });
        }));
      });
  }

  _fetchMedia(reference, hass, mediaItem, recursive, includeVideo, includeImages, filterForDate) {
    const commands = [];

    if (mediaItem.media_class === "directory") {
      if (mediaItem.children) {
        commands.push(
          ...mediaItem.children
          .filter(mediaItem => {
            return ((includeVideo && mediaItem.media_class === "video") ||
              (includeImages && mediaItem.media_class === "image") ||
              (recursive && mediaItem.media_class === "directory" && (!filterForDate ||
                (mediaItem.title ===  reference._folderDateFormatter((reference.config.search_date_folder_format === undefined) ? "DD_MM_YYYY" : reference.config.search_date_folder_format,reference.config.search_date_folder_time_zone,reference.selectedDate) ) ))) &&
              mediaItem.title !== "@eaDir/";
          })
          .map(mediaItem => {
            return Promise.all(reference._fetchMedia(reference, hass, mediaItem, recursive, includeVideo, includeImages, filterForDate));
          }));
      }
      else {
        commands.push(
          reference._fetchMediaContents(hass, mediaItem.media_content_id)
          .then(mediaItem => {
            return Promise.all(reference._fetchMedia(reference, hass, mediaItem, recursive, includeVideo, includeImages, filterForDate));
          })
        );
      }
    }

    if (mediaItem.media_class !== "directory") {
      commands.push(Promise.resolve(mediaItem));
    }

    return commands;
  }

  _fetchMediaContents(hass, contentId) {
    return hass.callWS({
      type: "media_source/browse_media",
      media_content_id: contentId
    });
  }

  _fetchMediaItem(hass, mediaItemPath) {
    return hass.callWS({
      type: "media_source/resolve_media",
      media_content_id: mediaItemPath,
      expires: (60 * 60 * 3)  // 3 hours
    });
  }

  _loadCameraResource(entityId, camera) {
    const resource = {
      url: camera.attributes.entity_picture,
      name: entityId,
      extension: "jpg",
      caption: camera.attributes.friendly_name ?? entityId,
      isHass: true
    };

    return Promise.resolve(resource);
  }

  _loadFilesResources(files, maximumFiles, fileNameFormat, fileNameTimeZone, fileNameDateBegins, captionFormat, reverseSort) {
    const resources = [];

    if (files) {
      files = files.filter(file => !file.includes("@eaDir"));

      if (reverseSort)
        files.reverse();

      if (maximumFiles !== undefined && !Number.isNaN(maximumFiles) && maximumFiles < files.length) {
        files.length = maximumFiles;
      }

      for (const file of files) {
        const filePath = file;
        // /config/downloads/front_door/
        // /config/www/...
        let fileUrl = filePath.replace("/config/www/", "/local/");

        if (!filePath.includes("/config/www/"))
          fileUrl = "/local/" + filePath.slice(Math.max(0, filePath.indexOf("/www/") + 5));

        const resource = this._createFileResource(fileUrl, fileNameFormat, fileNameTimeZone, fileNameDateBegins, captionFormat);

        if (resource !== undefined) {
          resources.push(resource);
        }
      }
    }

    return Promise.resolve(resources);
  }

  _createFileResource(fileRawUrl, fileNameFormat, fileNameTimeZone, fileNameDateBegins, captionFormat) {
    let resource;

    const fileUrl = fileRawUrl.split("?")[0];
    const arfilePath = fileUrl.split("/");
    let fileName = arfilePath.at(-1);
    let date = "";
    let fileCaption = "";

    if (fileName !== '@eaDir') {
      const arFileName = fileName.split(".");
      const extension = arFileName.at(-1).toLowerCase();

      fileName = fileName.slice(0, Math.max(0, fileName.length - extension.length - 1));
      fileName = decodeURIComponent(fileName);

      if (captionFormat !== " ")
        fileCaption = fileName;

      let fileDatePart = fileName;

      if (fileNameDateBegins && !Number.isNaN(Number.parseInt(fileNameDateBegins)))
        fileDatePart = fileDatePart.slice(Math.max(0, Number.parseInt(fileNameDateBegins) - 1));
      console.log(fileDatePart);
      if (fileNameFormat) {
        date = dayjs(fileDatePart, fileNameFormat);
        if (fileNameTimeZone) {
          date = date.tz(fileNameTimeZone);
        }
      }

      if (date && captionFormat) {
        if (captionFormat.toUpperCase().trim() === 'AGO')
          fileCaption = date.fromNow();
        else {
          fileCaption = date.format(captionFormat);
          fileCaption = fileCaption.replaceAll(/ago/gi, date.fromNow());
        }
      }

      resource = {
        url: fileRawUrl,
        base_url: fileUrl,
        name: fileName,
        extension,
        caption: fileCaption,
        index: -1,
        date
      };
    }

    return resource;
  }

  _folderDateFormatter(folderFormat, folderTimeZone, date) {
    var date_time = date;
    if (folderTimeZone) {
      date_time = date_time.tz(folderTimeZone);
    }
    return date_time.format(folderFormat);
  }

  _formatDateForInput(date) {
      return date.format("YYYY-MM-DD");
  }

  static get styles() {
    return css`
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
    `;
  }
}
customElements.define("camera-card", CameraCard);

console.groupCollapsed(`%cCAMERA-CARD ${CameraCardVersion} IS INSTALLED`,"color: green; font-weight: bold");
console.log("Readme:","https://github.com//n00bcodr/camera-card");
console.groupEnd();

window.customCards = window.customCards || [];
window.customCards.push({
  type: "camera-card",
  name: "Camera Card",
  preview: false, // Optional - defaults to false
  description: "The Camera Card allows for viewing multiple images/videos.  Requires the Files sensor available at https://github.com/TarheelGrad1998" // Optional
});