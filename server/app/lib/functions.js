var fs = require('safefs');

function timeStamp() {
    var MyDate = new Date();
    var MyDateString;
    var MyTimeStamp;
    MyDateString = ('0' + MyDate.getFullYear()).slice(-2) + '-' + ('0' + (MyDate.getMonth() + 1)).slice(-2) + '-' + ('0' + (MyDate.getUTCDate())).slice(-2);
    MyTimeStamp = ('0' + MyDate.getHours()).slice(-2) + '-' + ('0' + (MyDate.getMinutes())).slice(-2) + '-' + ('0' + (MyDate.getSeconds())).slice(-2);

    return MyDateString + '_' + MyTimeStamp
}

function setTelemetryFile(PathTelFile, TelemetryFN, TelemetryHeader, PIDHeader, SEPARATOR) {
    var file = fs.createWriteStream(PathTelFile + TelemetryFN);
    var Headers = TelemetryHeader.concat(PIDHeader);
    Headers = 'Timestamp' + SEPARATOR + Headers.join(", ");
    Headers = Headers.replace(/[\n\r]/g, '');
    Headers = Headers + '\n';

    //file.write(Headers.join(", "), function (err) {
    file.write(Headers, function(err) {
        if (err) {
            console.log('ERROR: ' + err);
            console.log(LogRow + '\n')
            LogR = 0;
        }
    });
}

function addTelemetryRow(PathTelFile, TelemetryFN, TelemetryHeader, data, PIDHeader, PIDVal, SEPARATOR) {
    LogRow = new Date().getTime() + SEPARATOR;
    LogRow = LogRow + data.replace(/[\n\r]/g, '') + PIDVal + '\n';
    fs.appendFile(PathTelFile + TelemetryFN, LogRow, function(err) {
        if (err) {
            console.log('ERROR: ' + err);
            console.log(LogRow + '\n')
            LogR = 0;
        }
    });
}

//Linear rescale of values
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

//Get IP address http://stackoverflow.com/questions/3653065/get-local-ip-address-in-node-js
function findMyIP() {
    var serverADDR = "N/A"
    var os = require('os');
    var ifaces = os.networkInterfaces();

    Object.keys(ifaces).forEach(function(ifname) {
        var alias = 0;

        ifaces[ifname].forEach(function(iface) {
            if ('IPv4' !== iface.family || iface.internal !== false) {
                // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                return;
            }

            if (alias >= 1) {
                // this single interface has multiple ipv4 addresses
                console.log(ifname + ':' + alias, iface.address);
            } else {
                // this interface has only one ipv4 adress
                serverADDR = iface.address;
            }
        });
    });
    return serverADDR;
}

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

// exports ======================================================================
exports.rescale = rescale;
exports.CPUInfo = CPUInfo;
exports.findMyIP = findMyIP;
exports.timeStamp = timeStamp;
exports.addTelemetryRow = addTelemetryRow;
exports.setTelemetryFile = setTelemetryFile;
