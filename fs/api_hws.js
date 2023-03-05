load('api_gpio.js');
load('api_timer.js');
load('api_rpc.js');
//load('api_net.js');
load('api_log.js');
load('api_adc.js');
//load('api_config.js');

let HWS={
 magnetoInit: false,
 magnetField: 0,
 magnetFieldMean: 0,
 magnetFieldMin: 1000000,
 magnetFieldMax:-1000000,
 pinADC: 0,

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
 configMagneto: function (dataJSON) {
  //let dataJSON=JSON.parse(data);
  HWS.magnetoInit=dataJSON.magnetoOnOff;
  Log.warn("magneto init:"+(HWS.magnetoInit?"on":"off"));
  return 1;
 },
 getMagnetField: function () {
  //let ret="";
  return HWS.magnetField;
  //ret=JSON.stringify(HWS.magnetField);
  //Log.warn("Val: " + ret);
  //return ret;
 },
 query: function () {
  let magnet=ADC.read(HWS.pinADC);
  //Log.warn("RAW Val: " + JSON.stringify(magnet));
  magnet*=3.3*3;
  magnet/=2048;
  magnet/=18;
  if (HWS.magnetoInit){
   if (magnet>HWS.magnetFieldMax) HWS.magnetFieldMax=magnet;
   if (magnet<HWS.magnetFieldMin) HWS.magnetFieldMin=magnet;
   HWS.magnetFieldMean=(HWS.magnetFieldMax+HWS.magnetFieldMin)/2;
   Cfg.set(JSON.stringify({'provision':{'magnetmean':HWS.magnetFieldMean}}),true);
   Log.warn("################### CONFIG ######################");
  } else {
   HWS.magnetFieldMax=-1000000;
   HWS.magnetFieldMin=1000000;
  }
  //Log.warn("Val: " + JSON.stringify(magnet));
  magnet-=HWS.magnetFieldMean;
  HWS.magnetField=magnet;
  //HWS.getMagnetField();
 },
 start2: function () {
  Timer.set(500, 1, HWS.query, null);
 },
 start1: function () {
  let ret = ADC.enable(HWS.pinADC);
  Log.warn("ADC.enable : " + ((ret===1)?"OK":"KO"));
	
  Timer.set(1000, 0, HWS.start2, null);
 },
 start: function () {
  HWS.magnetFieldMean=0;
//  let t=Cfg.get('provision.magnetmean');
//  Log.warn("############### Value:"+JSON.stringify(t));
  Timer.set(1000, 0, HWS.start1, null);
 }
};

RPC.addHandler("HWS.getMagnetField", function () { return HWS.getMagnetField(); });
RPC.addHandler("HWS.configMagneto", function (data) { return HWS.configMagneto(data); });
