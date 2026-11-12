# Home Assistant knowledgebase: work done in this long session (Nov 2026)

HAOS 2026.11, `/config` is a git repo on `master` (nothing from this session is committed).
Other hosts: "HA India" 100.100.1.2, "skynet" 100.100.1.1 (Ollama, Frigate GPU box: i5-13500H, Intel Iris Xe only).
Secrets are deliberately not recorded here (Komodo, MQTT, camera, PAT, Immich, Nanoleaf, Frigate passwords).

Backups of everything changed live in the session scratchpad (temporary):
`/tmp/claude-0/-config/1c07b6c2-3b0f-4f2b-8955-8120fed5ee42/scratchpad/` (files named `*.pre-<change>.*`).

---

## 1. Standing rules / preferences

- No Claude attribution in files; commit/PR attribution only where the harness adds it.
- Never commit secrets. Don't print secrets. Don't echo the git remote URL. Don't push unless asked.
- Don't ask about restarting HA; the user restarts when everything is done. (Frigate restarts were only done when explicitly asked.)
- Gemini API key must be entered by the user in the UI.
- Use the Komodo API for the Ollama stack.
- Don't work around classifier denials. Fully Kiosk: "leave it".
- Custom-card JS under `/config/www/custom-cards/` needs its resource `?v=N` bumped (via websocket `lovelace/resources/update`) or the browser keeps the old copy (31-day cache).
- Dashboard edits are done through the websocket API (`lovelace/config` + `lovelace/config/save`, `url_path: None` = default dashboard). Helper scripts are in the scratchpad (`wslib.py`).
- Theme gotcha: `themes/dashboard.yaml` forces `border: none !important; background: transparent !important` on `ha-card` inside `vertical-stack-in-card`, and draws dashed borders on grid children. Use outline/box-shadow, or button-card, to style inside stacks.
- Mushroom gotchas: `icon_color` takes named colours, hex, or `"r,g,b"` (NOT `rgb(...)`). Chip styling via card_mod key `mushroom-template-chip:nth-child(N)$`.

---

## 2. Frigate (add-on `ccab4aaf_frigate-fa`, config `/addon_configs/ccab4aaf_frigate-fa/config.yaml`)

- **Face recognition:** `model_size: large`, `detection_threshold 0.7`, `recognition_threshold 0.96`, `min_area 3500`.
  Libraries cleaned (Pat, Hilary, Vinu, Ramu) and extended from Immich (Pat, Hilary, Vinu, Dedeepya, Saadhana, Dinu, Raveendra=Immich "Mrkc", assumption). Library path `/media/frigate/clips/faces/<Name>/`.
  Open: Ramu/Avinash not mapped to Immich people.
- **Doorbell audio delay fixed:** doorbell input switched from `preset-rtsp-restream` to `preset-rtsp-generic` (adds wallclock timestamps). User confirmed audio sounds right.
- **Doorbell grain/blur:** `number.doorbell_image_sharpness` 120→60→**90** (60 was too soft), `number.doorbell_image_saturation` 150→110; `automation.doorbell_night_mode` (on) turns colour mode on while the porch light is on. Sharpness now 90; judge it on a night clip.
- **Backyard camera PTZ:** added an `onvif:` block (host 192.168.168.69, port 2020, same login as its RTSP stream). Takes effect at next Frigate restart. Auto-tracking not enabled.
- **GenAI / Ollama: removed.** Reason (measured): Ollama on skynet runs on the Iris Xe iGPU via Vulkan at ~30-42 prompt tokens/s (CPU is slower, ~26). A doorbell review is ~22k tokens, i.e. 9-12 minutes, but Frigate times out at ~2 minutes. Also thinking-model `qwen3-vl:4b` was too slow, `qwen3-vl:4b-instruct` was pulled (still on skynet, ~3 GB, unused). Config now: provider block removed, `review.genai.enabled: false` globally and on the doorbell (doorbell prompt text kept for later). Backup: `frigate-config.pre-disable-genai.yaml`.
  **Keep the Ollama container and models on skynet:** the user uses Ollama for other things.
