// Auto generated code by esphome
// ========== AUTO GENERATED INCLUDE BLOCK BEGIN ===========
#include "esphome.h"
using namespace esphome;
using std::isnan;
using std::min;
using std::max;
using namespace binary_sensor;
using namespace text_sensor;
logger::Logger *logger_logger;
web_server_base::WebServerBase *web_server_base_webserverbase;
captive_portal::CaptivePortal *captive_portal_captiveportal;
wifi::WiFiComponent *wifi_wificomponent;
mdns::MDNSComponent *mdns_mdnscomponent;
ota::OTAComponent *ota_otacomponent;
api::APIServer *api_apiserver;
using namespace api;
using namespace sensor;
preferences::IntervalSyncer *preferences_intervalsyncer;
dht::DHT *dht_dht;
esphome::esp8266::ESP8266GPIOPin *esphome_esp8266_esp8266gpiopin;
sensor::Sensor *sensor_sensor;
sensor::Sensor *sensor_sensor_2;
adc::ADCSensor *adc_adcsensor;
sensor::LambdaFilter *sensor_lambdafilter;
esphome::esp8266::ESP8266GPIOPin *esphome_esp8266_esp8266gpiopin_2;
gpio::GPIOBinarySensor *gpio_gpiobinarysensor;
esphome::esp8266::ESP8266GPIOPin *esphome_esp8266_esp8266gpiopin_3;
status::StatusBinarySensor *status_statusbinarysensor;
version::VersionTextSensor *version_versiontextsensor;
wifi_info::IPAddressWiFiInfo *wifi_info_ipaddresswifiinfo;
wifi_info::SSIDWiFiInfo *wifi_info_ssidwifiinfo;
const uint8_t ESPHOME_ESP8266_GPIO_INITIAL_MODE[16] = {255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, INPUT, INPUT, 255, 255};
const uint8_t ESPHOME_ESP8266_GPIO_INITIAL_LEVEL[16] = {255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255};
#define yield() esphome::yield()
#define millis() esphome::millis()
#define micros() esphome::micros()
#define delay(x) esphome::delay(x)
#define delayMicroseconds(x) esphome::delayMicroseconds(x)
// ========== AUTO GENERATED INCLUDE BLOCK END ==========="

