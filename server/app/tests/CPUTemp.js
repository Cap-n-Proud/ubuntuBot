//Emits CPU INFO through socket
function CPUInfo() {

  var fs = require('safefs');
  setInterval(function() {

    var usage = "N/A";
    temperature = fs.readFileSync("/sys/class/thermal/thermal_zone0/temp");
    temperature = ((temperature / 1000).toPrecision(3)) + "°C";
    try {
      socket.emit("CPUInfo", temperature, usage);
    }
    catch (err) {
        // handle the error safely
        console.log(err)
    }
    //console.log(temperature, usage)
}, 3 * 1000);

//return serverADDR;
}

CPUInfo();