- **Gemini free tier (researched, not set up):** Frigate supports `provider: gemini` (key from Google AI Studio, vision model such as `gemini-2.5-flash`, key referenced as `{FRIGATE_GEMINI_API_KEY}` from an add-on env var so it never lands in a file). Free-tier limits are low and keep changing (third-party guides: roughly 5-15 requests/min and 100-1,000/day) and may not cover busy reviews; images go to Google, and free-tier data handling differs by region (user is in Ireland/EEA, check the terms). Per the standing rule the user must create and enter the key themselves. If enabled, use the 0.17+ named-provider structure (as in the old config) and turn `review.genai.enabled` back on.

---

## 2b. Doorbell: Gemini visitor description + Frigate name (built 12 Nov)

- Google Generative AI works again (user topped up prepaid credits with EUR 5 and set a EUR 1 spend cap). Paid-tier data is not used by Google to improve products.
- The old `google_generative_ai_conversation.generate_content` service no longer exists in HA. The integration now offers `ai_task.generate_data` (entity `ai_task.google_ai_task`), which accepts image attachments (`media-source://media_source/local/Doorbell/latest.jpg`). Test: ~4 s per snapshot.
- **Flow:** person alert goes out as before. Then the 🔔Doorbell automation (`1715598723988`) asks Gemini for a one-sentence description (max 15 words, no buildings/cars, does not guess identity), stores it in `input_text.doorbell_last_description` and calls `script.doorbell_update_alert`, which re-sends the alert (same `tag: doorbell`) with the description as the message. Frigate's face match (`🔔Doorbell - Name the Person`, `1793281373867`) stores the name in `input_text.doorbell_last_name` and calls the same script, so whichever finishes last shows both ("Pat is at the front door" + description).
- Both helpers are cleared at the start of each visit. A Gemini failure (credits, cap, timeout) is ignored (`continue_on_error`) and the plain alert has already gone out.
- **Face recognition stays with Frigate** (local, uses the face libraries). Gemini is deliberately not used to identify people.
- Not yet tested end to end with a real visitor.

---

## 3. HomeWhiz (custom component, washer "Bob")

- A HACS update (6 Nov, 0.5.28→0.5.29) overwrote local changes. **Ported forward** onto 0.5.29:
  - `machine_status.py` + `tests/test_machine_status.py` restored; `sensor.py` has `HomeWhizMachineStatusEntity` again (`sensor.bob_machine_status`).
  - `bluetooth.py` grace period / keep-alive / reconnect backoff restored; `const.py`, `__init__.py`, `config_flow.py` (options `bt_grace_period` default 180s, `bt_keepalive_interval`), `homewhiz.py` + `entity.py` (`coordinator.available`), strings/icons/translations.
  - Upstream 0.5.29 features kept (power switch, climate native_* props, entity-rename handling).
  - Not syntax-tested on Python 3.14 (not available); needs HA restart and a check that `sensor.bob_machine_status` works.
- `update.homewhiz_update` **disabled** so the bulk install scripts (`install_other_updates`, `install_marketplace_updates` in `scripts.yaml`) skip it. Re-enable via Entities if you want updates. The folder is not committed to git; a manual HACS redownload would overwrite it again.
- Cause of "unknown programme sensors" is most likely just the washer being idle (not confirmed).

### Washer states (observed in recorder history 28 Oct to 11 Nov)

- Main state (`sensor.bob_state`): off, on, running, paused, time_delay_active (never seen).
- Sub-states seen: program_started (idle value), remove_laundry, washing, spin, drying, rinsing, prewash, paused.
  **Never seen:** opening_door, water_intake, door_locked, locking_door, add_laundry, softener, rinse_hold, time_delay_enabled, remote_anticrease, analysing.
