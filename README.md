[![My HA Version](https://img.shields.io/github/v/tag/n00bcodr/homeassistant?color=d42a1e&label=My%20HA%20Version&logo=homeassistant&logoColor=white&?cacheSeconds=600)](https://github.com/n00bcodr/homeassistant/blob/master/.HA_VERSION)
[![Latest HA Release](https://img.shields.io/github/v/release/home-assistant/home-assistant?include_prereleases&label=Latest%20HA%20Release&logo=home-assistant)](https://github.com/home-assistant/home-assistant/releases/latest)
[![Years Badge](https://badges.strrl.dev/years/n00bcodr?color=darkgreen)](https://github.com/n00bcodr)
![Commit Activity](https://img.shields.io/github/commit-activity/w/n00bcodr/homeassistant?color=f58153&?cacheSeconds=600)
[![Last Commit](https://img.shields.io/github/last-commit/n00bcodr/homeassistant?color=purple)](https://github.com/n00bcodr/homeassistant/commits/master)
[![Hits](https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fgithub.com%2Fn00bcodr1212%2Fhit-counter)](https://github.com/n00bcodr)


---
[![Instagram](https://img.shields.io/badge/Instagram-%23E4405F.svg?style=for-the-badge&logo=Instagram&logoColor=white)](https://www.instagram.com/pavanthanuj/)
[![Facebook](https://img.shields.io/badge/Facebook-%231877F2.svg?style=for-the-badge&logo=Facebook&logoColor=white)](https://www.facebook.com/thanuj.upadrasta)
[![Reddit](https://img.shields.io/badge/Reddit-FF4500?style=for-the-badge&logo=reddit&logoColor=white)](https://www.reddit.com/user/pavanthanuj/)
[![X](https://img.shields.io/badge/Twitter-black.svg?style=for-the-badge&logo=X&logoColor=white)](https://www.x.com/pavanthanuj)
[![LinkedIn](https://img.shields.io/badge/linkedin-%230077B5.svg?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/pavanthanuju)
[![Spotify](https://img.shields.io/badge/Spotify-1ED760?style=for-the-badge&logo=spotify&logoColor=white)](https://open.spotify.com/user/21eb7srfkhj4oefepym2q5cpq)
[![Discord](https://img.shields.io/badge/Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.com/users/beardbaba#3387)
[![Website](https://img.shields.io/badge/website-FFFFFF?style=for-the-badge&logo=About.me&logoColor=black)](https://pavanthanuj.com)



---
# Home Assistant Configuration

I started my Home Assistant Journey with a Raspberry Pi 3, from which I have switched to an old Dell Laptop that I had lying around, for a year. I then migrated my setup to a renewed [HP Mini PC](https://www.amazon.in/gp/product/B09RTMLB15) with Core i7, 16GB RAM which is now the [server back home](https://github.com/n00bcodr/homeassistant-india) in India. When I was moving to Ireland I bought a Dell OPTIPLEX 3060 Tiny with Core i3 and 20GB RAM and a few hard disks connected with my Movie and TV Show collections.


## Things I have configured on the server

* [Home Assistant](https://home-assistant.io/)
* [Portainer](https://www.portainer.io/) to manage all the containers
* [Broadlink Manager](https://hub.docker.com/r/techblog/broadlinkmanager) for reading IR codes
* [Watchtower](https://github.com/beatkind/watchtower) to have all the containers up to date. This will cause the homeassistant instance to be "unhealthy". I am using this [workaround](https://gist.github.com/HCanber/700b4a5c685b9b97fb4865de6eaff0f3).
* [Homarr](https://homarr.dev/) for browser start page
* [Dash Dot](https://github.com/MauriceNino/dashdot) for server stats in graphs for Homarr
* [HomeBridge](https://homebridge.io/) - I only use this to add my Govee Heater to HomeAssistant
* [Filebrowser](https://github.com/filebrowser/filebrowser) to easily browse and edit files on my server
* [Docker Socket Proxy](https://github.com/Tecnativa/docker-socket-proxy) to control my docker containers from homeassistant (although I rarely use it)
* [EmulatorJS](https://emulatorjs.org/) to play retro games
* [Tailscale](https://tailscale.com/) as [subnet router](https://tailscale.com/kb/1019/subnets) this is magic!
* [Wallos](https://github.com/ellite/Wallos) - Open-Source Personal Subscription Tracker
* [ClipCascade](https://github.com/Sathvik-Rao/ClipCascade) - Opensource Clipboard Sync

**Media**
* [immich](https://immich.app/) as a Google Photos alternative
* [Jellyfin](https://github.com/jellyfin/jellyfin) Media Server to manage all my media
* [Jellystat](https://github.com/CyferShepard/Jellystat) for Jellyfin analytics
* [Jellyseer](https://github.com/Fallenbagel/jellyseerr) request manager for Radarr and Sonarr, using this I can directly browse and download movies.
* [Sonarr](https://sonarr.tv/) to download the latest episodes of TV shows I watch and make them available on Jellyfin
* [Radarr](https://radarr.video/) to download any movies I want to watch and make them available on Jellyfin
* [Bazzarr](https://github.com/bazarr/) to download and update subtitles of the media I have.
* [Requestrr](https://github.com/thomst08/requestrr) - Discord Bot Manager to download Movies and TV Shows through Sonarr or Radarr
* [Addarr](https://github.com/Waterboy1602/Addarr) telegram bot to download Movies and TV Shows through Sonarr or Radarr
* [Prowlarr](https://prowlarr.com/) to manage indexes for all the *arr apps
* [qBittorrent](https://github.com/qbittorrent/qBittorrent) installed as an app in Debian
* [SyncThing](https://syncthing.net/) to keep my phone's data backed up to the server
* [NextCloud](https://github.com/nextcloud) as a Google Drive alternative
* [Your Spotify](https://github.com/Yooooomi/your_spotify) to have a trend analysis of what I listen to on Spotify with detailed stats.




## Devices I use

## <a name="menu">Menu</a>
 | [Lights](#lights) | [Outlets & Switches](#outlets) | [Voice Assistants & Displays](#smartspeakers) | [Media](#media) | [Sensors](#sensors) | [Cameras](#cameras) | [Appliances](#appliances) | [Network](#network) | [IR Blasters](#ir) | [Hubs](#hubs) | [Climate](#climate) | [Other Hardware](#other) |[Screenshots](#screenshots) | [Wishlist](#wishlist) | [Graveyard☠️](#graveyard) |

---

### <a name="lights">Lights</a>
| [Go to Menu](#menu) |
- [Wipro 9W RGB Bulbs](https://amzn.to/3N3Es19) x 2
- [Nanoleaf Shapes Hexagon Starter Kit](https://www.amazon.co.uk/gp/product/B08BYBP6LX) x 1
- [Luxonic Smart LED Strip](https://www.amazon.co.uk/gp/product/B09JFYV9YV) x 1
- IKEA TRÅDFRI bulb E14 CWS 600lm x 6

---

### <a name="outlets">Outlets & Switches</a>
| [Go to Menu](#menu) |
- [Wipro 10A Smart Plugs](https://amzn.to/3xTLrnR) x 3
- [Antela Smart Plugs](https://www.amazon.co.uk/gp/product/B09VP5KNWM) x 4
- [EIGHTREE 13A WiFi Smart Plug](https://www.amazon.co.uk/EIGHTREE-Monitoring-Assistant-Wireless-Control/dp/B0B712GY64) x 2
- [HBN Smart Switch](https://www.amazon.co.uk/gp/product/B07PYWFKDY) x 1
- [Candeo Wifi Rotary Dimmer](https://www.amazon.co.uk/gp/product/B0BG83K3WZ) x 1
- [MOES WiFi RF433 Smart -3 Gang](https://www.amazon.co.uk/dp/B08KST4KYJ) x 2
- [Smart Immersion Heater Timer Switch](https://www.amazon.co.uk/dp/B0BTCPBQ7N) x 1

---

### <a name="smartspeakers">Voice Assistants & Displays</a>
| [Go to Menu](#menu) |
- [Nest Audio](https://store.google.com/us/product/nest_audio) x 1
- [Nest Mini](https://store.google.com/us/product/google_nest_mini) x 1
- Google Home Mini x 1
- Original Google Home x 1
- [Lenovo Smart Clock](https://www.flipkart.com/lenovo-smart-clock-google-assistant-speaker/p/itm39f6a1348e45e) x 1
- [Google Nest Hub 2nd Gen](https://store.google.com/ie/product/nest_hub_2nd_gen?hl=en-GB)

---

### <a name="media">Media</a>
| [Go to Menu](#menu) |
- [Google TV Streamer](https://store.google.com/product/google_tv_streamer) x 1
- [Chromecast with Google TV](https://store.google.com/us/product/chromecast_google_tv?hl=en-US) x 1
- [Google Chromecast](https://store.google.com/us/product/chromecast?hl=en-GB) x 1

---

### <a name="sensors">Sensors</a>
| [Go to Menu](#menu) |
- [SONOFF SNZB-04 ZigBee Wireless Door/Window Sensor](https://sonoff.tech/product/smart-home-security/snzb-04/) x 1
- [SONOFF SNZB-03 ZigBee Motion Sensor](https://amzn.to/3xysUgE) x 2
- [SONOFF SNZB-02 ZigBee Temperature & Humidity Sensor](https://amzn.to/3b31V4Z) x 1
- [SONOFF SNZB-01 ZigBee Wireless Switch](https://amzn.to/3O5BYQW) x 1
- [SONOFF SNZB-02D Zigbee LCD Smart Temperature Humidity Sensor](https://itead.cc/product/sonoff-snzb-02d-zigbee-lcd-smart-temperature-humidity-sensor/) x 2
- [SwitchBot Indoor/Outdoor Thermo-Hygrometer](https://eu.switch-bot.com/products/switchbot-indoor-outdoor-thermo-hygrometer?variant=42308352934053)
- TRÅDFRI shortcut button x 2
- [TRÅDFRI Remote Control](https://www.ikea.com/in/en/p/tradfri-remote-control-60443127) x 1
- [TRÅDFRI Wireless Dimmer](https://www.ikea.com/in/en/p/tradfri-wireless-dimmer-white-90408599) x 1
- [Aqara Vibration Sensor](https://www.aqara.com/en/vibration_sensor.html) x 1
- [Aqara Cube](https://www.aqara.com/en/cube.html) x 1
- [Aqara Door and Window Sensor](https://www.aqara.com/eu/product/door-and-window-sensor/) x 1
- [Aqara Motion Sensor P1](https://www.amazon.co.uk/dp/B0B9XZ1D51) x 2
- [Aqara Presense Sensor FP2](https://www.aqara.com/eu/product/presence-sensor-fp2/) x 1
- [Withings Sleep Mat](https://www.withings.com/us/en/sleep) x 1
- [Mi Body Composition Scale 2](https://www.mi.com/uk/product/mi-body-composition-scale-2/) x 1

---

### <a name="cameras">Cameras</a>
| [Go to Menu](#menu) |
- [Reolink Wireless Wi-Fi Doorbell](https://reolink.com/product/reolink-video-doorbell)

---

### <a name="appliances">Appliances</a>
| [Go to Menu](#menu) |
- Blomberg Washer & Dryer with [HomeWhiz](https://www.homewhiz.com/) support x 1
- [Silvercrest Smart Kettle](https://www.lidl.ie/p/lidl-smart-home/smart-kettle/p38007) x 1

---

### <a name="network">Network</a>
| [Go to Menu](#menu) |
- [TP-LINK Deco X60](https://amzn.to/3xZRA2V) x 2

---

### <a name="ir">IR Blasters</a>
| [Go to Menu](#menu) |
- [Broadlink RM MINI-3](https://www.amazon.in/gp/product/B076NRKR4B)

---

### <a name="hubs">Hubs</a>
| [Go to Menu](#menu) |

- [ConBee II](https://www.phoscon.de/en/conbee2) x 1
- [SwitchBot Hub Mini](https://eu.switch-bot.com/products/switchbot-hub-mini) x 1
- [SABRENT USB Bluetooth 4.0 Adapter Dongle](https://www.amazon.co.uk/gp/product/B06XHY5VXF) x 1
- [SONOFF ZBBridge – Smart Zigbee Bridge](https://amzn.to/39GRunk) x 1 (unused)

---

### <a name="climate">Climate</a>
| [Go to Menu](#menu) |

- [Switchbot Curtain Rod 2](https://eu.switch-bot.com/products/switchbot-curtain?variant=41666181464229) x2
- [Asakuki Smart Diffuser](https://www.amazon.co.uk/gp/product/B07L847K9W) x 1
- [Govee Smart Space Heater](https://www.amazon.co.uk/gp/product/B0C3HPG6JP) x 1

---

### <a name="other">Other Hardware</a>
| [Go to Menu](#menu) |
- [Tagreader](https://github.com/adonno/tagreader) x 2
- [Multisensor](https://esphome.io/cookbook/bruh.html) x 2

---

### <a name="screenshots">Screenshots</a>
| [Go to Menu](#menu) |


![Lovelace 1](https://github.com/n00bcodr/homeassistant/blob/master/screenshots/1.png?raw=true "Lovelace 1")
![Lovelace 2](https://github.com/n00bcodr/homeassistant/blob/master/screenshots/2.png?raw=true "Lovelace 2")
![Lovelace 3](https://github.com/n00bcodr/homeassistant/blob/master/screenshots/3.png?raw=true "Lovelace 3")
![Lovelace 4](https://github.com/n00bcodr/homeassistant/blob/master/screenshots/4.png?raw=true "Lovelace 4")
![Lovelace 5](https://github.com/n00bcodr/homeassistant/blob/master/screenshots/5.png?raw=true "Lovelace 5")
![Lovelace 6](https://github.com/n00bcodr/homeassistant/blob/master/screenshots/6.png?raw=true "Lovelace 6")
![Lovelace 7](https://github.com/n00bcodr/homeassistant/blob/master/screenshots/7.png?raw=true "Lovelace 7")
![Lovelace 8](https://github.com/n00bcodr/homeassistant/blob/master/screenshots/8.png?raw=true "Lovelace 8")
![Lovelace 9](https://github.com/n00bcodr/homeassistant/blob/master/screenshots/9.png?raw=true "Lovelace 9")

---

### <a name="wishlist">Wishlist</a>
| [Go to Menu](#menu) |

- Some type of plant sensors that would integrate well with HomeAssistant
- Google Coral for [HomeAssistant back home](https://github.com/n00bcodr/homeassistant-india)
- NAS
- Better hardware to support hardware acceleration

---

### <a name="graveyard">Graveyard☠️</a>
| [Go to Menu](#menu) |

- [SONOFF SNZB-04 ZigBee Wireless Door/Window Sensor](https://sonoff.tech/product/smart-home-security/snzb-04/) x 1
