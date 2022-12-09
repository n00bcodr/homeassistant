// Auto generated code by esphome
// ========== AUTO GENERATED INCLUDE BLOCK BEGIN ===========
#include "esphome.h"
using namespace esphome;
using std::isnan;
using std::min;
using std::max;
using namespace switch_;
using namespace button;
using namespace binary_sensor;
using namespace text_sensor;
using namespace light;
logger::Logger *logger_logger;
web_server_base::WebServerBase *web_server_base_webserverbase;
captive_portal::CaptivePortal *captive_portal_captiveportal;
wifi::WiFiComponent *wifi_wificomponent;
mdns::MDNSComponent *mdns_mdnscomponent;
ota::OTAComponent *ota_otacomponent;
api::APIServer *api_apiserver;
api::UserServiceTrigger<> *api_userservicetrigger;
Automation<> *automation_5;
StartupTrigger *startuptrigger;
Automation<> *automation;
api::APIConnectedCondition<> *api_apiconnectedcondition;
WaitUntilAction<> *waituntilaction;
LambdaAction<> *lambdaaction;
using namespace i2c;
i2c::ArduinoI2CBus *i2c_arduinoi2cbus;
preferences::IntervalSyncer *preferences_intervalsyncer;
improv_serial::ImprovSerialComponent *improv_serial_improvserialcomponent;
template_::TemplateSwitch *buzzer_enabled;
template_::TemplateSwitch *led_enabled;
template_::TemplateButton *write_tag_random;
button::ButtonPressTrigger *button_buttonpresstrigger;
Automation<> *automation_2;
template_::TemplateButton *clean_tag;
button::ButtonPressTrigger *button_buttonpresstrigger_2;
Automation<> *automation_3;
template_::TemplateButton *cancel_writing;
button::ButtonPressTrigger *button_buttonpresstrigger_3;
Automation<> *automation_4;
restart::RestartButton *restart_restartbutton;
pn532_i2c::PN532I2C *pn532_board;
nfc::NfcOnTagTrigger *nfc_nfcontagtrigger;
Automation<std::string, nfc::NfcTag> *automation_9;
api::HomeAssistantServiceCallAction<std::string, nfc::NfcTag> *api_homeassistantservicecallaction;
switch_::SwitchCondition<std::string, nfc::NfcTag> *switch__switchcondition;
IfAction<std::string, nfc::NfcTag> *ifaction;
using namespace output;
esp8266_pwm::ESP8266PWM *buzzer;
esphome::esp8266::ESP8266GPIOPin *esphome_esp8266_esp8266gpiopin;
status::StatusBinarySensor *status_statusbinarysensor;
version::VersionTextSensor *version_versiontextsensor;
wifi_info::IPAddressWiFiInfo *wifi_info_ipaddresswifiinfo;
wifi_info::SSIDWiFiInfo *wifi_info_ssidwifiinfo;
rtttl::Rtttl *rtttl_rtttl;
neopixelbus::NeoPixelRGBLightOutput<NeoEspBitBangMethodBase<NeoEspBitBangSpeed800Kbps, NeoEspPinset>> *neopixelbus_neopixelbuslightoutputbase;
light::AddressableLightState *activity_led;
rtttl::PlayAction<> *rtttl_playaction;
light::LightControlAction<> *light_lightcontrolaction;
switch_::TurnOnAction<> *switch__turnonaction;
switch_::TurnOnAction<> *switch__turnonaction_2;
light::LightControlAction<> *light_lightcontrolaction_2;
LambdaAction<> *lambdaaction_2;
pn532::PN532IsWritingCondition<> *pn532_pn532iswritingcondition;
NotCondition<> *notcondition;
WaitUntilAction<> *waituntilaction_2;
light::LightControlAction<> *light_lightcontrolaction_3;
light::LightControlAction<> *light_lightcontrolaction_4;
LambdaAction<> *lambdaaction_3;
pn532::PN532IsWritingCondition<> *pn532_pn532iswritingcondition_2;
NotCondition<> *notcondition_2;
WaitUntilAction<> *waituntilaction_3;
light::LightControlAction<> *light_lightcontrolaction_5;
LambdaAction<> *lambdaaction_4;
rtttl::PlayAction<> *rtttl_playaction_2;
api::UserServiceTrigger<> *api_userservicetrigger_2;
Automation<> *automation_6;
rtttl::PlayAction<> *rtttl_playaction_3;
api::UserServiceTrigger<std::string> *api_userservicetrigger_3;
Automation<std::string> *automation_7;
rtttl::PlayAction<std::string> *rtttl_playaction_4;
api::UserServiceTrigger<std::string> *api_userservicetrigger_4;
Automation<std::string> *automation_8;
light::LightControlAction<std::string> *light_lightcontrolaction_6;
LambdaAction<std::string> *lambdaaction_5;
pn532::PN532IsWritingCondition<std::string> *pn532_pn532iswritingcondition_3;
NotCondition<std::string> *notcondition_3;
WaitUntilAction<std::string> *waituntilaction_4;
light::LightControlAction<std::string> *light_lightcontrolaction_7;
using namespace api;
rtttl::PlayAction<std::string, nfc::NfcTag> *rtttl_playaction_5;
switch_::SwitchCondition<std::string, nfc::NfcTag> *switch__switchcondition_2;
IfAction<std::string, nfc::NfcTag> *ifaction_2;
light::LightControlAction<std::string, nfc::NfcTag> *light_lightcontrolaction_8;
const uint8_t ESPHOME_ESP8266_GPIO_INITIAL_MODE[16] = {255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, OUTPUT, 255, 255};
const uint8_t ESPHOME_ESP8266_GPIO_INITIAL_LEVEL[16] = {255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 255, 255};
#define yield() esphome::yield()
#define millis() esphome::millis()
#define micros() esphome::micros()
#define delay(x) esphome::delay(x)
#define delayMicroseconds(x) esphome::delayMicroseconds(x)
// ========== AUTO GENERATED INCLUDE BLOCK END ==========="