- Final status `sensor.bob_machine_status` (16, includes anti_crease and door_open): off, idle, delayed_start, starting, running, washing, rinsing, spinning, drying, paused, door_locked, add_laundry, cycle_complete, unavailable.
- Pictures exist for washing, rinsing, spinning, drying, paused, delayed_start, cycle_complete in `/config/www/images/washer/` (generated by `make_svgs.py`).
- **Done (needs HA restart to take effect):** new statuses `anti_crease` (sub-state `remote_anticrease`) and `door_open` (sub-state `opening_door` or the door-open flag while the machine is on); `time_delay_enabled` maps to `delayed_start`; `add_laundry` has its own label "Add Laundry" (teal) and picture. New animated pictures `add_laundry.svg`, `door_open.svg`, `anti_crease.svg` (generated by `make_svgs.py`; `*.svg` files are git-ignored). Cards updated (main dashboard + Utilities). 23 logic tests pass when run directly (pytest is not available here).
- **Programme display names:** `sensor.washer_programme_name` (in `template.yaml`) maps the 20 raw `program_*` values to title case ("Eco 40-60", "Mini 14'", "Spin & Pump", "5 KG Wash & Dry", "Wash & Wear", "Drum Clean +" ...). Used by the main-dashboard Washing Machine card and the Utilities view (title, chip, programme tile).
- Main dashboard washer card (`room-tile`, view 0 card 8) shows status label/colour/icon/animation/picture per status plus Done-at / Remaining extras, a "!" badge (door open / no water / safety), visible when `input_boolean.washer_new_ui` is on, taps to Utilities.

---

## 4. Custom cards (files in `/config/www/custom-cards/`)

