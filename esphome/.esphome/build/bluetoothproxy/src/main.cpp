// Auto generated code by esphome
// ========== AUTO GENERATED INCLUDE BLOCK BEGIN ===========
#include "esphome.h"
using namespace esphome;
using std::isnan;
using std::min;
using std::max;
logger::Logger *logger_logger;
wifi::WiFiComponent *wifi_wificomponent;
mdns::MDNSComponent *mdns_mdnscomponent;
ota::OTAComponent *ota_otacomponent;
api::APIServer *api_apiserver;
using namespace api;
preferences::IntervalSyncer *preferences_intervalsyncer;
improv_serial::ImprovSerialComponent *improv_serial_improvserialcomponent;
esp32_ble_tracker::ESP32BLETracker *esp32_ble_tracker_esp32bletracker;
bluetooth_proxy::BluetoothProxy *bluetooth_proxy_bluetoothproxy;
bluetooth_proxy::BluetoothConnection *bluetooth_proxy_bluetoothconnection;
bluetooth_proxy::BluetoothConnection *bluetooth_proxy_bluetoothconnection_2;
bluetooth_proxy::BluetoothConnection *bluetooth_proxy_bluetoothconnection_3;
esp32_ble::ESP32BLE *esp32_ble_esp32ble;
// ========== AUTO GENERATED INCLUDE BLOCK END ==========="

