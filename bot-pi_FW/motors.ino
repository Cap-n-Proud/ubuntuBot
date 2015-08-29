void updateMotorSpeeds(int dX, int dY) {
      //SCMD move 30 -10 
      currentSpeedL = -map(dY-dX, -100, 100, -configuration.maxSpeed, configuration.maxSpeed);
      currentSpeedR = -map(dY+dX, -100, 100,  -configuration.maxSpeed, configuration.maxSpeed);

      //motorR.move(sgn(dX-dY)*10000);
      //motorL.move(-sgn(+dX+dY)*10000);
      motorR.move(+sgn(currentSpeedR)*10000);
      motorL.move(+sgn(currentSpeedL)*10000);
      
      motorR.setMaxSpeed(abs(currentSpeedR));
      motorL.setMaxSpeed(abs(currentSpeedL));
      if (currentSpeedR == 0 && currentSpeedL == 0)
      {
       motorR.disableOutputs();
       motorL.disableOutputs();
       
      }
      else
      {
        motorR.run();
        motorL.run();
      }

}


void motorsSetup() {
  
  
  motorR.setAcceleration(configuration.maxAcc);
  motorL.setAcceleration(configuration.maxAcc); 
  Serial.println("Motor setup completed");
  
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
