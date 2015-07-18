// set up ======================================================================
var nconf = require('/usr/local/lib/node_modules/nconf');
nconf.argv()
    .env()
    .file({file: __dirname + '/config.json' });
    

var nodeLib = nconf.get('server:nodeLib');
var express = require(nodeLib + 'express');
var app = express();
var http = require('http').Server(app);
var io = require(nodeLib + 'socket.io')(http);
var fs = require(nodeLib + 'safefs');
var bunyan = require(nodeLib + 'bunyan');

//var piblaster = require(nodeLib + 'pi-blaster.js');
var sys = require('sys');
var exec = require('child_process').exec;

var SNFolder = nconf.get('server:SNFolder');
var InstallPath = nconf.get('server:InstallPath');

var serverPort = nconf.get('server:port');
var MJPGPort = nconf.get('MJPG:MJPGPort');
var version = nconf.get('server:version');

var SERVO_1_GPIO = nconf.get('hardware:SERVO_1_GPIO');
var SERVO_2_GPIO = nconf.get('hardware:SERVO_2_GPIO');
var SERVO_1_MIN = nconf.get('hardware:SERVO_1_MIN');
var SERVO_1_MAX = nconf.get('hardware:SERVO_1_MAX');
var SERVO_2_MIN = nconf.get('hardware:SERVO_2_MIN');
var SERVO_2_MAX = nconf.get('hardware:SERVO_2_MAX');
var LED1_R = nconf.get('hardware:LED1_R');
var LED1_G = nconf.get('hardware:LED1_G');
var LED1_B = nconf.get('hardware:LED1_B');

var serverADDR = 'N/A';
// 0 - no console messages, 5 - everything;
var debugLevel = nconf.get('server:debugLevel');

var TLimgWidth = nconf.get('camera:TLimgWidth');
var TLimgHeight = nconf.get('camera:TLimgHeight');

var SNimgWidth = nconf.get('camera:SNimgWidth');
var SNimgHeight = nconf.get('camera:SNimgHeight');

var TLInterval = nconf.get('camera:TLInterval');

// include custom functions ======================================================================
var systemModules = require('./systemModules');
//var functions = require(InstallPath + 'server/app/functions');
//var camera = require(InstallPath + 'server/app/camera');
var robot = require('./robot.js');

// load the routes
require('./routes')(app);

//serverADDR = systemModules.getServerIP();
//serverADDR = "192.168.1.131";

app.use(express.static(InstallPath + 'wwwroot'));

//Get IP address http://stackoverflow.com/questions/3653065/get-local-ip-address-in-node-js

var os = require('os');
var ifaces = os.networkInterfaces();

Object.keys(ifaces).forEach(function (ifname) {
  var alias = 0
    ;

  ifaces[ifname].forEach(function (iface) {
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
//---------------

//--------------- Logging middleware ---------------
var log = bunyan.createLogger({
  name: 'bo-Pi',
  streams: [
    /*{
      level: 'debug',
      stream: process.stdout            // log INFO and above to stdout
    },*/
    {
   
      path: InstallPath + 'log/log.log'  // log ERROR and above to a file
    }
  ]
});


/* log.info('hi');
log.warn({lang: 'fr'}, 'au revoir');
log.error('ERROR abc');
log.debug('debug msg');
*/

// main ======================================================================
robot.initServos(SERVO_1_GPIO, SERVO_2_GPIO);
robot.LEDInit(LED1_R, LED1_G, LED1_B);
   log.info('servos initialized sudo /home/pi/pi-blaster/pi-blaster ' + SERVO_1_GPIO + ' ' + SERVO_2_GPIO);
   log.info('servos parameters: ' + SERVO_1_GPIO + ' ' + SERVO_2_GPIO + ' ' + SERVO_1_MIN  + ' ' + SERVO_2_MIN + ' ' + SERVO_1_MAX + ' ' + SERVO_2_MAX);
        

io.on('connection', function(socket) {
    socket.emit('connected', 'Connected ' + systemModules.timeStamp() + ' v' + version + ' @' + serverADDR);
    socket.emit('serverADDR', serverADDR);
	
    
log.info('New socket.io connection - id: %s', socket.id, ' server address: ' + serverADDR);
 
   
    socket.on('Video', function(Video)
	{
	        log.info('video ' + InstallPath + 'app/bin/' + Video);
	socket.emit('CMD', Video);
 
        function puts(error, stdout, stderr) {
            sys.puts(stdout)
        }
        exec('sudo bash ' + InstallPath + 'app/bin/' + Video, puts);
        

       
    });

/* socket.on('Video', function(err, Video) {
	if (err) {
	log.error(err);	
	}
	else
	{ 
	//log.info("Videofeed activated");	
	socket.emit('CMD', Video);
 
        function puts(error, stdout, stderr) {
            sys.puts(stdout)
        }
        exec('sudo bash ' + InstallPath + 'app/bin/' + Video, puts);
        
        log.info('video started ' + InstallPath + 'app/bin/' + Video);
       }
    });

*/
    socket.on('REBOOT', function() {
        function puts(error, stdout, stderr) {
            sys.puts(stdout)
        }
        exec('sudo reboot now');
        socket.emit('Info', "Rebooting")
    });

    socket.on('move', function(dX, dY) {
        robot.move(dX, dY, SERVO_1_GPIO, SERVO_2_GPIO, SERVO_1_MIN, SERVO_2_MIN, SERVO_1_MAX, SERVO_2_MAX)
      
        
    });

    socket.on('stop', function() {
        robot.stop(SERVO_1_GPIO, SERVO_2_GPIO);
  
    });

    socket.on('RGBLED', function(R, G, B) {
        robot.changeLED(LED1_R, LED1_G, LED1_B, R, G, B);
        
    });

    socket.on('TLInterval', function(T) {
        TLInterval = T * 1000;
        socket.emit('Info', 'timelapse set to ' + T + 's')
        if (debugLevel > 1) {
            console.log('Timelapse interval set to ' + TLInterval);
        }
    });


    socket.on('TLStart', function() {
        // function puts(error, stdout, stderr) { sys.puts(stdout) }       
        camera.startTL(imgWidth, imgHeight, TLInterval, TLFolder, systemModules.timeStamp());
        socket.emit('Info', 'Time-lapse started');

    });

    socket.on('TLStop', function() {
        clearInterval(TLInterval);
        socket.emit('Info', 'Time-lapse stopped');

    });

    socket.on('takeSnapShot', function() {
       var fileName =  'SN_' + systemModules.timeStamp();
       //console.log(SNimgWidth, SNimgHeight, SNFolder,fileName, serverADDR, MJPGPort);
       
        camera.snapShot(SNimgWidth, SNimgHeight, SNFolder, fileName, serverADDR, MJPGPort);
	log.info('snapshot saved ' + SNFolder + fileName);
        socket.emit('Info', fileName + '.jpg');
        socket.emit('Folder', SNFolder);
    });

    socket.on('shutDown', function() {
        socket.emit('Info', 'Shutting down...');

        function puts(error, stdout, stderr) {
            sys.puts(stdout)
        }
	log.info('shutting down NOW');
        exec('sudo shutdown now');
    });


});


http.listen(serverPort, function() {
    console.log(nconf.get('server:name') + ' listening on ' + serverADDR + ':', serverPort);
    log.info(nconf.get('server:name') + ' listening on ' + serverADDR + ':', serverPort);

});


