// Auto generated code by esphome
// ========== AUTO GENERATED INCLUDE BLOCK BEGIN ===========
#include "esphome.h"
using namespace esphome;
using std::isnan;
using std::min;
using std::max;
using namespace binary_sensor;
logger::Logger *logger_logger;
web_server_base::WebServerBase *web_server_base_webserverbase;
captive_portal::CaptivePortal *captive_portal_captiveportal;
wifi::WiFiComponent *wifi_wificomponent;
mdns::MDNSComponent *mdns_mdnscomponent;
ota::OTAComponent *ota_otacomponent;
api::APIServer *api_apiserver;
using namespace api;
preferences::IntervalSyncer *preferences_intervalsyncer;
bluetooth_proxy::BluetoothProxy *bluetooth_proxy_bluetoothproxy;
esp32_ble_tracker::ESP32BLETracker *esp32_ble_tracker_esp32bletracker;
ble_presence::BLEPresenceDevice *ble_presence_blepresencedevice;
#define yield() esphome::yield()
#define millis() esphome::millis()
#define micros() esphome::micros()
#define delay(x) esphome::delay(x)
#define delayMicroseconds(x) esphome::delayMicroseconds(x)
// ========== AUTO GENERATED INCLUDE BLOCK END ==========="

void setup() {
  // ========== AUTO GENERATED CODE BEGIN ===========
  // async_tcp:
  //   {}
  // esphome:
  //   name: bluetoothproxy
  //   build_path: .esphome/build/bluetoothproxy
  //   platformio_options: {}
  //   includes: []
  //   libraries: []
  //   name_add_mac_suffix: false
  App.pre_setup("bluetoothproxy", __DATE__ ", " __TIME__, false);
  // binary_sensor:
  // logger:
  //   level: VERY_VERBOSE
  //   id: logger_logger
  //   baud_rate: 115200
  //   tx_buffer_size: 512
  //   deassert_rts_dtr: false
  //   hardware_uart: UART0
  //   logs: {}
  logger_logger = new logger::Logger(115200, 512, logger::UART_SELECTION_UART0);
  logger_logger->pre_setup();
  logger_logger->set_component_source("logger");
  App.register_component(logger_logger);
  // web_server_base:
  //   id: web_server_base_webserverbase
  web_server_base_webserverbase = new web_server_base::WebServerBase();
  web_server_base_webserverbase->set_component_source("web_server_base");
  App.register_component(web_server_base_webserverbase);
  // captive_portal:
  //   id: captive_portal_captiveportal
  //   web_server_base_id: web_server_base_webserverbase
  captive_portal_captiveportal = new captive_portal::CaptivePortal(web_server_base_webserverbase);
  captive_portal_captiveportal->set_component_source("captive_portal");
  App.register_component(captive_portal_captiveportal);
  // wifi:
  //   ap:
  //     ssid: Bluetoothproxy Fallback Hotspot
  //     password: '123456789'
  //     id: wifi_wifiap
  //     ap_timeout: 1min
  //   id: wifi_wificomponent
  //   domain: .local
  //   reboot_timeout: 15min
  //   power_save_mode: LIGHT
  //   fast_connect: false
  //   networks:
  //   - ssid: !secret 'wifi_ssid'
  //     password: !secret 'wifi_password'
  //     id: wifi_wifiap_2
  //     priority: 0.0
  //   use_address: bluetoothproxy.local
  wifi_wificomponent = new wifi::WiFiComponent();
  wifi_wificomponent->set_use_address("bluetoothproxy.local");
  wifi::WiFiAP wifi_wifiap_2 = wifi::WiFiAP();
  wifi_wifiap_2.set_ssid("upadrasta");
  wifi_wifiap_2.set_password("Upadrasta123");
  wifi_wifiap_2.set_priority(0.0f);
  wifi_wificomponent->add_sta(wifi_wifiap_2);
  wifi::WiFiAP wifi_wifiap = wifi::WiFiAP();
  wifi_wifiap.set_ssid("Bluetoothproxy Fallback Hotspot");
  wifi_wifiap.set_password("123456789");
  wifi_wificomponent->set_ap(wifi_wifiap);
  wifi_wificomponent->set_ap_timeout(60000);
  wifi_wificomponent->set_reboot_timeout(900000);
  wifi_wificomponent->set_power_save_mode(wifi::WIFI_POWER_SAVE_LIGHT);
  wifi_wificomponent->set_fast_connect(false);
  wifi_wificomponent->set_component_source("wifi");
  App.register_component(wifi_wificomponent);
  // mdns:
  //   id: mdns_mdnscomponent
  //   disabled: false
  mdns_mdnscomponent = new mdns::MDNSComponent();
  mdns_mdnscomponent->set_component_source("mdns");
  App.register_component(mdns_mdnscomponent);
  // ota:
  //   id: ota_otacomponent
  //   safe_mode: true
  //   port: 3232
  //   reboot_timeout: 5min
  //   num_attempts: 10
  ota_otacomponent = new ota::OTAComponent();
  ota_otacomponent->set_port(3232);
  ota_otacomponent->set_component_source("ota");
  App.register_component(ota_otacomponent);
  if (ota_otacomponent->should_enter_safe_mode(10, 300000)) return;
  // api:
  //   id: api_apiserver
  //   port: 6053
  //   password: ''
  //   reboot_timeout: 15min
  api_apiserver = new api::APIServer();
  api_apiserver->set_component_source("api");
  App.register_component(api_apiserver);
  api_apiserver->set_port(6053);
  api_apiserver->set_password("");
  api_apiserver->set_reboot_timeout(900000);
  // esp32:
  //   board: esp32dev
  //   framework:
  //     version: 1.0.6
  //     source: ~3.10006.0
  //     platform_version: platformio/espressif32 @ 3.5.0
  //     type: arduino
  //   variant: ESP32
  // preferences:
  //   id: preferences_intervalsyncer
  //   flash_write_interval: 60s
  preferences_intervalsyncer = new preferences::IntervalSyncer();
  preferences_intervalsyncer->set_write_interval(60000);
  preferences_intervalsyncer->set_component_source("preferences");
  App.register_component(preferences_intervalsyncer);
  // bluetooth_proxy:
  //   id: bluetooth_proxy_bluetoothproxy
  //   esp32_ble_id: esp32_ble_tracker_esp32bletracker
  bluetooth_proxy_bluetoothproxy = new bluetooth_proxy::BluetoothProxy();
  bluetooth_proxy_bluetoothproxy->set_component_source("bluetooth_proxy");
  App.register_component(bluetooth_proxy_bluetoothproxy);
  // esp32_ble_tracker:
  //   id: esp32_ble_tracker_esp32bletracker
  //   scan_parameters:
  //     duration: 5min
  //     interval: 320ms
  //     window: 30ms
  //     active: true
  //     continuous: true
  esp32_ble_tracker_esp32bletracker = new esp32_ble_tracker::ESP32BLETracker();
  esp32_ble_tracker_esp32bletracker->set_component_source("esp32_ble_tracker");
  App.register_component(esp32_ble_tracker_esp32bletracker);
  esp32_ble_tracker_esp32bletracker->set_scan_duration(300);
  esp32_ble_tracker_esp32bletracker->set_scan_interval(512);
  esp32_ble_tracker_esp32bletracker->set_scan_window(48);
  esp32_ble_tracker_esp32bletracker->set_scan_active(true);
  esp32_ble_tracker_esp32bletracker->set_scan_continuous(true);
  // binary_sensor.ble_presence:
  //   platform: ble_presence
  //   mac_address: 44:EA:30:9A:A7:5B
  //   name: ESP32 BLE Presence Watch
  //   disabled_by_default: false
  //   id: ble_presence_blepresencedevice
  //   esp32_ble_id: esp32_ble_tracker_esp32bletracker
  ble_presence_blepresencedevice = new ble_presence::BLEPresenceDevice();
  App.register_binary_sensor(ble_presence_blepresencedevice);
  ble_presence_blepresencedevice->set_name("ESP32 BLE Presence Watch");
  ble_presence_blepresencedevice->set_disabled_by_default(false);
  ble_presence_blepresencedevice->set_component_source("ble_presence.binary_sensor");
  App.register_component(ble_presence_blepresencedevice);
  esp32_ble_tracker_esp32bletracker->register_listener(ble_presence_blepresencedevice);
  ble_presence_blepresencedevice->set_address(0x44EA309AA75BULL);
  // socket:
  //   implementation: bsd_sockets
  // network:
  //   {}
  esp32_ble_tracker_esp32bletracker->register_listener(bluetooth_proxy_bluetoothproxy);
  // =========== AUTO GENERATED CODE END ============
  App.setup();
}

void loop() {
  App.loop();
}
