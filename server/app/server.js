// sudo udevadm control --reload-rules
var nconf = require('nconf');
nconf.argv()
    .env()
    .file({
        file: __dirname + '/config.json'
    });

var events = require('events');
var eventEmitter = new events.EventEmitter();
var nodeLib = nconf.get('server:nodeLib');
var logfilePath = nconf.get('server:logfilePath');

var telemetryfilePath = nconf.get('telemetry:telemetryfilePath');
var bunyan = require('bunyan');

//--------------- Logging middleware ---------------
var log = bunyan.createLogger({
    name: 'bot',
    streams: [
        /*{
          level: 'debug',
          stream: process.stdout            // log INFO and above to stdout
        },*/
        //Log should be outside app folders
        {
            path: logfilePath + 'bot-Pilog.log' // log ERROR and above to a file
        }
    ]
});

var fs = require('safefs');
var SEPARATOR = nconf.get('telemetry:SEPARATOR');
var installPath = nconf.get('server:installPath');
const robotName = nconf.get('server:name');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var sys = require('sys');
var exec = require('child_process').exec;

var serPort = nconf.get('server:serPort');
var serBaud = nconf.get('server:serBaud');
var serverPort = nconf.get('server:serverPort');
var version = nconf.get('server:version');
var videoFeedPort = nconf.get('video:port');
var videoWidth = nconf.get('video:videoWidth');
var videoHeight = nconf.get('video:videoHeight');
var fps = nconf.get('video:fps');


// include custom functions ======================================================================
//var systemModules = require(installPath + 'server/app/lib/systemModules');
var functions = require(installPath + 'server/app/lib/functions');
var camera = require(installPath + 'server/app/lib/camera');
var videoFeed = require(installPath + 'server/app/lib/video');


//var robot = require(installPath + 'server/app/robot');

// load the routes
require('./routes')(app);

app.use(express.static(installPath + 'server/wwwroot'));

var serverADDR = 'N/A';
var LogR = 0;
var TelemetryFN = 'N/A';
var prevTel = "";
var prevPitch = "";
var THReceived = 0;

var TelemetryHeader = 'N/A';
var PIDHeader = 'N/A';
var ArduSysHeader;
var Telemetry = {};
var PID = {};
var PIDVal;
var ArduSys = {};
var temperature;

//Setup serial port
const com = require('serialport')
const Readline = require('@serialport/parser-readline')
const sPort = new com(serPort, {
    baudRate: Number(serPort)
});

const serialPort = sPort.pipe(new Readline({
    delimiter: '\r\n'
}))

sPort.on('open', function() {
    console.log('Arduino connected on ' + serPort + ' @' + serBaud)
})

//serialPort.on('data', console.log)


