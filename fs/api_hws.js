load('api_gpio.js');
load('api_i2c.js');
load('api_timer.js');
load('api_rpc.js');
load('api_net.js');
load('api_log.js');
load('api_adc.js');
load('api_config.js');

let HWS={
 pinADC: 0,
 pinINT1: 4,
 pinINT2: 5,
 pinOUT1: 15,
 pinOUT2: 13,

 square: function (a) {
  return a*a;
 },
 norm: function (obj) {
  return Math.sqrt(HWS.square(obj.x)+HWS.square(obj.y)+HWS.square(obj.z));
 },
 numberToHex: function (n) {
  let str="";
  while (n>0) {
   let p=n&0x0F;
   if (p<10) {
    p+='0'.at(0);
   } else {
    p+='A'.at(0)-10;
   }
   str=chr(p)+str;
   n>>=7;
  }
  let l=str.length;
  if (l===0) {
   str="00";
  } else if (l%2===1) {
   str="0"+str;
  }
  return str;
 },
 handleInterrupt: function (pin) {
   Log.warn("Valeur de la pin " + pin + " = " + GPIO.read(pin));
   GPIO.write((pin===4)?HWS.pinOUT1:HWS.pinOUT2, GPIO.read(pin));
 },
 start2: function () {
 },
 start1: function () {
  //ADC.enable(HWS.pinADC);
  HWS.readPin();
  GPIO.set_button_handler(HWS.pinINT1, GPIO.PULL_DOWN, GPIO.INT_EDGE_ANY, 20, HWS.handleInterrupt, null);
  GPIO.enable_int(HWS.pinINT1);
  //GPIO.set_button_handler(HWS.pinINT2, GPIO.PULL_DOWN, GPIO.INT_EDGE_ANY, 20, HWS.handleInterrupt, null);
  //GPIO.enable_int(HWS.pinINT2);
  Timer.set(100, 0, HWS.start2, null);
 },
 readPin: function () {
    Log.warn("value : " + JSON.stringify(GPIO.read(HWS.pinINT1)));
 },
 start: function () {
  //let t=Cfg.get('provision.magnetmean');
  //Log.warn("############### Value:"+JSON.stringify(t));
  GPIO.set_mode(HWS.pinINT1, GPIO.MODE_INPUT);
  GPIO.set_mode(HWS.pinINT2, GPIO.MODE_INPUT);
  GPIO.set_mode(HWS.pinOUT1, GPIO.MODE_OUTPUT);
  GPIO.set_mode(HWS.pinOUT2, GPIO.MODE_OUTPUT);
  //Timer.set(1000, 1 HWS.readPin, null);
  Timer.set(1000, 0, HWS.start1, null);
 }
};

//RPC.addHandler("HWS.getAccel", function () { return HWS.getAccel(); });
//RPC.addHandler("HWS.getRawAccel", function () { return HWS.getRawAccel(); });
//RPC.addHandler("HWS.getGyro", function () { return HWS.getGyro(); });
//RPC.addHandler("HWS.getMagnetField", function () { return HWS.getMagnetField(); });
//RPC.addHandler("HWS.configMagneto", function (data) { return HWS.configMagneto(data); });
//RPC.addHandler("HWS.initAccelSpeed", function () { return HWS.initAccelSpeed(); });
//RPC.addHandler("HWS.getSpeed", function () { return HWS.getSpeed(); });