| Card | Resource version now | What changed |
|---|---|---|
| `glass-media-card.js` | `?v=28` | Hold the big play/pause button 1 s to stop the real player (SVG progress ring, appears after 200 ms so plain taps don't flash; uses `turn_off` for cast sources because `media_stop` times out). Title falls back to `source` for ADB players (Fire TV has no `app_name`). Status text capitalised ("Paused"). New `wide: true` option = 16:9 artwork (used for Android TV ADB cards and Fire TV). |
| `room-card.js` (`custom:room-tile`) | `?v=8` | "Anything on in this room" indicator dot (no border), `watch:` list for extra entities (couch warmer, Dragon, bed warmer, diffuser), `indicator: false` to opt out. Templates get `s, a, is, rel, o, hass, entity` (no `states`). |
| `greeting-card.js` | `?v=3` | Every chip now tinted (was only weather); chips are tappable (more-info; weather entity, outdoor sensor); temperature colour scale (lavender <0, light blue <10, green <17, amber <24, orange <30, red); new outdoor chip from `outdoor_temperature`/`outdoor_humidity` (set to `sensor.hygrometer_temperature` / `sensor.hygrometer_humidity`). |

Calendar: Den calendar switched from Atomic Calendar Revive to **Calendar Card Pro** (resource already installed v5.1.0): main card Personal + Formula 1 (7 days), second card Black Bin + Blue Bin (14 days). `calendar.tablets` exists but is unused. Atomic Calendar is still installed (unused).

---

## 5. Dashboard (storage dashboard `lovelace`) changes

- **Main dashboard (view 0):**
  - Room tiles have the indicator dot; Living Room watches couch warmer and Dragon; bin tile has the dot off.
  - Heating cards show "Turned on/off at ..." from `sensor.last_real_change` (see section 8).
  - Jellyfin now-playing card: transcoding badge moved on small screens below the subtitle line (top 102px, left 194px, wraps).
  - Media swipe card: Fire TV has its own entry (`cbi:firetv` icon, `wide: true`), Android TV ADB entries `wide: true`, generic androidtv entry excludes `media_player.fire_tv`.
  - Greeting header card (see section 4).
- **Utilities (view 6):** washer cards read the new programme-name sensor; "Wash & Wear" wording fixed.
- **Den (view 1):** Calendar Card Pro cards; top chip row keeps the Work-phone chip (`sensor.work_phone_last_update_trigger`) that runs `script.update_all_phone_sensors`.
- **Living Room (view 4):**
  - Top status chips (Porch, Hallway, Living Room, Couch, Kitchen, temperature, back door): template chips showing last real change ("48 minutes ago"), tap = more-info; icon is full colour when active and a pale tint of the same colour when idle; chip background tinted 30% active / 12% idle; compact size via CSS variables. Weather chip removed (it only showed for deleted user IDs). Card shown to Pavan, Hilary and the Dashboard user.
  - Avatars: one horizontal-stack row [blank, Pavan, Hilary, blank], rings green (home) / red-orange (away) / sky blue (Work), no tap actions, no card borders, visible to Pavan and Hilary.
  - Navigation chips card (Utilities, Kitchen, Living Room, Guest, Media, Hallway, Doorbell, Bins) is **phone-only on purpose** (screen < 1024px) and sits below the avatars. (A merge into one card and an "always visible" version were tried and reverted. The user remembered why it is mobile-only.) All 8 section anchors exist and have chips; page order is Utilities, Kitchen, Living Room, Media, Hallway, Guest, Doorbell, Bins (chips list Guest before Media).
  - Light cards (Lamp, Chandelier, LED Strip, Guest Bed Light): background tinted with the light's actual colour when on (warm amber fallback for brightness-only lights), use_light_color on.
  - "Turned on/off at" lines use `sensor.last_real_change`.
- **Hilary view (`path: hilary`, visible to Hilary and Pavan):** bed lamps plus a **Samsung 4 Series remote**
  (`custom:universal-remote-card`, platform "Samsung TV", remote `remote.samsung_4_series_32_ue32t4300akxxu`, player `media_player.samsung_4_series_32_ue32t4300akxxu`): crimson power button, volume slider (Samsung doesn't report volume, slider is open-loop and may not work), mute that turns crimson + changes icon when muted, den-style d-pad (KEY_UP/DOWN/LEFT/RIGHT/ENTER), round back/home/menu/source/play-pause/info buttons, source icon `mdi:import`.
- **Network view (9):**
  - Pavan avatar/battery/Wi-Fi card now has a Hilary card beside it (uses `sensor.hilary_s_phone_battery_level`, `..._ssid`, `..._battery_state`, which are disabled-by-default entities; the user will enable them).
  - **Battery stock group** (one card): centred chip title ("Battery stock" / "Batteries · action needed"), pending prompt per type ("1× CR2450 used, update stock?" with green **Reduce to N** and grey **Dismiss** button-cards), then the three stock counters side by side. Border pulses red (outline + glow) while anything is pending.
  - Mobile Devices list (`battery-state-card`): Pixel 8 Pro now gets an explicit charging source (`binary_sensor.pixel8pro_is_charging`) because the card's auto-detect stopped at the charger-type sensor ("wireless").
- **Test view (16):** four Nanoleaf Shapes layouts (A dropdowns, B tabs, C scrolling row, D grouped) built from the device's real effect types. The user has not chosen one. Pick one, move it into the Den Shapes card and delete the other three.

---

## 6. Helpers, scripts, automations, templates created or changed

| Item | What |
|---|---|
| `counter.cr2032_pending`, `counter.cr2450_pending`, `counter.cr2025_pending` | Pending battery replacements (counters, restore on). Stock counters `counter.cr2032_batteries` etc. already existed. |
| `input_text.battery_last_replaced` | Device (+area) of the last replacement. |
| `script.battery_stock_apply` | Fields `type` (CR2032/CR2450/CR2025), `apply` (true = reduce stock, never below 0; false = dismiss). |
| automation "Battery stock - track replaced batteries" (`battery_stock_track_replaced`) | On `battery_notes_battery_replaced`, adds `battery_quantity` to the pending counter and stores the device name. |
| automation "Battery Increased Notification" (`1710081581692`) | **Turned off**: redundant, "Battery Replaced" (`1708687666073`) already marks batteries replaced automatically. |
| `sensor.last_real_change` (trigger-based template, `template.yaml`) | Attribute `times` {entity_id: ISO time} for heating, boiler, kettle, string lights, 9 lights and 5 motion/presence sensors; ignores unavailable/unknown. Falls back to `last_changed` until a real change is recorded. Restart persistence is unverified. |
| `sensor.washer_programme_name` (`template.yaml`) | Title-case programme names. |
| `script.update_all_phone_sensors` (`scripts.yaml`) | Now covers all devices with `continue_on_error`: Android/Wear OS/tablets (`mobile_app_pixel8pro`, `_nexus_7`, `_pixel_watch`) get `command_update_sensors`; iPhones/iPad (`_work_phone`, `_hilary_s_phone`, `_pavan_thanujs_ipad_3rd_gen`) get `request_location_update`. |
| `automation.doorbell_night_mode` | Enabled earlier. |
| Notify groups for Hilary | **Added then fully reverted** (the camera and bin notifications still go to Pavan's devices only). Note: groups load only after notify reload/restart. |

---

## 7. Android TV / Fire TV / Google TV

- Integration entries: `androidtv` (ADB) 192.168.168.11 "Google TV", .12 "Google TV Streamer", .20 "Fire TV" (new, `media_player.fire_tv`); `androidtv_remote` "Google TV" and "Google TV Streamer".
- **Dune removed** from all five. Readable app names added from real `pm list packages -3` output (Google TVs) and a preloaded list + real app list (Fire TV, 38 names; `com.haxapps.xc9` named "IPTV (XC9)", the real app name is unknown).
- Remotes also got Play Store icons (fetched from each app's `og:image`); no icon for TV Home, Jio On Demand, MX Player, Weather, ADB Auto Enable, Clean Your TV.
- Fire TV `screencap_interval` set to 1 minute (the minimum; 0 disables). Active app is reported in `app_id` / `source`.
- Options are edited through the integration options flow (REST `/api/config/config_entries/options/flow`; app step value `NewApp` for ADB entries, `add_new` for remote entries). Entries save with a short delay.

---

## 8. Why "last changed" resets at every restart (and the workaround)

On restart integrations go `unavailable` then back to off/on, and HA stamps `last_changed` with the restart time for that transition (~1,800 of 2,100 entities). No setting avoids it. The workaround is `sensor.last_real_change` (section 6) plus templates that read `state_attr('sensor.last_real_change','times')`. Not covered: Mushroom light cards with `secondary_info: last-changed` (can't be redirected), the Den/Hilary light cards, other views.

---

## 9. Other items

- **Nanoleaf Shapes:** effects classified by `pluginType` (`rhythm` = audio reactive, `color` = styles; games are the "Puzzle" types). Lists: 13 styles, 7 music, 5 games, 6 favourites (in the test view).
- **Washer wording / earlier items** are in git history and the sections above.
- **Doorbell/Frigate people:** no Immich API key is stored anywhere (deleted after use).

## 10. Open / deferred

- Restart HA (HomeWhiz port and the new washer statuses, `sensor.last_real_change` persistence test) and Frigate (ONVIF) at the user's convenience.
- Everything is committed locally (not pushed). The HomeWhiz folder is in git, but a HACS redownload would overwrite it (the update entity is disabled).
- Choose a Shapes layout (test view 16).
- Enable Hilary's disabled phone entities (battery level, SSID, battery state).
- Doorbell sharpness (maybe ~90) and whether grain is acceptable.
- Possible later: washer add_laundry/anti_crease/door_open states and pictures; Fitbit to `google_health`; Google Generative AI re-add; Caddy `Permissions-Policy` header; other palettes of the floating theme; 27k exposure-entries swap; Frigate auto-tracking for the backyard camera; removing Atomic Calendar Revive from HACS.