void setup() {
  // ========== AUTO GENERATED CODE BEGIN ===========
  // esp8266:
  //   board: nodemcuv2
  //   framework:
  //     version: 3.0.2
  //     source: ~3.30002.0
  //     platform_version: platformio/espressif8266 @ 3.2.0
  //   restore_from_flash: false
  //   early_pin_init: true
  //   board_flash_mode: dout
  esphome::esp8266::setup_preferences();
  // async_tcp:
  //   {}
  // esphome:
  //   name: multisensor-1
  //   build_path: .esphome/build/multisensor-1
  //   platformio_options: {}
  //   includes: []
  //   libraries: []
  //   name_add_mac_suffix: false
  //   min_version: 2022.11.4
  App.pre_setup("multisensor-1", __DATE__ ", " __TIME__, false);
  // binary_sensor:
  // text_sensor:
  // logger:
  //   id: logger_logger
  //   baud_rate: 115200
  //   tx_buffer_size: 512
  //   deassert_rts_dtr: false
  //   hardware_uart: UART0
  //   level: DEBUG
  //   logs: {}
  //   esp8266_store_log_strings_in_flash: true
  logger_logger = new logger::Logger(115200, 512);
  logger_logger->set_uart_selection(logger::UART_SELECTION_UART0);
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
  //     ssid: multisensor-1 Fallback Hotspot
  //     password: '123456789'
  //     id: wifi_wifiap
  //     ap_timeout: 1min
  //   id: wifi_wificomponent
  //   domain: .local
  //   reboot_timeout: 15min
  //   power_save_mode: NONE
  //   fast_connect: false
  //   output_power: 20.0
  //   networks:
  //   - ssid: !secret 'wifi_ssid'
  //     password: !secret 'wifi_password'
  //     id: wifi_wifiap_2
  //     priority: 0.0
  //   use_address: multisensor-1.local
  wifi_wificomponent = new wifi::WiFiComponent();
  wifi_wificomponent->set_use_address("multisensor-1.local");
  {
  wifi::WiFiAP wifi_wifiap_2 = wifi::WiFiAP();
  wifi_wifiap_2.set_ssid("Everyday I'm Buffering");
  wifi_wifiap_2.set_password("notyourordinarywifi");
  wifi_wifiap_2.set_priority(0.0f);
  wifi_wificomponent->add_sta(wifi_wifiap_2);
  }
  {
  wifi::WiFiAP wifi_wifiap = wifi::WiFiAP();
  wifi_wifiap.set_ssid("multisensor-1 Fallback Hotspot");
  wifi_wifiap.set_password("123456789");
  wifi_wificomponent->set_ap(wifi_wifiap);
  }
  wifi_wificomponent->set_ap_timeout(60000);
  wifi_wificomponent->set_reboot_timeout(900000);
  wifi_wificomponent->set_power_save_mode(wifi::WIFI_POWER_SAVE_NONE);
  wifi_wificomponent->set_fast_connect(false);
  wifi_wificomponent->set_output_power(20.0f);
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
  //   port: 8266
  //   reboot_timeout: 5min
  //   num_attempts: 10
  ota_otacomponent = new ota::OTAComponent();
  ota_otacomponent->set_port(8266);
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
  // sensor:
  // substitutions:
  //   name: multisensor-1
  //   friendly_name: Multisensor 1
  // preferences:
  //   id: preferences_intervalsyncer
  //   flash_write_interval: 60s
  preferences_intervalsyncer = new preferences::IntervalSyncer();
  preferences_intervalsyncer->set_write_interval(60000);
  preferences_intervalsyncer->set_component_source("preferences");
  App.register_component(preferences_intervalsyncer);
  // sensor.dht:
  //   platform: dht
  //   pin:
  //     number: 13
  //     mode:
  //       input: true
  //       analog: false
  //       output: false
  //       open_drain: false
  //       pullup: false
  //       pulldown: false
  //     id: esphome_esp8266_esp8266gpiopin
  //     inverted: false
  //   model: DHT11
  //   update_interval: 30s
  //   temperature:
  //     name: Multisensor 1 Temperature
  //     disabled_by_default: false
  //     id: sensor_sensor
  //     force_update: false
  //     unit_of_measurement: °C
  //     accuracy_decimals: 1
  //     device_class: temperature
  //     state_class: measurement
  //   humidity:
  //     name: Multisensor 1 Humidity
  //     disabled_by_default: false
  //     id: sensor_sensor_2
  //     force_update: false
  //     unit_of_measurement: '%'
  //     accuracy_decimals: 0
  //     device_class: humidity
  //     state_class: measurement
  //   id: dht_dht
  dht_dht = new dht::DHT();
  dht_dht->set_update_interval(30000);
  dht_dht->set_component_source("dht.sensor");
  App.register_component(dht_dht);
  esphome_esp8266_esp8266gpiopin = new esphome::esp8266::ESP8266GPIOPin();
  esphome_esp8266_esp8266gpiopin->set_pin(13);
  esphome_esp8266_esp8266gpiopin->set_inverted(false);
  esphome_esp8266_esp8266gpiopin->set_flags(gpio::Flags::FLAG_INPUT);
  dht_dht->set_pin(esphome_esp8266_esp8266gpiopin);
  sensor_sensor = new sensor::Sensor();
  App.register_sensor(sensor_sensor);
  sensor_sensor->set_name("Multisensor 1 Temperature");
  sensor_sensor->set_disabled_by_default(false);
  sensor_sensor->set_device_class("temperature");
  sensor_sensor->set_state_class(sensor::STATE_CLASS_MEASUREMENT);
  sensor_sensor->set_unit_of_measurement("\302\260C");
  sensor_sensor->set_accuracy_decimals(1);
  sensor_sensor->set_force_update(false);
  dht_dht->set_temperature_sensor(sensor_sensor);
  sensor_sensor_2 = new sensor::Sensor();
  App.register_sensor(sensor_sensor_2);
  sensor_sensor_2->set_name("Multisensor 1 Humidity");
  sensor_sensor_2->set_disabled_by_default(false);
  sensor_sensor_2->set_device_class("humidity");
  sensor_sensor_2->set_state_class(sensor::STATE_CLASS_MEASUREMENT);
  sensor_sensor_2->set_unit_of_measurement("%");
  sensor_sensor_2->set_accuracy_decimals(0);
  sensor_sensor_2->set_force_update(false);
  dht_dht->set_humidity_sensor(sensor_sensor_2);
  dht_dht->set_dht_model(dht::DHT_MODEL_DHT11);
  // sensor.adc:
  //   platform: adc
  //   pin:
  //     number: 17
  //     mode:
  //       analog: true
  //       input: true
  //       output: false
  //       open_drain: false
  //       pullup: false
  //       pulldown: false
  //     id: esphome_esp8266_esp8266gpiopin_2
  //     inverted: false
  //   name: Multisensor 1 Light
  //   device_class: illuminance
  //   update_interval: 2s
  //   unit_of_measurement: lx
  //   filters:
  //   - lambda: !lambda |-
  //       return (x / 10000.0) * 2000000.0;
  //     type_id: sensor_lambdafilter
  //   disabled_by_default: false
  //   force_update: false
  //   id: adc_adcsensor
  //   accuracy_decimals: 2
  //   state_class: measurement
  //   raw: false
  adc_adcsensor = new adc::ADCSensor();
  adc_adcsensor->set_update_interval(2000);
  adc_adcsensor->set_component_source("adc.sensor");
  App.register_component(adc_adcsensor);
  App.register_sensor(adc_adcsensor);
  adc_adcsensor->set_name("Multisensor 1 Light");
  adc_adcsensor->set_disabled_by_default(false);
  adc_adcsensor->set_device_class("illuminance");
  adc_adcsensor->set_state_class(sensor::STATE_CLASS_MEASUREMENT);
  adc_adcsensor->set_unit_of_measurement("lx");
  adc_adcsensor->set_accuracy_decimals(2);
  adc_adcsensor->set_force_update(false);
  sensor_lambdafilter = new sensor::LambdaFilter([=](float x) -> optional<float> {
      #line 43 "/config/esphome/multisensor-1.yaml"
      return (x / 10000.0) * 2000000.0;
  });
  adc_adcsensor->set_filters({sensor_lambdafilter});
  esphome_esp8266_esp8266gpiopin_2 = new esphome::esp8266::ESP8266GPIOPin();
  esphome_esp8266_esp8266gpiopin_2->set_pin(17);
  esphome_esp8266_esp8266gpiopin_2->set_inverted(false);
  esphome_esp8266_esp8266gpiopin_2->set_flags(gpio::Flags::FLAG_INPUT);
  adc_adcsensor->set_pin(esphome_esp8266_esp8266gpiopin_2);
  adc_adcsensor->set_output_raw(false);
  // binary_sensor.gpio:
  //   platform: gpio
  //   pin:
  //     number: 12
  //     mode:
  //       input: true
  //       analog: false
  //       output: false
  //       open_drain: false
  //       pullup: false
  //       pulldown: false
  //     id: esphome_esp8266_esp8266gpiopin_3
  //     inverted: false
  //   name: Multisensor 1 Motion
  //   device_class: motion
  //   disabled_by_default: false
  //   id: gpio_gpiobinarysensor
  gpio_gpiobinarysensor = new gpio::GPIOBinarySensor();
  App.register_binary_sensor(gpio_gpiobinarysensor);
  gpio_gpiobinarysensor->set_name("Multisensor 1 Motion");
  gpio_gpiobinarysensor->set_disabled_by_default(false);
  gpio_gpiobinarysensor->set_device_class("motion");
  gpio_gpiobinarysensor->set_component_source("gpio.binary_sensor");
  App.register_component(gpio_gpiobinarysensor);
  esphome_esp8266_esp8266gpiopin_3 = new esphome::esp8266::ESP8266GPIOPin();
  esphome_esp8266_esp8266gpiopin_3->set_pin(12);
  esphome_esp8266_esp8266gpiopin_3->set_inverted(false);
  esphome_esp8266_esp8266gpiopin_3->set_flags(gpio::Flags::FLAG_INPUT);
  gpio_gpiobinarysensor->set_pin(esphome_esp8266_esp8266gpiopin_3);
  // binary_sensor.status:
  //   platform: status
  //   name: Multisensor 1 Status
  //   entity_category: diagnostic
  //   disabled_by_default: false
  //   id: status_statusbinarysensor
  //   device_class: connectivity
  status_statusbinarysensor = new status::StatusBinarySensor();
  App.register_binary_sensor(status_statusbinarysensor);
  status_statusbinarysensor->set_name("Multisensor 1 Status");
  status_statusbinarysensor->set_disabled_by_default(false);
  status_statusbinarysensor->set_entity_category(::ENTITY_CATEGORY_DIAGNOSTIC);
  status_statusbinarysensor->set_device_class("connectivity");
  status_statusbinarysensor->set_component_source("status.binary_sensor");
  App.register_component(status_statusbinarysensor);
  // text_sensor.version:
  //   platform: version
  //   hide_timestamp: true
  //   name: Multisensor 1 ESPHome Version
  //   entity_category: diagnostic
  //   disabled_by_default: false
  //   icon: mdi:new-box
  //   id: version_versiontextsensor
  version_versiontextsensor = new version::VersionTextSensor();
  App.register_text_sensor(version_versiontextsensor);
  version_versiontextsensor->set_name("Multisensor 1 ESPHome Version");
  version_versiontextsensor->set_disabled_by_default(false);
  version_versiontextsensor->set_icon("mdi:new-box");
  version_versiontextsensor->set_entity_category(::ENTITY_CATEGORY_DIAGNOSTIC);
  version_versiontextsensor->set_component_source("version.text_sensor");
  App.register_component(version_versiontextsensor);
  version_versiontextsensor->set_hide_timestamp(true);
  // text_sensor.wifi_info:
  //   platform: wifi_info
  //   ip_address:
  //     name: Multisensor 1 IP Address
  //     icon: mdi:ip
  //     entity_category: diagnostic
  //     disabled_by_default: false
  //     id: wifi_info_ipaddresswifiinfo
  //     update_interval: 1s
  //   ssid:
  //     name: Multisensor 1 Connected SSID
  //     icon: mdi:wifi
  //     entity_category: diagnostic
  //     disabled_by_default: false
  //     id: wifi_info_ssidwifiinfo
  //     update_interval: 1s
  wifi_info_ipaddresswifiinfo = new wifi_info::IPAddressWiFiInfo();
  App.register_text_sensor(wifi_info_ipaddresswifiinfo);
  wifi_info_ipaddresswifiinfo->set_name("Multisensor 1 IP Address");
  wifi_info_ipaddresswifiinfo->set_disabled_by_default(false);
  wifi_info_ipaddresswifiinfo->set_icon("mdi:ip");
  wifi_info_ipaddresswifiinfo->set_entity_category(::ENTITY_CATEGORY_DIAGNOSTIC);
  wifi_info_ipaddresswifiinfo->set_update_interval(1000);
  wifi_info_ipaddresswifiinfo->set_component_source("wifi_info.text_sensor");
  App.register_component(wifi_info_ipaddresswifiinfo);
  wifi_info_ssidwifiinfo = new wifi_info::SSIDWiFiInfo();
  App.register_text_sensor(wifi_info_ssidwifiinfo);
  wifi_info_ssidwifiinfo->set_name("Multisensor 1 Connected SSID");
  wifi_info_ssidwifiinfo->set_disabled_by_default(false);
  wifi_info_ssidwifiinfo->set_icon("mdi:wifi");
  wifi_info_ssidwifiinfo->set_entity_category(::ENTITY_CATEGORY_DIAGNOSTIC);
  wifi_info_ssidwifiinfo->set_update_interval(1000);
  wifi_info_ssidwifiinfo->set_component_source("wifi_info.text_sensor");
  App.register_component(wifi_info_ssidwifiinfo);
  // network:
  //   {}
  // socket:
  //   implementation: lwip_tcp
  // =========== AUTO GENERATED CODE END ============
  App.setup();
}

void loop() {
  App.loop();
}
