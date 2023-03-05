//load('api_config.js');
//load('api_gpio.js');
//load('api_mqtt.js');
//load('api_sys.js');
load('api_timer.js');
load('api_hws.js');





//Timer.set(5000, 0, HWSERVER.start, null);
Timer.set(50, 0, HWS.start, null);
