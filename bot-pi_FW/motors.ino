

//Updates the motor speeds and the SpeedPID input
void updateMotorSpeeds(int dX, int dY) {
  
  //val = map(val, 0, 1023, 0, 255);
  //if (configuration.motorsON==1){
      //Serial.println("input sent to motors");
      motorR.setSpeed(map(dY+dX, -100, 100, 0, configuration.maxSpeed));
      motorL.setSpeed(map(dY-dX, -100, 100, 0, configuration.maxSpeed));
      motorR.step(sgn(dY+dX)*1);
      motorL.step(-sgn(dY-dX)*1);
      
      /*motorLeft.setSpeedPercentage(- configuration.steerGain * (UserControl[0]));
      motorRight.setSpeedPercentage(-anglePIDOutput + configuration.steerGain * (UserControl[0]))
  */
//  }

}

void motorsSetup() {
  
  pinMode(configuration.Rin1Pin, OUTPUT);
  pinMode(configuration.Rin2Pin, OUTPUT);
  pinMode(configuration.Rin3Pin, OUTPUT);
  pinMode(configuration.Rin4Pin, OUTPUT);

  pinMode(configuration.Lin1Pin, OUTPUT);
  pinMode(configuration.Lin2Pin, OUTPUT);
  pinMode(configuration.Lin3Pin, OUTPUT);
  pinMode(configuration.Lin4Pin, OUTPUT); 
}


/*long map(long x, long in_min, long in_max, long out_min, long out_max)
{
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}
*/

static inline int8_t sgn(int val) {
 if (val < 0) return -1;
 if (val==0) return 0;
 return 1;
}
