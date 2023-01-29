load('api_config.js');
load('api_gpio.js');
//load('api_mqtt.js');
load('api_sys.js');
load('api_timer.js');
load('api_hws.js');





Timer.set(1000, 0, HWS.start, null);
