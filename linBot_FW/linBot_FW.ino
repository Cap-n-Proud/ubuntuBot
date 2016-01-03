// Check this out https://github.com/adafruit/AccelStepper.git
// https://www.pjrc.com/teensy/td_libs_AccelStepper.html
//http://42bots.com/tutorials/bipolar-stepper-motor-control-with-arduino-and-an-h-bridge/
//------------------ Libraries ------------------

//#define DEBUG
#include "DebugUtils.h"
#include "CommunicationUtils.h"
#include "FreeIMU.h"
#include <Wire.h>
#include <SPI.h>
#include <I2Cdev.h>
#include <MPU60X0.h>
#define M_PI 3.14159265358979323846f
  #include <MS561101BA.h>
#include <HMC58X3.h>
#include <Wire.h> // for i2c

#include <TimedAction.h> // for updating sensors and debug http://bit.ly/pATDBi http://playground.arduino.cc/Code/TimedAction
#include <EEPROM.h> // for storing configuraion
//#include <avr/wdt.h> // watchdog http://savannah.nongnu.org/projects/avr-libc/
#include <KalmanFilter.h> // github.com/nut-code-monkey/KalmanFilter-for-Arduino
                          // Try also: https://github.com/TKJElectronics/KalmanFilter.git
#include <AccelStepper.h> //https://github.com/adafruit/AccelStepper.git

#define SERIALCOMMAND_HARDWAREONLY 1
#include <SerialCommand.h> // https://github.com/kroimon/Arduino-SerialCommand.git

//------------------ Constants ------------------ 
#define TO_RAD(x) (x * 0.01745329252)  // *pi/180
#define TO_DEG(x) (x * 57.2957795131)  // *180/pi
#define speedMultiplier 1
#define SERIAL_BAUD 38400
#define CONFIG_START 32 //EEPROM address to start the config

/* Configutation parameters */
struct Configuration {
  String FirmwareVersion;  
  int test;
  int Rin1Pin;
  int Rin2Pin;
  int Rin3Pin;
  int Rin4Pin;
  int Lin1Pin;
  int Lin2Pin;
  int Lin3Pin;
  int Lin4Pin;
  int stepsPerRev;
  int maxSpeed;
  int maxAcc;
  
  double steerGain;
  double throttleGain;
  double Maxsteer;
  double Maxthrottle;
  int motorsON;
  int telemetryPrecision;
  int commandDelay;
 
  boolean debug;
  uint8_t debugLevel;
  uint8_t debugSampleRate;
  uint8_t speedPIDOutputDebug;
  uint8_t speedPIDInputDebug;
  uint8_t speedKalmanFilterDebug;
  uint8_t speedRawDebug;
  uint8_t speedMovingAvarageFilter2Debug;
  uint8_t anglePIDSetpointDebug;
  uint8_t anglePIDInputDebug;
  uint8_t anglePIDOutputDebug;
  uint8_t angleRawDebug;
  uint8_t  activePIDTuningDebug;
};

Configuration configuration;
byte b[sizeof(Configuration)];

double UserControl[1]; //Steer, Throttle

void setConfiguration(boolean force) {
  /* Flash is erased every time new code is uploaded. Write the default configuration to flash if first time */
  // running for the first time?
  uint8_t codeRunningForTheFirstTime = EEPROM.read(CONFIG_START); // flash bytes will be 255 at first run
  if (codeRunningForTheFirstTime || force) {
    if (configuration.debug){
      Serial.print("No config found, defaulting ");
    }
    /* First time running, set defaults */
    configuration.FirmwareVersion = "0.8";
    //If we are testing the IMU is disabled and only random numbers are generated.
    configuration.test = 0;
    configuration.Rin1Pin=4;
    configuration.Rin2Pin=5;
    configuration.Rin3Pin=6;
    configuration.Rin4Pin=7;
    configuration.Lin1Pin=8;
    configuration.Lin2Pin=9;
    configuration.Lin3Pin=10;
    configuration.Lin4Pin=11;
    configuration.stepsPerRev=200;
    configuration.maxSpeed=300;
    configuration.maxAcc = 25;
    
    configuration.steerGain = 0.7;
    configuration.throttleGain = 1;
    configuration.Maxsteer = 100; //Max allowed percentage difference. Up to the remote to provide the right scale.  
    configuration.Maxthrottle = 100; //Max speed expressed in inclination degrees. Up to the remote to provide the right scale.
        
    configuration.motorsON = 0;
    configuration.telemetryPrecision = 3;
  
    configuration.debug = 0;
  
    configuration.commandDelay = 5;
  
    configuration.debugLevel = 0;
    configuration.debugSampleRate = 1000;
    //  configuration.speedPIDSetpointDebug = 1;
    configuration.speedPIDOutputDebug = 1;
    configuration.speedPIDInputDebug = 1;
    configuration.speedKalmanFilterDebug = 1;
    configuration.speedRawDebug = 1;
    configuration.speedMovingAvarageFilter2Debug = 0;
    configuration.anglePIDSetpointDebug = 1;
    configuration.anglePIDInputDebug = 1;
    configuration.anglePIDOutputDebug = 1;
    configuration.angleRawDebug = 1;
    configuration.activePIDTuningDebug = 1;
    //configuration.speakerPin = 13;
    
    saveConfig();
    delay(100);
  }
  else {
    if (configuration.debug)
      Serial.println("Config found");
    loadConfig();
  }
};



