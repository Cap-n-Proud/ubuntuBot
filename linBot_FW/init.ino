void controlConfig() {
 // initialize device
    //Serial.println(F("Initializing I2C devices..."));
    mpu.initialize();

    // verify connection
    //Serial.println(F("Testing device connections..."));
    //Serial.println(mpu.testConnection() ? F("MPU6050 connection successful") : F("MPU6050 connection failed"));

   // load and configure the DMP
    //Serial.println(F("Initializing DMP..."));
    devStatus = mpu.dmpInitialize();

    // supply your own gyro offsets here, scaled for min sensitivity
    mpu.setXGyroOffset(220);
    mpu.setYGyroOffset(76);
    mpu.setZGyroOffset(-85);
    mpu.setZAccelOffset(1788); // 1688 factory default for my test chip

      // make sure it worked (returns 0 if so)
    if (devStatus == 0) {
        // turn on the DMP, now that it's ready
      //  Serial.println(F("Enabling DMP..."));
        mpu.setDMPEnabled(true);

        // enable Arduino interrupt detection
        //Serial.println(F("Enabling interrupt detection (Arduino external interrupt 0)..."));
        attachInterrupt(0, dmpDataReady, RISING);
        mpuIntStatus = mpu.getIntStatus();

        // set our DMP Ready flag so the main loop() function knows it's okay to use it
        //Serial.println(F("DMP ready! Waiting for first interrupt..."));
        dmpReady = true;

        // get expected DMP packet size for later comparison
        packetSize = mpu.dmpGetFIFOPacketSize();
    } else {
        // ERROR!
        // 1 = initial memory load failed
        // 2 = DMP configuration updates failed
        // (if it's going to break, usually the code will be 1)
        //Serial.print(F("DMP Initialization failed (code "));
        //Serial.print(devStatus);
        //Serial.println(F(")"));
    }
    
}

void setConfiguration(boolean force) {
  /* Flash is erased every time new code is uploaded. Write the default configuration to flash if first time */
  // running for the first time?
  uint8_t codeRunningForTheFirstTime = EEPROM.read(CONFIG_START); // flash bytes will be 255 at first run
  if (codeRunningForTheFirstTime || force) {
    if (configuration.debug){
      //Serial.print("No config found, defaulting ");
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
    
    //saveConfig();
    delay(100);
  }
  else {
    //if (configuration.debug)
     // Serial.println("Config found");
    //loadConfig();
  }
};




