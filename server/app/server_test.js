var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// include custom functions ======================================================================
//var systemModules = require(installPath + 'server/app/lib/systemModules');
var functions = require(__dirname + '/lib/functions');
const serverPort = 54321
const robotName ="testserver"
const videoFeedPort ="N/A"

var serverADDR = functions.findMyIP();


io.on('connection', function(socket) {
    //socket.emit('connected', version, Telemetry);

    var myDate = new Date();
    var startMessage = 'Connected ' + myDate.getHours() + ':' + myDate.getMinutes() + ':' + myDate.getSeconds() + ' v' + version + ' @' + serverADDR;
    console.log('New socket.io connection - id: %s', socket.id);


    socket.on('disconnect', function() {
        console.log('Disconnected id: %s', socket.id);
    });

    socket.on('connected', function() {
        console.log('CONNECTED id: %s', socket.id);
        // log.info('Client disconnected ' + socket.id);sudo modprobe bcm2835-v4l2
    });




});

io.on('disconnect', function() {
    console.log('A socket with sessionID ' + hs.sessionID +
        ' disconnected!');

});

http.listen(serverPort, function() {
    console.log(robotName + ' listening on: ' + serverADDR + ':' + serverPort + ' video feed: ' + videoFeedPort);
    //log.info(robotName + ' listening on ' + serverADDR + ':' + serverPort + ' video feed: ' + videoFeedPort);


    //Read input from Arduino and stores it into a dictionary


});

//
// module.exports.Telemetry = Telemetry;
// module.exports.temperature = temperature;
// module.exports.nconf = nconf;
