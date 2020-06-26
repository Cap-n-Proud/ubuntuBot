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

// exports ======================================================================
//exports.timeStamp = timeStamp;
exports.rescale = rescale;
exports.findMyIP = findMyIP;