String SEPARATOR = ","; //Used as separator for telemetry
float ypr[3];
float altimeter;
float heading = 0;


// Set the FreeIMU object
FreeIMU my3IMU = FreeIMU();


int StartL, LoopT;
int prevSpeedL = 0;
int prevSpeedR = 0;
int currentSpeedL = 0;
int currentSpeedR = 0;

SerialCommand SCmd;   // The SerialCommand object

//AccelStepper motorR(4, configuration.Rin1Pin, configuration.Rin2Pin, configuration.Rin3Pin, configuration.Rin4Pin);  
//AccelStepper motorL(4, configuration.Lin1Pin, configuration.Lin2Pin, configuration.Lin3Pin, configuration.Lin4Pin);  

//Stepper motorR(200, 4, 5, 6, 7);  
//Stepper motorL(200, 8, 9, 10, 11);  
AccelStepper motorR(4, 4, 5, 6, 7);
AccelStepper motorL(4, 8, 9, 10, 11);

  // These take care of the timing of things
TimedAction debugTimedAction = TimedAction(configuration.debugSampleRate, debugEverything); //Print debug info
//TimedAction updateMotorSpeedTimedAction = TimedAction(100, updateMotorSpeeds); //
//ADD HERE A TIMED ACTIONS FOR SENSORS
//TimedAction remoteControlWatchdogTimedAction = TimedAction(5000, stopRobot);

//Reads serial for commands
TimedAction RemoteReadTimedAction = TimedAction(250, RemoteRead);

//  TimedAction ReadIMUTimedAction = TimedAction(100, ReadIMUTEST);
  TimedAction ReadIMUTimedAction = TimedAction(100, ReadIMU);



//Upload telemetry data
TimedAction TelemetryTXTimedAction = TimedAction(250, TelemetryTX);


//------------------ Setup ------------------ 
void setup() { 
  //pinMode(configuration.speakerPin, OUTPUT);
   randomSeed(analogRead(0));
  Serial.begin(SERIAL_BAUD);
  delay(50);
  Serial.println("Initializing ...");
  // Load config from eeprom
  setConfiguration(true);
  // init i2c and IMU
  delay(100);
  Wire.begin();
  UserControl[0]=0;
  UserControl[1]=0;
  
  //Init control systems
  controlConfig();
  motorsSetup();
 //wdt_enable(WDTO_2S);
  
/*  if(configuration.test == 1){
    Serial.println("testing mode, IMU output simulated");
    }    
  else
   {delay(5);
  my3IMU.init(); // the parameter enable or disable fast mode
  delay(5);
  }*/
  delay(5);
  my3IMU.init(); // the parameter enable or disable fast mode
  delay(5);
  // Setup callbacks for SerialCommand commands 
  SCmd.addCommand("SCMD", setCommand);       
  SCmd.addCommand("READ", printCommand); 

}

//------------------ Main loop ------------------ 
void loop() { 
  StartL = millis();
  //wdt_reset();
  // update sensors and motors, also chek commands and send back telemetry
  //ADD HERE A TIMED ACTIONS FOR SENSORS

  
  //updateMotorStatusesTimedAction.check();
  ReadIMUTimedAction.check();
  RemoteReadTimedAction.check();
  TelemetryTXTimedAction.check();
  //updateMotorSpeedTimedAction.check();
  updateMotorSpeeds(UserControl[0],UserControl[1]);
 LoopT = millis() - StartL;
 
}

/* just debug functions. uncomment the debug information you want in debugEverything */
void debugEverything() {
/*  debugImu();
  debugAnglePID();
  debugSpeedPID();
  //debugISE();
  //debugAnglePIDCoeff();
  //debugSpeedPIDCoeff();
  //debugEncoders();
  debugMotorSpeeds();
  //debugMotorCalibrations();
  //debugMotorSpeedCalibration();
  //debugChart2();
  //unrecognizedCMD();
  debugLoopTime();
  Serial.println();
*/
};

void ReadIMUTEST() {
    ypr[0]= random(360 *  pow(10, configuration.telemetryPrecision));
    ypr[1]= random(-30  *  pow(10, configuration.telemetryPrecision), 30 *  pow(10, configuration.telemetryPrecision));
    ypr[2]= random(-30  *  pow(10, configuration.telemetryPrecision), 30 *  pow(10, configuration.telemetryPrecision));
    altimeter = random(300  *  pow(10, configuration.telemetryPrecision), 900 *  pow(10, configuration.telemetryPrecision));
    //Serial.println(ypr[0]);
}
  


void ReadIMU() {
  my3IMU.getYawPitchRoll(ypr);
   if(ypr[0] < 0) ypr[0] = ypr[0] + 4*90;
  if(ypr[0] > 4*90) ypr[0] = ypr[0] + 4*90;
  altimeter = my3IMU.getBaroAlt();  
  //Serial.println(ypr[0]);
  
}

