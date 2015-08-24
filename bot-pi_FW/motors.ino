void updateMotorSpeeds(int dX, int dY) {
  //SCMD Throttle 20
  //val = map(val, 0, 1023, 0, 255);
  //if (configuration.motorsON==1){
      //Serial.println("input sent to motors");
      currentSpeedL = map(dY-dX, -100, 100, 0, configuration.maxSpeed);
      currentSpeedR = map(dY+dX, -100, 100, 0, configuration.maxSpeed);
    if (abs(currentSpeedL)<= configuration.maxSpeed)
   { 
    
    if ((currentSpeedL - prevSpeedL > configuration.maxAcc) && (dX!= 0 | dY!=0))
      {
      currentSpeedL = prevSpeedL + configuration.maxAcc;
        Serial.print("dX ");
        Serial.print(dX);
        
        Serial.print(" dY ");
        Serial.print(dY);

        Serial.print(" Current speed ");
        Serial.print(currentSpeedL);
        
        Serial.print(" Max acceleration ");
        Serial.print(configuration.maxAcc);
        Serial.print(" exceeded.");

        Serial.print(" Prev speed ");        
        Serial.println(prevSpeedL);
      prevSpeedL = prevSpeedL + configuration.maxAcc;
      prevSpeedR = prevSpeedR + configuration.maxAcc;
        
      }
      else
      {
      prevSpeedL = currentSpeedL;
      prevSpeedR = currentSpeedR;
      //Serial.println("Speed request within tolerances");   
      }
      
      
      motorR.setSpeed(currentSpeedR);
      motorL.setSpeed(currentSpeedL);
      motorR.step(sgn(dY+dX)*1);
      motorL.step(-sgn(dY-dX)*1);
//  }
  }
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