io.on('connection', function(socket) {
    //socket.emit('connected', version, Telemetry);

    var myDate = new Date();
    var startMessage = 'Connected ' + myDate.getHours() + ':' + myDate.getMinutes() + ':' + myDate.getSeconds() + ' v' + version + ' @' + serverADDR;
    //Init the heades for telemtry data
    serialPort.write('READ RemoteInit\n\r');
    //Trasmit system and PID parameters

    //socket.emit('serverADDR', serverADDR);
    socket.emit('connected', startMessage, serverADDR, serverPort, videoFeedPort, PID);
    console.log('New socket.io connection - id: %s', socket.id);

    log.info('Client connected ' + socket.id, startMessage, serverADDR, serverPort, videoFeedPort, PID + ' video: ' + videoWidth, videoHeight, fps);

    setTimeout(function() {
        videoFeed.startVideoFeed(socket, videoWidth, videoHeight, fps);
    }, 2000);


    /* Not needed as the info is displayed on screen
   setInterval(function(){
  if(THReceived==1)socket.emit('status', Telemetry['yaw'], Telemetry['pitch'], Telemetry['roll'], Telemetry['bal'], Telemetry['dISTE']);
  if(Telemetry['pitch'] > 60)log.error('BALANCING FAIL! Pitch: ' + Telemetry['pitch']);
              //console.log(Telemetry['pitch']);
  }, 250);
*/

    cPUInfo();

    socket.on('Video', function(Video) {
        socket.emit('CMD', Video);

        function puts(error, stdout, stderr) {
            sys.puts(stdout)
        }
        exec('sudo bash ' + installPath + 'server/app/bin/' + Video, puts);

    });

    //Set commands SCMD are commands to control arduino. They go to Arduino directly.
    socket.on('SCMD', function(CMD) {
        serialPort.write('SCMD ' + CMD + '\n');
        log.debug('Command SCMD ' + CMD);
    });

    socket.on('move', function(dX, dY) {
        serialPort.write('SCMD move ' + Math.round(dX) + ' ' + Math.round(dY) + '\n');

    });

    //Server Commands control the behaviour of teh server
    socket.on('SerCMD', function(CMD) {
        socket.emit('CMD', CMD);
        if (CMD == "LOG_ON" && !LogR) {
            TelemetryFN = 'Telemetry_' + systemModules.timeStamp() + '.csv';
            socket.emit('Info', telemetryfilePath + TelemetryFN)
            log.debug('Telemetry logging started ' + telemetryfilePath + TelemetryFN);
            systemModules.setTelemetryFile(telemetryfilePath, TelemetryFN, TelemetryHeader, PIDHeader, SEPARATOR);
            LogR = 1;

        } else if (CMD == "LOG_OFF") {
            socket.emit('Info', "logging stopped");
            LogR = 0;
            log.debug('Telemetry logging stopped ' + telemetryfilePath + TelemetryFN);
        } else if (CMD == "showConfig") {
            fs.readFile(__dirname + '/config.json', 'utf8', function(err, json) {
                if (err) throw err;
                socket.emit('configSent', json);
            });
        }
    });

    socket.on('REBOOT', function() {
        function puts(error, stdout, stderr) {
            sys.puts(stdout)
        }
        log.info(robotName + ' rebootiing now');
        exec('sudo reboot now');
        sockets.emit('Info', robotName + " rebooting")

    });

    socket.on('SHUTDOWN', function() {
        socket.emit('Info', robotName + " going down for maintenance now!");
        log.info(robotName + ' going down for maintenance now!');

        function puts(error, stdout, stderr) {
            sys.puts(stdout)
        }
        exec('sudo shutdown now');

    });

    socket.on('disconnect', function() {
        console.log('Disconnected id: %s', socket.id);
        log.info('Client disconnected ' + socket.id);
    });

    socket.on('connected', function() {
        //console.log('CONNECTED id: %s', socket.id);
        // log.info('Client disconnected ' + socket.id);sudo modprobe bcm2835-v4l2
    });


    eventEmitter.on('CMDecho', function(data) {
        socket.emit('CMD', data);
    });

    eventEmitter.on('serialData', function(data) {
        socket.emit('serialData', data);
    });

});

io.on('disconnect', function() {
    console.log('A socket with sessionID ' + hs.sessionID +
        ' disconnected!');
    log.info('A socket with sessionID ' + hs.sessionID +
        ' disconnected!');
});

