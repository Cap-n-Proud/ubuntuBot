// Check this out https://github.com/adafruit/AccelStepper.git
// https://www.pjrc.com/teensy/td_libs_AccelStepper.html
//http://42bots.com/tutorials/bipolar-stepper-motor-control-with-arduino-and-an-h-bridge/
//------------------ Libraries ------------------

//#define DEBUG
#include <Wire.h>
//#include <SPI.h>
#include <I2Cdev.h>
#include <Wire.h> // for i2c

#include <TimedAction.h> // for updating sensors and debug http://bit.ly/pATDBi http://playground.arduino.cc/Code/TimedAction
#include <EEPROM.h> // for storing configuraion
//#include <avr/wdt.h> // watchdog http://savannah.nongnu.org/projects/avr-libc/
#include <AccelStepper.h> //https://github.com/adafruit/AccelStepper.git

#define SERIALCOMMAND_HARDWAREONLY 1
#include <SerialCommand.h> // https://github.com/kroimon/Arduino-SerialCommand.git

//------------------ Constants ------------------ 
#define TO_RAD(x) (x * 0.01745329252)  // *pi/180
#define TO_DEG(x) (x * 57.2957795131)  // *180/pi
#define M_PI 3.14159265358979323846f
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





String SEPARATOR = ","; //Used as separator for telemetry
float altimeter;
float heading = 0;


//------------------ IMU ------------------

#include "MPU6050_6Axis_MotionApps20.h"
//#include "MPU6050.h" // not necessary if using MotionApps include file

// Arduino Wire library is required if I2Cdev I2CDEV_ARDUINO_WIRE implementation
// is used in I2Cdev.h
#if I2CDEV_IMPLEMENTATION == I2CDEV_ARDUINO_WIRE
    #include "Wire.h"
#endif

// class default I2C address is 0x68
// specific I2C addresses may be passed as a parameter here
// AD0 low = 0x68 (default for SparkFun breakout and InvenSense evaluation board)
// AD0 high = 0x69
MPU6050 mpu;
//MPU6050 mpu(0x69); // <-- use for AD0 high


// MPU control/status vars
bool dmpReady = false;  // set true if DMP init was successful
uint8_t mpuIntStatus;   // holds actual interrupt status byte from MPU
uint8_t devStatus;      // return status after each device operation (0 = success, !0 = error)
uint16_t packetSize;    // expected DMP packet size (default is 42 bytes)
uint16_t fifoCount;     // count of all bytes currently in FIFO
uint8_t fifoBuffer[64]; // FIFO storage buffer

// orientation/motion vars
Quaternion q;           // [w, x, y, z]         quaternion container
VectorInt16 aa;         // [x, y, z]            accel sensor measurements
VectorInt16 aaReal;     // [x, y, z]            gravity-free accel sensor measurements
VectorInt16 aaWorld;    // [x, y, z]            world-frame accel sensor measurements
VectorFloat gravity;    // [x, y, z]            gravity vector
float euler[3];         // [psi, theta, phi]    Euler angle container
float ypr[3];           // [yaw, pitch, roll]   yaw/pitch/roll container and gravity vector


// packet structure for InvenSense teapot demo
uint8_t teapotPacket[14] = { '$', 0x02, 0,0, 0,0, 0,0, 0,0, 0x00, 0x00, '\r', '\n' };



// ================================================================
// ===               INTERRUPT DETECTION ROUTINE                ===
// ================================================================

volatile bool mpuInterrupt = false;     // indicates whether MPU interrupt pin has gone high
void dmpDataReady() {
    mpuInterrupt = true;
}





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
TimedAction RemoteReadTimedAction = TimedAction(150, RemoteRead);

//  TimedAction ReadIMUTimedAction = TimedAction(100, ReadIMUTEST);
  TimedAction ReadIMUTimedAction = TimedAction(100, ReadIMU);



//Upload telemetry data
TimedAction TelemetryTXTimedAction = TimedAction(150, TelemetryTX);


//------------------ Setup ------------------ 
void setup() { 
    // join I2C bus (I2Cdev library doesn't do this automatically)
    #if I2CDEV_IMPLEMENTATION == I2CDEV_ARDUINO_WIRE
        Wire.begin();
        TWBR = 24; // 400kHz I2C clock (200kHz if CPU is 8MHz). Comment this line if having compilation difficulties with TWBR.
    #elif I2CDEV_IMPLEMENTATION == I2CDEV_BUILTIN_FASTWIRE
        Fastwire::setup(400, true);
    #endif
  



  Serial.begin(SERIAL_BAUD);
  delay(50);
  //Serial.println("Initializing ...");
  // Load config from eeprom
  setConfiguration(true);
  // init i2c and IMU
  delay(100);
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
 // ReadIMUTimedAction.check();
 ReadIMU();
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
 if (!dmpReady) return;

    // wait for MPU interrupt or extra packet(s) available
    while (!mpuInterrupt && fifoCount < packetSize) {
        // other program behavior stuff here
        // .
        // .
        // .
        // if you are really paranoid you can frequently test in between other
        // stuff to see if mpuInterrupt is true, and if so, "break;" from the
        // while() loop to immediately process the MPU data
        // .
        // .
        // .
    }

       // reset interrupt flag and get INT_STATUS byte
    mpuInterrupt = false;
    mpuIntStatus = mpu.getIntStatus();

    // get current FIFO count
    fifoCount = mpu.getFIFOCount();

    // check for overflow (this should never happen unless our code is too inefficient)
    if ((mpuIntStatus & 0x10) || fifoCount == 1024) {
        // reset so we can continue cleanly
        mpu.resetFIFO();
        Serial.println(F("FIFO overflow!"));

    // otherwise, check for DMP data ready interrupt (this should happen frequently)
    } else if (mpuIntStatus & 0x02) {
        // wait for correct available data length, should be a VERY short wait
        while (fifoCount < packetSize) fifoCount = mpu.getFIFOCount();

        // read a packet from FIFO
        mpu.getFIFOBytes(fifoBuffer, packetSize);
        
        // track FIFO count here in case there is > 1 packet available
        // (this lets us immediately read more without waiting for an interrupt)
        fifoCount -= packetSize;

                    // display Euler angles in degrees
            mpu.dmpGetQuaternion(&q, fifoBuffer);
            mpu.dmpGetGravity(&gravity, &q);
            mpu.dmpGetYawPitchRoll(ypr, &q, &gravity);
            
            for(int i=0;i<3;i++){
             ypr[i] = TO_DEG(ypr[i]); 
            }
           /* Serial.print("ypr\t");
            Serial.print(ypr[0] * 180/M_PI);
            Serial.print("\t");
            Serial.print(ypr[1] * 180/M_PI);
            Serial.print("\t");
            Serial.println(ypr[2] * 180/M_PI);
*/
    }

}

