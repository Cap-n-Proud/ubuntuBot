var nconf = require('/usr/local/lib/node_modules/nconf');
nconf.argv()
    .env()
    .file({
        file: '/home/pi/bo-Pi/app/config.json'
    });

var nodeLib = nconf.get('server:nodeLib');
var exec = require('child_process').exec;
var piblaster = require(nodeLib + 'pi-blaster.js');
var debugLevel = nconf.get('server:debugLevel');

function initServos(SERVO_1_GPIO, SERVO_2_GPIO) {
      function puts(error, stdout, stderr) {
          sys.puts(stdout)
      }
      exec('sudo /home/pi/pi-blaster/pi-blaster ' + SERVO_1_GPIO + ' ' + SERVO_2_GPIO);
      console.log('sudo /home/pi/pi-blaster/pi-blaster ' + SERVO_1_GPIO + ' ' + SERVO_2_GPIO);
      
  }

function rescale(x, in_min, in_max, out_min, out_max) {
var output;
output = (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
//console.log(output);
if (output < out_min) {
    output = out_min;
} else if (output > out_max) {
    output = out_max;
} else {
    //Nothing
}

return output

    }
  
  function move(dX, dY, SERVO_1_GPIO, SERVO_2_GPIO, SERVO_1_MIN, SERVO_2_MIN, SERVO_1_MAX, SERVO_2_MAX) {

      PWL = rescale(parseFloat(dY) - parseFloat(-dX), -100.000, 100, parseFloat(SERVO_1_MIN), parseFloat(SERVO_1_MAX));
      PWR = rescale(parseFloat(-dY) + parseFloat(dX), -100.000, 100, parseFloat(SERVO_2_MIN), parseFloat(SERVO_2_MAX));
      //console.log(PWL);
      piblaster.setPwm(SERVO_2_GPIO, PWL);
      piblaster.setPwm(SERVO_1_GPIO, PWR);
        if (debugLevel > 2) {
            console.log('Moving dX: ' + dX + ' dY: ' + dY+SERVO_1_MIN);
        }
        if (debugLevel > 4) {
            console.log('Parameters: ' + SERVO_1_GPIO + ' ' + SERVO_2_GPIO + ' ' + SERVO_1_MIN  + ' ' + SERVO_2_MIN + ' ' + SERVO_1_MAX + ' ' + SERVO_2_MAX);
        }

  }

  function stop(SERVO_1_GPIO, SERVO_2_GPIO) {
      piblaster.setPwm(SERVO_2_GPIO, 0);
      piblaster.setPwm(SERVO_1_GPIO, 0);
            if (debugLevel > 2) {
            console.log('movement stopped');
        }
  }


  // exports ======================================================================
  exports.initServos = initServos;
  exports.move = move;
  exports.stop = stop;
     
     