void setup() {
  // ========== AUTO GENERATED CODE BEGIN ===========
  // esp8266:
  //   board: d1_mini
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
  //   name: tagreader
  //   on_boot:
  //   - priority: -10.0
  //     then:
  //     - wait_until:
  //         condition:
  //           api.connected: {}
  //           type_id: api_apiconnectedcondition
  //       type_id: waituntilaction
  //     - logger.log:
  //         format: API is connected!
  //         tag: main
  //         args: []
  //         level: DEBUG
  //       type_id: lambdaaction
  //     - rtttl.play:
  //         rtttl: success:d=24,o=5,b=100:c,g,b
  //         id: rtttl_rtttl
  //       type_id: rtttl_playaction
  //     - light.turn_on:
  //         id: activity_led
  //         brightness: 1.0
  //         red: 0.0
  //         green: 0.0
  //         blue: 1.0
  //         flash_length: 500ms
  //         state: true
  //       type_id: light_lightcontrolaction
  //     - switch.turn_on:
  //         id: buzzer_enabled
  //       type_id: switch__turnonaction
  //     - switch.turn_on:
  //         id: led_enabled
  //       type_id: switch__turnonaction_2
  //     automation_id: automation
  //     trigger_id: startuptrigger
  //   build_path: .esphome/build/tagreader
  //   platformio_options: {}
  //   includes: []
  //   libraries: []
  //   name_add_mac_suffix: false
  //   min_version: 2022.11.4
  App.pre_setup("tagreader", __DATE__ ", " __TIME__, false);
  // switch:
  // button:
  // binary_sensor:
  // text_sensor:
  // light:
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
  //     ssid: tagreader Fallback Hotspot
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
  //   use_address: tagreader.local
  wifi_wificomponent = new wifi::WiFiComponent();
  wifi_wificomponent->set_use_address("tagreader.local");
  {
  wifi::WiFiAP wifi_wifiap_2 = wifi::WiFiAP();
  wifi_wifiap_2.set_ssid("Everyday I'm Buffering");
  wifi_wifiap_2.set_password("notyourordinarywifi");
  wifi_wifiap_2.set_priority(0.0f);
  wifi_wificomponent->add_sta(wifi_wifiap_2);
  }
  {
  wifi::WiFiAP wifi_wifiap = wifi::WiFiAP();
  wifi_wifiap.set_ssid("tagreader Fallback Hotspot");
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
  //   services:
  //   - service: rfidreader_tag_ok
  //     then:
  //     - rtttl.play:
  //         rtttl: beep:d=16,o=5,b=100:b
  //         id: rtttl_rtttl
  //       type_id: rtttl_playaction_2
  //     automation_id: automation_5
  //     trigger_id: api_userservicetrigger
  //     variables: {}
  //   - service: rfidreader_tag_ko
  //     then:
  //     - rtttl.play:
  //         rtttl: beep:d=8,o=5,b=100:b
  //         id: rtttl_rtttl
  //       type_id: rtttl_playaction_3
  //     automation_id: automation_6
  //     trigger_id: api_userservicetrigger_2
  //     variables: {}
  //   - service: play_rtttl
  //     variables:
  //       song_str: string
  //     then:
  //     - rtttl.play:
  //         rtttl: !lambda |-
  //           return song_str;
  //         id: rtttl_rtttl
  //       type_id: rtttl_playaction_4
  //     automation_id: automation_7
  //     trigger_id: api_userservicetrigger_3
  //   - service: write_tag_id
  //     variables:
  //       tag_id: string
  //     then:
  //     - light.turn_on:
  //         id: activity_led
  //         brightness: 1.0
  //         red: 1.0
  //         green: 0.0
  //         blue: 0.0
  //         state: true
  //       type_id: light_lightcontrolaction_6
  //     - lambda: !lambda |-
  //         auto message = new nfc::NdefMessage();
  //         std::string uri = "https:www.home-assistant.io/tag/";
  //         uri += tag_id;
  //         message->add_uri_record(uri);
  //         id(pn532_board).write_mode(message);
  //       type_id: lambdaaction_5
  //     - wait_until:
  //         condition:
  //           not:
  //             pn532.is_writing:
  //               id: pn532_board
  //             type_id: pn532_pn532iswritingcondition_3
  //           type_id: notcondition_3
  //       type_id: waituntilaction_4
  //     - light.turn_off:
  //         id: activity_led
  //         state: false
  //       type_id: light_lightcontrolaction_7
  //     automation_id: automation_8
  //     trigger_id: api_userservicetrigger_4
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
  api_userservicetrigger = new api::UserServiceTrigger<>("rfidreader_tag_ok", {});
  api_apiserver->register_user_service(api_userservicetrigger);
  automation_5 = new Automation<>(api_userservicetrigger);
  startuptrigger = new StartupTrigger(-10.0f);
  startuptrigger->set_component_source("esphome.coroutine");
  App.register_component(startuptrigger);
  automation = new Automation<>(startuptrigger);
  api_apiconnectedcondition = new api::APIConnectedCondition<>();
  waituntilaction = new WaitUntilAction<>(api_apiconnectedcondition);
  waituntilaction->set_component_source("esphome.coroutine");
  App.register_component(waituntilaction);
  lambdaaction = new LambdaAction<>([=]() -> void {
      ESP_LOGD("main", "API is connected!");
  });
  // i2c:
  //   scan: false
  //   frequency: 400000.0
  //   id: i2c_arduinoi2cbus
  //   sda: 4
  //   scl: 5
  i2c_arduinoi2cbus = new i2c::ArduinoI2CBus();
  i2c_arduinoi2cbus->set_component_source("i2c");
  App.register_component(i2c_arduinoi2cbus);
  i2c_arduinoi2cbus->set_sda_pin(4);
  i2c_arduinoi2cbus->set_scl_pin(5);
  i2c_arduinoi2cbus->set_frequency(400000);
  i2c_arduinoi2cbus->set_scan(false);
  // substitutions:
  //   name: tagreader
  //   friendly_name: Tag Reader
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
  // switch.template:
  //   platform: template
  //   name: Tag Reader Buzzer Enabled
  //   id: buzzer_enabled
  //   icon: mdi:volume-high
  //   optimistic: true
  //   restore_state: true
  //   entity_category: config
  //   disabled_by_default: false
  //   assumed_state: false
  buzzer_enabled = new template_::TemplateSwitch();
  App.register_switch(buzzer_enabled);
  buzzer_enabled->set_name("Tag Reader Buzzer Enabled");
  buzzer_enabled->set_disabled_by_default(false);
  buzzer_enabled->set_icon("mdi:volume-high");
  buzzer_enabled->set_entity_category(::ENTITY_CATEGORY_CONFIG);
  buzzer_enabled->set_component_source("template.switch");
  App.register_component(buzzer_enabled);
  buzzer_enabled->set_optimistic(true);
  buzzer_enabled->set_assumed_state(false);
  buzzer_enabled->set_restore_state(true);
  // switch.template:
  //   platform: template
  //   name: Tag Reader LED enabled
  //   id: led_enabled
  //   icon: mdi:alarm-light-outline
  //   optimistic: true
  //   restore_state: true
  //   entity_category: config
  //   disabled_by_default: false
  //   assumed_state: false
  led_enabled = new template_::TemplateSwitch();
  App.register_switch(led_enabled);
  led_enabled->set_name("Tag Reader LED enabled");
  led_enabled->set_disabled_by_default(false);
  led_enabled->set_icon("mdi:alarm-light-outline");
  led_enabled->set_entity_category(::ENTITY_CATEGORY_CONFIG);
  led_enabled->set_component_source("template.switch");
  App.register_component(led_enabled);
  led_enabled->set_optimistic(true);
  led_enabled->set_assumed_state(false);
  led_enabled->set_restore_state(true);
  // button.template:
  //   platform: template
  //   name: Write Tag Random
  //   id: write_tag_random
  //   icon: mdi:pencil-box
  //   on_press:
  //   - then:
  //     - light.turn_on:
  //         id: activity_led
  //         brightness: 1.0
  //         red: 1.0
  //         green: 0.0
  //         blue: 1.0
  //         state: true
  //       type_id: light_lightcontrolaction_2
  //     - lambda: !lambda |-
  //         static const char alphanum[] = "0123456789abcdef";
  //         std::string uri = "https:www.home-assistant.io/tag/";
  //         for (int i = 0; i < 8; i++)
  //           uri += alphanum[random_uint32() % (sizeof(alphanum) - 1)];
  //         uri += "-";
  //         for (int j = 0; j < 3; j++) {
  //           for (int i = 0; i < 4; i++)
  //             uri += alphanum[random_uint32() % (sizeof(alphanum) - 1)];
  //           uri += "-";
  //         }
  //         for (int i = 0; i < 12; i++)
  //           uri += alphanum[random_uint32() % (sizeof(alphanum) - 1)];
  //         auto message = new nfc::NdefMessage();
  //         message->add_uri_record(uri);
  //         ESP_LOGD("tagreader", "Writing payload: %s", uri.c_str());
  //         id(pn532_board).write_mode(message);
  //       type_id: lambdaaction_2
  //     - wait_until:
  //         condition:
  //           not:
  //             pn532.is_writing:
  //               id: pn532_board
  //             type_id: pn532_pn532iswritingcondition
  //           type_id: notcondition
  //       type_id: waituntilaction_2
  //     - light.turn_off:
  //         id: activity_led
  //         state: false
  //       type_id: light_lightcontrolaction_3
  //     automation_id: automation_2
  //     trigger_id: button_buttonpresstrigger
  //   disabled_by_default: false
  write_tag_random = new template_::TemplateButton();
  App.register_button(write_tag_random);
  write_tag_random->set_name("Write Tag Random");
  write_tag_random->set_disabled_by_default(false);
  write_tag_random->set_icon("mdi:pencil-box");
  button_buttonpresstrigger = new button::ButtonPressTrigger(write_tag_random);
  automation_2 = new Automation<>(button_buttonpresstrigger);
  // button.template:
  //   platform: template
  //   name: Clean Tag
  //   id: clean_tag
  //   icon: mdi:nfc-variant-off
  //   on_press:
  //   - then:
  //     - light.turn_on:
  //         id: activity_led
  //         brightness: 1.0
  //         red: 1.0
  //         green: 0.647
  //         blue: 0.0
  //         state: true
  //       type_id: light_lightcontrolaction_4
  //     - lambda: !lambda |-
  //         id(pn532_board).clean_mode();
  //       type_id: lambdaaction_3
  //     - wait_until:
  //         condition:
  //           not:
  //             pn532.is_writing:
  //               id: pn532_board
  //             type_id: pn532_pn532iswritingcondition_2
  //           type_id: notcondition_2
  //       type_id: waituntilaction_3
  //     - light.turn_off:
  //         id: activity_led
  //         state: false
  //       type_id: light_lightcontrolaction_5
  //     automation_id: automation_3
  //     trigger_id: button_buttonpresstrigger_2
  //   disabled_by_default: false
  clean_tag = new template_::TemplateButton();
  App.register_button(clean_tag);
  clean_tag->set_name("Clean Tag");
  clean_tag->set_disabled_by_default(false);
  clean_tag->set_icon("mdi:nfc-variant-off");
  button_buttonpresstrigger_2 = new button::ButtonPressTrigger(clean_tag);
  automation_3 = new Automation<>(button_buttonpresstrigger_2);
  // button.template:
  //   platform: template
  //   name: Cancel writing
  //   id: cancel_writing
  //   icon: mdi:pencil-off
  //   on_press:
  //   - then:
  //     - lambda: !lambda |-
  //         id(pn532_board).read_mode();
  //       type_id: lambdaaction_4
  //     automation_id: automation_4
  //     trigger_id: button_buttonpresstrigger_3
  //   disabled_by_default: false
  cancel_writing = new template_::TemplateButton();
  App.register_button(cancel_writing);
  cancel_writing->set_name("Cancel writing");
  cancel_writing->set_disabled_by_default(false);
  cancel_writing->set_icon("mdi:pencil-off");
  button_buttonpresstrigger_3 = new button::ButtonPressTrigger(cancel_writing);
  automation_4 = new Automation<>(button_buttonpresstrigger_3);
  // button.restart:
  //   platform: restart
  //   name: Tag Reader Restart
  //   entity_category: config
  //   disabled_by_default: false
  //   device_class: restart
  //   id: restart_restartbutton
  restart_restartbutton = new restart::RestartButton();
  restart_restartbutton->set_component_source("restart.button");
  App.register_component(restart_restartbutton);
  App.register_button(restart_restartbutton);
  restart_restartbutton->set_name("Tag Reader Restart");
  restart_restartbutton->set_disabled_by_default(false);
  restart_restartbutton->set_entity_category(::ENTITY_CATEGORY_CONFIG);
  restart_restartbutton->set_device_class("restart");
  // pn532_i2c:
  //   id: pn532_board
  //   on_tag:
  //   - then:
  //     - homeassistant.tag_scanned:
  //         tag: !lambda |
  //           if (!tag.has_ndef_message()) {
  //             ESP_LOGD("tagreader", "No NDEF");
  //             return x;
  //           }
  //           auto message = tag.get_ndef_message();
  //           auto records = message->get_records();
  //           for (auto &record : records) {
  //             std::string payload = record->get_payload();
  //             size_t pos = payload.find("https:www.home-assistant.io/tag/");
  //             if (pos != std::string::npos) {
  //               return payload.substr(pos + 34);
  //             }
  //           }
  //           ESP_LOGD("tagreader", "Bad NDEF, fallback to uid");
  //           return x;
  //         id: api_apiserver
  //       type_id: api_homeassistantservicecallaction
  //     - if:
  //         condition:
  //           switch.is_on:
  //             id: buzzer_enabled
  //           type_id: switch__switchcondition
  //         then:
  //         - rtttl.play:
  //             rtttl: success:d=24,o=5,b=100:c,g,b
  //             id: rtttl_rtttl
  //           type_id: rtttl_playaction_5
  //       type_id: ifaction
  //     - if:
  //         condition:
  //           switch.is_on:
  //             id: led_enabled
  //           type_id: switch__switchcondition_2
  //         then:
  //         - light.turn_on:
  //             id: activity_led
  //             brightness: 1.0
  //             red: 0.0
  //             green: 1.0
  //             blue: 0.0
  //             flash_length: 500ms
  //             state: true
  //           type_id: light_lightcontrolaction_8
  //       type_id: ifaction_2
  //     automation_id: automation_9
  //     trigger_id: nfc_nfcontagtrigger
  //   update_interval: 1s
  //   i2c_id: i2c_arduinoi2cbus
  //   address: 0x24
  pn532_board = new pn532_i2c::PN532I2C();
  pn532_board->set_update_interval(1000);
  pn532_board->set_component_source("pn532");
  App.register_component(pn532_board);
  nfc_nfcontagtrigger = new nfc::NfcOnTagTrigger();
  pn532_board->register_ontag_trigger(nfc_nfcontagtrigger);
  automation_9 = new Automation<std::string, nfc::NfcTag>(nfc_nfcontagtrigger);
  api_homeassistantservicecallaction = new api::HomeAssistantServiceCallAction<std::string, nfc::NfcTag>(api_apiserver, true);
  api_homeassistantservicecallaction->set_service("esphome.tag_scanned");
  api_homeassistantservicecallaction->add_data("tag_id", [=](std::string x, nfc::NfcTag tag) -> std::string {
      #line 175 "/config/esphome/tagreader.yaml"
      if (!tag.has_ndef_message()) {
        ESP_LOGD("tagreader", "No NDEF");
        return x;
      }
      auto message = tag.get_ndef_message();
      auto records = message->get_records();
      for (auto &record : records) {
        std::string payload = record->get_payload();
        size_t pos = payload.find("https://www.home-assistant.io/tag/");
        if (pos != std::string::npos) {
          return payload.substr(pos + 34);
        }
      }
      ESP_LOGD("tagreader", "Bad NDEF, fallback to uid");
      return x;
      
  });
  switch__switchcondition = new switch_::SwitchCondition<std::string, nfc::NfcTag>(buzzer_enabled, true);
  ifaction = new IfAction<std::string, nfc::NfcTag>(switch__switchcondition);
  // output:
  // output.esp8266_pwm:
  //   platform: esp8266_pwm
  //   pin:
  //     number: 13
  //     mode:
  //       output: true
  //       analog: false
  //       input: false
  //       open_drain: false
  //       pullup: false
  //       pulldown: false
  //     inverted: false
  //     id: esphome_esp8266_esp8266gpiopin
  //   id: buzzer
  //   zero_means_zero: false
  //   frequency: 1000.0
  buzzer = new esp8266_pwm::ESP8266PWM();
  buzzer->set_component_source("esp8266_pwm.output");
  App.register_component(buzzer);
  buzzer->set_zero_means_zero(false);
  esphome_esp8266_esp8266gpiopin = new esphome::esp8266::ESP8266GPIOPin();
  esphome_esp8266_esp8266gpiopin->set_pin(13);
  esphome_esp8266_esp8266gpiopin->set_inverted(false);
  esphome_esp8266_esp8266gpiopin->set_flags(gpio::Flags::FLAG_OUTPUT);
  buzzer->set_pin(esphome_esp8266_esp8266gpiopin);
  buzzer->set_frequency(1000.0f);
  // binary_sensor.status:
  //   platform: status
  //   name: Tag Reader Status
  //   entity_category: diagnostic
  //   disabled_by_default: false
  //   id: status_statusbinarysensor
  //   device_class: connectivity
  status_statusbinarysensor = new status::StatusBinarySensor();
  App.register_binary_sensor(status_statusbinarysensor);
  status_statusbinarysensor->set_name("Tag Reader Status");
  status_statusbinarysensor->set_disabled_by_default(false);
  status_statusbinarysensor->set_entity_category(::ENTITY_CATEGORY_DIAGNOSTIC);
  status_statusbinarysensor->set_device_class("connectivity");
  status_statusbinarysensor->set_component_source("status.binary_sensor");
  App.register_component(status_statusbinarysensor);
  // text_sensor.version:
  //   platform: version
  //   hide_timestamp: true
  //   name: Tag Reader ESPHome Version
  //   entity_category: diagnostic
  //   disabled_by_default: false
  //   icon: mdi:new-box
  //   id: version_versiontextsensor
  version_versiontextsensor = new version::VersionTextSensor();
  App.register_text_sensor(version_versiontextsensor);
  version_versiontextsensor->set_name("Tag Reader ESPHome Version");
  version_versiontextsensor->set_disabled_by_default(false);
  version_versiontextsensor->set_icon("mdi:new-box");
  version_versiontextsensor->set_entity_category(::ENTITY_CATEGORY_DIAGNOSTIC);
  version_versiontextsensor->set_component_source("version.text_sensor");
  App.register_component(version_versiontextsensor);
  version_versiontextsensor->set_hide_timestamp(true);
  // text_sensor.wifi_info:
  //   platform: wifi_info
  //   ip_address:
  //     name: Tag Reader IP Address
  //     icon: mdi:ip
  //     entity_category: diagnostic
  //     disabled_by_default: false
  //     id: wifi_info_ipaddresswifiinfo
  //     update_interval: 1s
  //   ssid:
  //     name: Tag Reader Connected SSID
  //     icon: mdi:wifi
  //     entity_category: diagnostic
  //     disabled_by_default: false
  //     id: wifi_info_ssidwifiinfo
  //     update_interval: 1s
  wifi_info_ipaddresswifiinfo = new wifi_info::IPAddressWiFiInfo();
  App.register_text_sensor(wifi_info_ipaddresswifiinfo);
  wifi_info_ipaddresswifiinfo->set_name("Tag Reader IP Address");
  wifi_info_ipaddresswifiinfo->set_disabled_by_default(false);
  wifi_info_ipaddresswifiinfo->set_icon("mdi:ip");
  wifi_info_ipaddresswifiinfo->set_entity_category(::ENTITY_CATEGORY_DIAGNOSTIC);
  wifi_info_ipaddresswifiinfo->set_update_interval(1000);
  wifi_info_ipaddresswifiinfo->set_component_source("wifi_info.text_sensor");
  App.register_component(wifi_info_ipaddresswifiinfo);
  wifi_info_ssidwifiinfo = new wifi_info::SSIDWiFiInfo();
  App.register_text_sensor(wifi_info_ssidwifiinfo);
  wifi_info_ssidwifiinfo->set_name("Tag Reader Connected SSID");
  wifi_info_ssidwifiinfo->set_disabled_by_default(false);
  wifi_info_ssidwifiinfo->set_icon("mdi:wifi");
  wifi_info_ssidwifiinfo->set_entity_category(::ENTITY_CATEGORY_DIAGNOSTIC);
  wifi_info_ssidwifiinfo->set_update_interval(1000);
  wifi_info_ssidwifiinfo->set_component_source("wifi_info.text_sensor");
  App.register_component(wifi_info_ssidwifiinfo);
  // rtttl:
  //   output: buzzer
  //   id: rtttl_rtttl
  rtttl_rtttl = new rtttl::Rtttl();
  rtttl_rtttl->set_component_source("rtttl");
  App.register_component(rtttl_rtttl);
  rtttl_rtttl->set_output(buzzer);
  // light.neopixelbus:
  //   platform: neopixelbus
  //   variant: ws2812
  //   pin: 15
  //   num_leds: 1
  //   flash_transition_length: 500ms
  //   type: GRB
  //   id: activity_led
  //   name: Tag Reader LED
  //   restore_mode: ALWAYS_OFF
  //   disabled_by_default: false
  //   gamma_correct: 2.8
  //   default_transition_length: 1s
  //   output_id: neopixelbus_neopixelbuslightoutputbase
  //   invert: false
  //   method:
  //     type: bit_bang
  neopixelbus_neopixelbuslightoutputbase = new neopixelbus::NeoPixelRGBLightOutput<NeoEspBitBangMethodBase<NeoEspBitBangSpeed800Kbps, NeoEspPinset>>();
  activity_led = new light::AddressableLightState(neopixelbus_neopixelbuslightoutputbase);
  App.register_light(activity_led);
  activity_led->set_component_source("light");
  App.register_component(activity_led);
  activity_led->set_name("Tag Reader LED");
  activity_led->set_disabled_by_default(false);
  activity_led->set_restore_mode(light::LIGHT_ALWAYS_OFF);
  activity_led->set_default_transition_length(1000);
  activity_led->set_flash_transition_length(500);
  activity_led->set_gamma_correct(2.8f);
  activity_led->add_effects({});
  neopixelbus_neopixelbuslightoutputbase->set_component_source("neopixelbus.light");
  App.register_component(neopixelbus_neopixelbuslightoutputbase);
  neopixelbus_neopixelbuslightoutputbase->add_leds(1, 15);
  neopixelbus_neopixelbuslightoutputbase->set_pixel_order(neopixelbus::ESPNeoPixelOrder::GRB);
  // network:
  //   {}
  // socket:
  //   implementation: lwip_tcp
  rtttl_playaction = new rtttl::PlayAction<>(rtttl_rtttl);
  rtttl_playaction->set_value("success:d=24,o=5,b=100:c,g,b");
  light_lightcontrolaction = new light::LightControlAction<>(activity_led);
  light_lightcontrolaction->set_state(true);
  light_lightcontrolaction->set_flash_length(500);
  light_lightcontrolaction->set_brightness(1.0f);
  light_lightcontrolaction->set_red(0.0f);
  light_lightcontrolaction->set_green(0.0f);
  light_lightcontrolaction->set_blue(1.0f);
  switch__turnonaction = new switch_::TurnOnAction<>(buzzer_enabled);
  switch__turnonaction_2 = new switch_::TurnOnAction<>(led_enabled);
  automation->add_actions({waituntilaction, lambdaaction, rtttl_playaction, light_lightcontrolaction, switch__turnonaction, switch__turnonaction_2});
  light_lightcontrolaction_2 = new light::LightControlAction<>(activity_led);
  light_lightcontrolaction_2->set_state(true);
  light_lightcontrolaction_2->set_brightness(1.0f);
  light_lightcontrolaction_2->set_red(1.0f);
  light_lightcontrolaction_2->set_green(0.0f);
  light_lightcontrolaction_2->set_blue(1.0f);
  lambdaaction_2 = new LambdaAction<>([=]() -> void {
      #line 74 "/config/esphome/tagreader.yaml"
      static const char alphanum[] = "0123456789abcdef";
      std::string uri = "https://www.home-assistant.io/tag/";
      for (int i = 0; i < 8; i++)
        uri += alphanum[random_uint32() % (sizeof(alphanum) - 1)];
      uri += "-";
      for (int j = 0; j < 3; j++) {
        for (int i = 0; i < 4; i++)
          uri += alphanum[random_uint32() % (sizeof(alphanum) - 1)];
        uri += "-";
      }
      for (int i = 0; i < 12; i++)
        uri += alphanum[random_uint32() % (sizeof(alphanum) - 1)];
      auto message = new nfc::NdefMessage();
      message->add_uri_record(uri);
      ESP_LOGD("tagreader", "Writing payload: %s", uri.c_str());
      pn532_board->write_mode(message);
  });
  pn532_pn532iswritingcondition = new pn532::PN532IsWritingCondition<>();
  pn532_pn532iswritingcondition->set_parent(pn532_board);
  notcondition = new NotCondition<>(pn532_pn532iswritingcondition);
  waituntilaction_2 = new WaitUntilAction<>(notcondition);
  waituntilaction_2->set_component_source("button");
  App.register_component(waituntilaction_2);
  light_lightcontrolaction_3 = new light::LightControlAction<>(activity_led);
  light_lightcontrolaction_3->set_state(false);
  automation_2->add_actions({light_lightcontrolaction_2, lambdaaction_2, waituntilaction_2, light_lightcontrolaction_3});
  light_lightcontrolaction_4 = new light::LightControlAction<>(activity_led);
  light_lightcontrolaction_4->set_state(true);
  light_lightcontrolaction_4->set_brightness(1.0f);
  light_lightcontrolaction_4->set_red(1.0f);
  light_lightcontrolaction_4->set_green(0.647f);
  light_lightcontrolaction_4->set_blue(0.0f);
  lambdaaction_3 = new LambdaAction<>([=]() -> void {
      #line 107 "/config/esphome/tagreader.yaml"
      pn532_board->clean_mode();
  });
  pn532_pn532iswritingcondition_2 = new pn532::PN532IsWritingCondition<>();
  pn532_pn532iswritingcondition_2->set_parent(pn532_board);
  notcondition_2 = new NotCondition<>(pn532_pn532iswritingcondition_2);
  waituntilaction_3 = new WaitUntilAction<>(notcondition_2);
  waituntilaction_3->set_component_source("button");
  App.register_component(waituntilaction_3);
  light_lightcontrolaction_5 = new light::LightControlAction<>(activity_led);
  light_lightcontrolaction_5->set_state(false);
  automation_3->add_actions({light_lightcontrolaction_4, lambdaaction_3, waituntilaction_3, light_lightcontrolaction_5});
  lambdaaction_4 = new LambdaAction<>([=]() -> void {
      #line 119 "/config/esphome/tagreader.yaml"
      pn532_board->read_mode();
  });
  automation_4->add_actions({lambdaaction_4});
  rtttl_playaction_2 = new rtttl::PlayAction<>(rtttl_rtttl);
  rtttl_playaction_2->set_value("beep:d=16,o=5,b=100:b");
  automation_5->add_actions({rtttl_playaction_2});
  api_userservicetrigger_2 = new api::UserServiceTrigger<>("rfidreader_tag_ko", {});
  api_apiserver->register_user_service(api_userservicetrigger_2);
  automation_6 = new Automation<>(api_userservicetrigger_2);
  rtttl_playaction_3 = new rtttl::PlayAction<>(rtttl_rtttl);
  rtttl_playaction_3->set_value("beep:d=8,o=5,b=100:b");
  automation_6->add_actions({rtttl_playaction_3});
  api_userservicetrigger_3 = new api::UserServiceTrigger<std::string>("play_rtttl", {"song_str"});
  api_apiserver->register_user_service(api_userservicetrigger_3);
  automation_7 = new Automation<std::string>(api_userservicetrigger_3);
  rtttl_playaction_4 = new rtttl::PlayAction<std::string>(rtttl_rtttl);
  rtttl_playaction_4->set_value([=](std::string song_str) -> std::string {
      #line 140 "/config/esphome/tagreader.yaml"
      return song_str;
  });
  automation_7->add_actions({rtttl_playaction_4});
  api_userservicetrigger_4 = new api::UserServiceTrigger<std::string>("write_tag_id", {"tag_id"});
  api_apiserver->register_user_service(api_userservicetrigger_4);
  automation_8 = new Automation<std::string>(api_userservicetrigger_4);
  light_lightcontrolaction_6 = new light::LightControlAction<std::string>(activity_led);
  light_lightcontrolaction_6->set_state(true);
  light_lightcontrolaction_6->set_brightness(1.0f);
  light_lightcontrolaction_6->set_red(1.0f);
  light_lightcontrolaction_6->set_green(0.0f);
  light_lightcontrolaction_6->set_blue(0.0f);
  lambdaaction_5 = new LambdaAction<std::string>([=](std::string tag_id) -> void {
      #line 153 "/config/esphome/tagreader.yaml"
      auto message = new nfc::NdefMessage();
      std::string uri = "https://www.home-assistant.io/tag/";
      uri += tag_id;
      message->add_uri_record(uri);
      pn532_board->write_mode(message);
  });
  pn532_pn532iswritingcondition_3 = new pn532::PN532IsWritingCondition<std::string>();
  pn532_pn532iswritingcondition_3->set_parent(pn532_board);
  notcondition_3 = new NotCondition<std::string>(pn532_pn532iswritingcondition_3);
  waituntilaction_4 = new WaitUntilAction<std::string>(notcondition_3);
  waituntilaction_4->set_component_source("api");
  App.register_component(waituntilaction_4);
  light_lightcontrolaction_7 = new light::LightControlAction<std::string>(activity_led);
  light_lightcontrolaction_7->set_state(false);
  automation_8->add_actions({light_lightcontrolaction_6, lambdaaction_5, waituntilaction_4, light_lightcontrolaction_7});
  rtttl_playaction_5 = new rtttl::PlayAction<std::string, nfc::NfcTag>(rtttl_rtttl);
  rtttl_playaction_5->set_value("success:d=24,o=5,b=100:c,g,b");
  ifaction->add_then({rtttl_playaction_5});
  switch__switchcondition_2 = new switch_::SwitchCondition<std::string, nfc::NfcTag>(led_enabled, true);
  ifaction_2 = new IfAction<std::string, nfc::NfcTag>(switch__switchcondition_2);
  light_lightcontrolaction_8 = new light::LightControlAction<std::string, nfc::NfcTag>(activity_led);
  light_lightcontrolaction_8->set_state(true);
  light_lightcontrolaction_8->set_flash_length(500);
  light_lightcontrolaction_8->set_brightness(1.0f);
  light_lightcontrolaction_8->set_red(0.0f);
  light_lightcontrolaction_8->set_green(1.0f);
  light_lightcontrolaction_8->set_blue(0.0f);
  ifaction_2->add_then({light_lightcontrolaction_8});
  automation_9->add_actions({api_homeassistantservicecallaction, ifaction, ifaction_2});
  pn532_board->set_i2c_bus(i2c_arduinoi2cbus);
  pn532_board->set_i2c_address(0x24);
  // =========== AUTO GENERATED CODE END ============
  App.setup();
}

void loop() {
  App.loop();
}
