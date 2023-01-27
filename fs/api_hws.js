load('api_gpio.js');
load('api_i2c.js');
load('api_timer.js');
load('api_rpc.js');
load('api_net.js');
load('api_log.js');
load('api_adc.js');
load('api_config.js');

let HWS={
 magnetoInit: false,
 pinAccelGyroOn: 5,
 pinSCL: 14,
 pinSDA: 12,
 pinADC: 0,
 pinINT: 4,
 ap: {x:0,y:0,z:0,t:0},
 an: {x:0,y:0,z:0,t:0},
 ai: {x:0,y:0,z:0},
 gp: {x:0,y:0,z:0,t:0},
 gn: {x:0,y:0,z:0,t:0},
 speed: {x:0,y:0,z:0},
 magnetField: 0,
 magnetFieldMean: 0,
 magnetFieldMin: 1000000,
 magnetFieldMax:-1000000,
 i2cH: {},

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
 initAccelSpeed: function () {
  HWS.speed={x:0,y:0,z:0};
  HWS.ap.x=HWS.an.x;
  HWS.ap.y=HWS.an.y;
  HWS.ap.z=HWS.an.z;
  HWS.ap.t=HWS.an.t;
  HWS.ai.x=HWS.an.x;
  HWS.ai.y=HWS.an.y;
  HWS.ai.z=HWS.an.z;
  return HWS.getSpeed();
 },
 configMagneto: function (dataJSON) {
  //let dataJSON=JSON.parse(data);
  HWS.magnetoInit=dataJSON.magnetoOnOff;
  Log.warn("magneto init:"+(HWS.magnetoInit?"on":"off"));
  return 1;
 },
 getSpeed: function () {
  return HWS.norm(HWS.speed);
 },
 getAccel: function () {
  return HWS.norm(HWS.an);
 },
 getRawAccel: function () {
  return HWS.an;
 },
 getGyro: function () {
  return HWS.norm(HWS.gn);
 },
 getMagnetField: function () {
  let ret="";
  ret=JSON.stringify(HWS.magnetField);
  return ret;
 },
 readAccelGyro: function () {
  let accel=I2C.readRegN(HWS.i2cH, 0x68, 0x3B, 6);
  let gyro=I2C.readRegN(HWS.i2cH, 0x68, 0x43, 6);
  let interrupts=I2C.readRegB(HWS.i2cH, 0x68, 0x3A);
  if (accel !=="") {
   HWS.an.t=Timer.now();
   let tmp=0;

   tmp=((accel.at(0)<<8) | accel.at(1));
   if (tmp&0x8000) tmp=-((~(tmp-1))&0xFFFF);
    //tmp/=16384;
   tmp/=4096;
    //tmp-=HWS.ai.x;
   if (HWS.an.x===0) {
    HWS.an.x=tmp;
   } else {
    HWS.an.x*=3;
    HWS.an.x+=tmp;
    HWS.an.x/=4;
   }

   tmp=((accel.at(2)<<8) | accel.at(3));
   if (tmp&0x8000) tmp=-((~(tmp-1))&0xFFFF);
    //tmp/=16384;
   tmp/=4096;
    //tmp-=HWS.ai.y;
   if (HWS.an.y===0) {
    HWS.an.y=tmp;
   } else {
    HWS.an.y*=3;
    HWS.an.y+=tmp;
    HWS.an.y/=4;
   }
   tmp=((accel.at(4)<<8) | accel.at(5));
   if (tmp&0x8000) tmp=-((~(tmp-1))&0xFFFF);
    //tmp/=16384;
   tmp/=4096;
    //tmp-=HWS.ai.z;
   if (HWS.an.z===0) {
    HWS.an.z=tmp;
   } else {
    HWS.an.z*=3;
    HWS.an.z+=tmp;
    HWS.an.z/=4;
   }

    //HWS.calcSpeed();
  }
  if (gyro !=="") {
   HWS.gn.t=Timer.now();
   HWS.gn.x=((gyro.at(0)<<8) | gyro.at(1));
   if (HWS.gn.x&0x8000) HWS.gn.x=-((~(HWS.gn.x-1))&0xFFFF);
   HWS.gn.y=((gyro.at(2)<<8) | gyro.at(3));
   if (HWS.gn.y&0x8000) HWS.gn.y=-((~(HWS.gn.y-1))&0xFFFF);
   HWS.gn.z=((gyro.at(4)<<8) | gyro.at(5));
   if (HWS.gn.z&0x8000) HWS.gn.z=-((~(HWS.gn.z-1))&0xFFFF);
   HWS.gn.x/=131;
   HWS.gn.y/=131;
   HWS.gn.z/=131;
  }
  //HWS.getAccel();
  //HWS.getGyro();
 },
 calcSpeed: function () {
   let dt=9806650*(HWS.an.t-HWS.ap.t)/2;
   let tmp=0;
   tmp=(dt*(HWS.an.x+HWS.ap.x-2*HWS.ai.x));
   HWS.speed.x+=tmp/1000000000;
   tmp=(dt*(HWS.an.y+HWS.ap.y-2*HWS.ai.y));
   HWS.speed.y+=tmp/1000000000;
   tmp=(dt*(HWS.an.z+HWS.ap.z-2*HWS.ai.z));
   HWS.speed.z+=tmp/1000000000;
   HWS.ap.x=HWS.an.x;
   HWS.ap.y=HWS.an.y;
   HWS.ap.z=HWS.an.z;
   HWS.ap.t=HWS.an.t;
 },
 query: function () {
  let magnet=ADC.read(HWS.pinADC);
  magnet*=3.3* 3;
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
  magnet-=HWS.magnetFieldMean;
  HWS.magnetField=magnet;
  //HWS.getMagnetField();
 },
 start3: function () {
  let res=I2C.writeRegB(HWS.i2cH, 0x68, 0x6B, 0x10);
  Log.warn(res?"reset OK":"reset KO");
  //res=I2C.writeRegB(HWS.i2cH, 0x68, 0x1C, 0x00);
  //res=I2C.writeRegB(HWS.i2cH, 0x68, 0x1C, 0x14);
 res=I2C.writeRegB(HWS.i2cH, 0x68, 0x1C, 0x10);
  //res=I2C.writeRegB(HWS.i2cH, 0x68, 0x1C, 0xF4);
  Log.warn(res?"reset OK":"reset KO");
  //res=I2C.writeRegB(HWS.i2cH, 0x68, 0x37, 0xE0);
  //Log.warn(res?"reset OK":"reset KO");
  //GPIO.set_mode(HWS.pinINT,GPIO.MODE_INPUT);
  GPIO.set_button_handler(HWS.pinINT, GPIO.PULL_UP, GPIO.INT_EDGE_NEG, 200, HWS.readAccelGyro, null);
  //GPIO.set_int_handler(HWS.pinINT, GPIO.INT_LEVEL_HI, HWS.readAccelGyro, null);
  GPIO.enable_int(HWS.pinINT);
  res=I2C.writeRegB(HWS.i2cH, 0x68, 0x38, 0x01);
  Log.warn(res?"reset OK":"reset KO");
  //HWS.readAccelGyro();
  Timer.set(100, 1, HWS.query, null);
  Timer.set(100, 1, HWS.calcSpeed, null);
 },
 start2: function () {
  HWS.i2cH=I2C.get();
  let res=I2C.writeRegB(HWS.i2cH, 0x68, 0x6B, 0x80);
  Log.warn(res?"reset OK":"reset KO");
  Timer.set(100, 0, HWS.start3, null);
 },
 start1: function () {
  GPIO.write(HWS.pinAccelGyroOn,1);
  ADC.enable(HWS.pinADC);
  Timer.set(100, 0, HWS.start2, null);
 },
 start: function () {
  HWS.magnetFieldMean=0;
  let t=Cfg.get('provision.magnetmean');
  Log.warn("############### Value:"+JSON.stringify(t));
  GPIO.set_mode(HWS.pinAccelGyroOn,GPIO.MODE_OUTPUT);
  GPIO.write(HWS.pinAccelGyroOn,0);
  Timer.set(5000, 0, HWS.start1, null);
 }
};

RPC.addHandler("HWS.getAccel", function () { return HWS.getAccel(); });
RPC.addHandler("HWS.getRawAccel", function () { return HWS.getRawAccel(); });
RPC.addHandler("HWS.getGyro", function () { return HWS.getGyro(); });
RPC.addHandler("HWS.getMagnetField", function () { return HWS.getMagnetField(); });
RPC.addHandler("HWS.configMagneto", function (data) { return HWS.configMagneto(data); });
RPC.addHandler("HWS.initAccelSpeed", function () { return HWS.initAccelSpeed(); });
RPC.addHandler("HWS.getSpeed", function () { return HWS.getSpeed(); });