http.listen(serverPort, function() {
    console.log(robotName + ' listening on *: ' + serverADDR + ':' + serverPort + ' video feed: ' + videoFeedPort);
    log.info(robotName + ' listening on ' + serverADDR + ':' + serverPort + ' video feed: ' + videoFeedPort);


    //Read input from Arduino and stores it into a dictionary
    serialPort.on('data', function(data, socket) {
        /*
        We store sensor data in arrays.
        0/ send command via serial to provide data
        1/ check what are we receiving (first letter of the trasmission)
        2/ populate the correct variable
        */

        //"T": Telemetry data
        //"SCMD": Set Command
        //"TH": Telemetry Headers
        //SYSH: System Headers (Arduino)
        // SYS:
        // PID:
        // PIDH:
        //console.log(data);
        //this emits raw data from Arduino for debug purposes, a html file can pubish it
        eventEmitter.emit('serialData', data);
        //console.log(data);
        if (data.indexOf('SCMD') !== -1) {
            eventEmitter.emit('CMDecho', data);
        }

        if (data.indexOf('T') !== -1) {
            var tokenData = data.split(SEPARATOR);
            var j = 0;

            for (var i in Telemetry) {
                Telemetry[i] = tokenData[j];
                j++;
                //console.log(i + ' ' + Telemetry[i]);
            }
            j = 0;

            //eventEmitter.emit('log', data);

            if (LogR == 1) {
                systemModules.addTelemetryRow(telemetryfilePath, TelemetryFN, TelemetryHeader, data, PIDHeader, PIDVal, SEPARATOR)
            }
        }

        //"TH" means we are receiving Telemetry Headers
        if (data.indexOf('TH') !== -1) {
            TelemetryHeader = data.split(SEPARATOR);
            var arrayLength = TelemetryHeader.length;
            for (var i = 0; i < arrayLength; i++) {
                Telemetry[TelemetryHeader[i]] = "N/A";
                //console.log(TelemetryHeader[i]);
            }

            THReceived = 1;
            //eventEmitter.emit('log', data);
        }

        if (data.indexOf('SYSH') !== -1) {
            ArduSysHeader = data.split(SEPARATOR);
            var arrayLength = ArduSysHeader.length;
            for (var i = 0; i < arrayLength; i++) {
                ArduSys[ArduSysHeader[i]] = "N/A";
                //console.log(TelemetryHeader[i]);
            }
            setTimeout(function() {
                serialPort.write('READ SYSParamTX\n\r');
            }, 100)
        }

        if (data.indexOf('SYS') !== -1) {
            var tokenData = data.split(SEPARATOR);
            var j = 0;

            for (var i in Telemetry) {
                ArduSys[i] = tokenData[j];
                j++;
                //console.log(i + ' ' + Telemetry[i]);
            }
            j = 0;
            //eventEmitter.emit('log', data);
        }

        if (data.indexOf('PID') !== -1) {
            var tokenData = data.split(SEPARATOR);
            var j = 0;
            PIDVal = "";

            for (var i in PID) {
                PID[i] = tokenData[j];
                //PIDVal is used as a string to be concatenated in log file
                PIDVal = PIDVal + SEPARATOR + PID[i];
                j++;
            }
            j = 0;
            //log.info('PID values changed ' + PIDHeader + '\n' + PIDVal);

        }

        if (data.indexOf('PIDH') !== -1) {
            PIDHeader = data.split(SEPARATOR);
            var arrayLength = PIDHeader.length;
            for (var i = 0; i < arrayLength; i++) {
                PID[PIDHeader[i]] = "N/A";
                //console.log(PIDHeader[i]);// + ' ' + PID[PIDHeader[i]]);
            }
            setTimeout(function() {
                serialPort.write('READ PIDParamTX\n\r');
            }, 100);
        }

        //Change the first word to be 'ArduConfig' => Chaneg also inb Arduino
        //If the first word is '***' prints in the server console. Used to debug the config from Arduino
        if (data.indexOf('ArduConfig') !== -1) {
            console.log(data);
            log.info('Configuration received from Arduino: ' + data);

        }

        //Handle errors from Arduino
        if (data.indexOf('E') !== -1) {
            log.error('ERROR: ' + data);
        }


        //IS THIS SILL RELEVANT?
        //Get the header for the object that stores telemetry data
        // if (data.indexOf('HEADER') !== -1) {
        //     TelemetryHeader = data.split(SEPARATOR);
        //     var arrayLength = TelemetryHeader.length;
        //     for (var i = 0; i < arrayLength; i++) {
        //         Telemetry[TelemetryHeader[i]] = "N/A";
        //         //console.log(TelemetryHeader[i]);
        //     }
        // }


    });

});


module.exports.Telemetry = Telemetry;
module.exports.temperature = temperature;
module.exports.nconf = nconf;