void setup() {
  // ========== AUTO GENERATED CODE BEGIN ===========
  // esphome:
  //   name: bluetoothproxy
  //   name_add_mac_suffix: true
  //   project:
  //     name: esphome.bluetooth-proxy
  //     version: '1.0'
  //   build_path: .esphome/build/bluetoothproxy
  //   friendly_name: ''
  //   platformio_options: {}
  //   includes: []
  //   libraries: []
  //   min_version: 2023.2.0
  App.pre_setup("bluetoothproxy", "", "", __DATE__ ", " __TIME__, true);
  // logger:
  //   level: VERY_VERBOSE
  //   id: logger_logger
  //   baud_rate: 115200
  //   tx_buffer_size: 512
  //   deassert_rts_dtr: false
  //   hardware_uart: UART0
  //   logs: {}
  logger_logger = new logger::Logger(115200, 512);
  logger_logger->set_uart_selection(logger::UART_SELECTION_UART0);
  logger_logger->pre_setup();
  logger_logger->set_component_source("logger");
  App.register_component(logger_logger);
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
  //   enable_btm: false
  //   enable_rrm: false
  //   networks:
  //   - ssid: !secret 'wifi_ssid'
  //     password: !secret 'wifi_password'
  //     id: wifi_wifiap_2
  //     priority: 0.0
  //   use_address: bluetoothproxy.local
  wifi_wificomponent = new wifi::WiFiComponent();
  wifi_wificomponent->set_use_address("bluetoothproxy.local");
  {
  wifi::WiFiAP wifi_wifiap_2 = wifi::WiFiAP();
  wifi_wifiap_2.set_ssid("Mad House");
  wifi_wifiap_2.set_password("weareallmadhere");
  wifi_wifiap_2.set_priority(0.0f);
  wifi_wificomponent->add_sta(wifi_wifiap_2);
  }
  {
  wifi::WiFiAP wifi_wifiap = wifi::WiFiAP();
  wifi_wifiap.set_ssid("Bluetoothproxy Fallback Hotspot");
  wifi_wifiap.set_password("123456789");
  wifi_wificomponent->set_ap(wifi_wifiap);
  }
  wifi_wificomponent->set_ap_timeout(60000);
  wifi_wificomponent->set_reboot_timeout(900000);
  wifi_wificomponent->set_power_save_mode(wifi::WIFI_POWER_SAVE_LIGHT);
  wifi_wificomponent->set_fast_connect(false);
  wifi_wificomponent->set_component_source("wifi");
  App.register_component(wifi_wificomponent);
  // mdns:
  //   id: mdns_mdnscomponent
  //   disabled: false
  //   services: []
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
  //     version: 4.4.2
  //     sdkconfig_options: {}
  //     advanced:
  //       ignore_efuse_mac_crc: false
  //     source: ~3.40402.0
  //     platform_version: platformio/espressif32 @ 5.2.0
  //     type: esp-idf
  //   variant: ESP32
  // preferences:
  //   id: preferences_intervalsyncer
  //   flash_write_interval: 60s
  preferences_intervalsyncer = new preferences::IntervalSyncer();
  preferences_intervalsyncer->set_write_interval(60000);
  preferences_intervalsyncer->set_component_source("preferences");
  App.register_component(preferences_intervalsyncer);
  // improv_serial:
  //   id: improv_serial_improvserialcomponent
  improv_serial_improvserialcomponent = new improv_serial::ImprovSerialComponent();
  improv_serial_improvserialcomponent->set_component_source("improv_serial");
  App.register_component(improv_serial_improvserialcomponent);
  // dashboard_import:
  //   package_import_url: github:esphome/bluetooth-proxies/esp32-generic.yaml@main
  //   import_full_config: false
  dashboard_import::set_package_import_url("github://esphome/bluetooth-proxies/esp32-generic.yaml@main");
  // esp32_ble_tracker:
  //   scan_parameters:
  //     interval: 100ms
  //     window: 100ms
  //     active: true
  //     duration: 5min
  //     continuous: true
  //   id: esp32_ble_tracker_esp32bletracker
  //   ble_id: esp32_ble_esp32ble
  esp32_ble_tracker_esp32bletracker = new esp32_ble_tracker::ESP32BLETracker();
  esp32_ble_tracker_esp32bletracker->set_component_source("esp32_ble_tracker");
  App.register_component(esp32_ble_tracker_esp32bletracker);
  // bluetooth_proxy:
  //   active: true
  //   id: bluetooth_proxy_bluetoothproxy
  //   cache_services: true
  //   esp32_ble_id: esp32_ble_tracker_esp32bletracker
  //   connections:
  //   - esp32_ble_id: esp32_ble_tracker_esp32bletracker
  //     id: bluetooth_proxy_bluetoothconnection
  //   - esp32_ble_id: esp32_ble_tracker_esp32bletracker
  //     id: bluetooth_proxy_bluetoothconnection_2
  //   - esp32_ble_id: esp32_ble_tracker_esp32bletracker
  //     id: bluetooth_proxy_bluetoothconnection_3
  bluetooth_proxy_bluetoothproxy = new bluetooth_proxy::BluetoothProxy();
  bluetooth_proxy_bluetoothproxy->set_component_source("bluetooth_proxy");
  App.register_component(bluetooth_proxy_bluetoothproxy);
  bluetooth_proxy_bluetoothproxy->set_active(true);
  esp32_ble_tracker_esp32bletracker->register_listener(bluetooth_proxy_bluetoothproxy);
  bluetooth_proxy_bluetoothconnection = new bluetooth_proxy::BluetoothConnection();
  bluetooth_proxy_bluetoothconnection->set_component_source("bluetooth_proxy");
  App.register_component(bluetooth_proxy_bluetoothconnection);
  bluetooth_proxy_bluetoothproxy->register_connection(bluetooth_proxy_bluetoothconnection);
  esp32_ble_tracker_esp32bletracker->register_client(bluetooth_proxy_bluetoothconnection);
  bluetooth_proxy_bluetoothconnection_2 = new bluetooth_proxy::BluetoothConnection();
  bluetooth_proxy_bluetoothconnection_2->set_component_source("bluetooth_proxy");
  App.register_component(bluetooth_proxy_bluetoothconnection_2);
  bluetooth_proxy_bluetoothproxy->register_connection(bluetooth_proxy_bluetoothconnection_2);
  esp32_ble_tracker_esp32bletracker->register_client(bluetooth_proxy_bluetoothconnection_2);
  bluetooth_proxy_bluetoothconnection_3 = new bluetooth_proxy::BluetoothConnection();
  bluetooth_proxy_bluetoothconnection_3->set_component_source("bluetooth_proxy");
  App.register_component(bluetooth_proxy_bluetoothconnection_3);
  bluetooth_proxy_bluetoothproxy->register_connection(bluetooth_proxy_bluetoothconnection_3);
  esp32_ble_tracker_esp32bletracker->register_client(bluetooth_proxy_bluetoothconnection_3);
  // socket:
  //   implementation: bsd_sockets
  // network:
  //   enable_ipv6: false
  // esp32_ble:
  //   id: esp32_ble_esp32ble
  esp32_ble_esp32ble = new esp32_ble::ESP32BLE();
  esp32_ble_esp32ble->set_component_source("esp32_ble");
  App.register_component(esp32_ble_esp32ble);
  esp32_ble_esp32ble->register_gap_event_handler(esp32_ble_tracker_esp32bletracker);
  esp32_ble_esp32ble->register_gattc_event_handler(esp32_ble_tracker_esp32bletracker);
  esp32_ble_tracker_esp32bletracker->set_parent(esp32_ble_esp32ble);
  esp32_ble_tracker_esp32bletracker->set_scan_duration(300);
  esp32_ble_tracker_esp32bletracker->set_scan_interval(160);
  esp32_ble_tracker_esp32bletracker->set_scan_window(160);
  esp32_ble_tracker_esp32bletracker->set_scan_active(true);
  esp32_ble_tracker_esp32bletracker->set_scan_continuous(true);
  // =========== AUTO GENERATED CODE END ============
  App.setup();
}

void loop() {
  App.loop();
}
