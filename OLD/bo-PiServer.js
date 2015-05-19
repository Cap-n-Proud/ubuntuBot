//Server file
var nconf = require('/usr/local/lib/node_modules/nconf');
nconf.argv()
       .env()
       .file({ file: '/home/pi/bo-Pi/config.json' });

var express = require('/usr/local/lib/node_modules/express');
var app = express();
var http = require('http').Server(app);
var io = require('/usr/local/lib/node_modules/socket.io')(http);
var fs = require('/usr/local/lib/node_modules/safefs');
var piblaster = require('/usr/local/lib/node_modules/pi-blaster.js');
var sys = require('sys');
var exec = require('child_process').exec;

var SNFolder = nconf.get('server:SNFolder');
var InstallPath = nconf.get('server:InstallPath');

var serverPort = nconf.get('server:port');
var MJPGPort = nconf.get('MJPG:MJPGPort');
var version = nconf.get('server:version');

var SERVO_1_GPIO = nconf.get('hardware:SERVO_1_GPIO');
var SERVO_2_GPIO = nconf.get('hardware:SERVO_2_GPIO');
var SERVO_1_MIN =  nconf.get('hardware:SERVO_1_MIN');
var SERVO_1_MAX =  nconf.get('hardware:SERVO_1_MAX');
var SERVO_2_MIN =  nconf.get('hardware:SERVO_2_MIN');
var SERVO_2_MAX =  nconf.get('hardware:SERVO_2_MAX');

var serverADDR = 'N/A';

var TLimgWidth = nconf.get('camera:TLimgWidth');
var TLimgHeight = nconf.get('camera:TLimgHeight');

var SNimgWidth = nconf.get('camera:SNimgWidth');
var SNimgHeight = nconf.get('camera:SNimgHeight');

var TLInterval = nconf.get('camera:TLInterval');

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


app.use(express.static(__dirname + '/public'));
// Routers
{
    app.get('/', function(req, res) {
        res.sendFile(__dirname + '/public/index.html');
        res.end;
    });

    app.get('/vj', function(req, res) {
        res.sendFile(__dirname + '/public/robotj.html');
        res.end;
    });
    
    app.get('/test', function(req, res) {
        res.sendFile(__dirname + '/public/test.html');
        res.end;
    });

    app.get('/REBOOT', function(req, res) {
        var postData = req.url;

        function puts(error, stdout, stderr) {
            sys.puts(stdout)
        }
        exec('sudo reboot now');
        sockets.emit('Info', "Rebooting")
            //console.log(postData);
        res.end;
    });

}

// Logging middleware if needed



var mkdirSync = function(path) {
    try {
        fs.mkdirSync(path);
    } catch (e) {
        if (e.code != 'EEXIST') throw e;
    }
}


io.on('connection', function(socket) {
    var myDate = new Date();
    socket.emit('connected', 'Connected ' + myDate.getHours() + ':' + myDate.getMinutes() + ':' + myDate.getSeconds()+ ' v' + version + ' @' + serverADDR);
    socket.emit('serverADDR', serverADDR);
    console.log('New socket.io connection - id: %s', socket.id);
  
    function puts(error, stdout, stderr) {
        sys.puts(stdout)
    }
    exec('sudo /home/pi/pi-blaster/pi-blaster 4 17');



    socket.on('Video', function(Video) {
        socket.emit('CMD', Video);
        console.log(Video);

        function puts(error, stdout, stderr) {
            sys.puts(stdout)
        }
        exec('sudo bash ' + InstallPath + 'scripts/' + Video, puts);
    });


    socket.on('REBOOT', function() {
        function puts(error, stdout, stderr) {
            sys.puts(stdout)
        }
        exec('sudo reboot now');
        socket.emit('Info', "Rebooting")
    });

    socket.on('move', function(dX, dY) {
        //Need a value -100, 100
	PWL = rescale(parseFloat(dY) - parseFloat(-dX), -100.000, 100, parseFloat(SERVO_1_MIN), parseFloat(SERVO_1_MAX));
	PWR = rescale(parseFloat(-dY) + parseFloat(dX), -100.000, 100, parseFloat(SERVO_2_MIN), parseFloat(SERVO_2_MAX));
     
	piblaster.setPwm(SERVO_2_GPIO, PWL);
        piblaster.setPwm(SERVO_1_GPIO, PWR);
   });
    
    socket.on('stopCam', function(dX, dY) {
        piblaster.setPwm(SERVO_2_GPIO, 0);
        piblaster.setPwm(SERVO_1_GPIO, 0);      
    });

    socket.on('TLInterval', function(T) {
        TLInterval = T * 1000;
        socket.emit('Info', 'timelapse set to ' + T + 's')
    });

    
    function timeStamp(){
      
     var MyDate = new Date();
        var MyDateString;
        var MyTimeStamp;
        MyDateString = ('0' + MyDate.getFullYear()).slice(-2) + '-' + ('0' + (MyDate.getMonth() + 1)).slice(-2) + '-' + ('0' + (MyDate.getUTCDate())).slice(-2);
        MyTimeStamp = ('0' + MyDate.getHours()).slice(-2) + '-' + ('0' + (MyDate.getMinutes())).slice(-2) + '-' + ('0' + (MyDate.getSeconds())).slice(-2);

      return MyDateString + '_' + MyTimeStamp      
    }
    
    function snapShotTL(imgWidth, imgHeight, folderName, fileName) {
       
      function puts(error, stdout, stderr) {
            sys.puts(stdout)
        }
        exec('sudo raspistill -w ' + imgWidth + ' -h ' + imgHeight + ' -o ' + folderName + '/' + fileName + '.jpg  -sh 40 -awb auto -mm average -v');
        socket.emit('Info', fileName + '.jpg');
	socket.emit('Folder', folderName);
      
    }
    
    function snapShot(imgWidth, imgHeight, folderName, fileName) {
       
      function puts(error, stdout, stderr) {
            sys.puts(stdout)
        }
      exec('sudo wget -O ' + folderName + fileName + '.jpg http://' + serverADDR + ':' + MJPGPort + '/?action=snapshot');
    	socket.emit('Info', fileName + '.jpg');
	socket.emit('Folder', folderName);

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

    var myVar = "";
    socket.on('TLStart', function() {
        // function puts(error, stdout, stderr) { sys.puts(stdout) }
       
        TLfolderName = TLFolder + 'TL_' + timeStamp();
        TLfileName = 'TL_' + timeStamp();
        fs.mkdir(TLfolderName);
        socket.emit('Folder', TLfolderName);
        //console.log(TLfolderName);
        myVar = setInterval(function() {
            snapShotTL(TLimgWidth, TLimgHeight, TLfolderName, TLfileName)
        }, TLInterval);
	socket.emit('Info', 'Time-lapse started');

    });

    socket.on('TLStop', function() {
        clearInterval(myVar);
        socket.emit('Info', 'Time-lapse stopped');

    });

    socket.on('takeSnapShot', function() {
	snapShot(SNimgWidth, SNimgHeight, SNFolder, 'SN_' + timeStamp());
    
    });

    socket.on('shutDown', function() {
      socket.emit('Info', 'Shutting down...');
      function puts(error, stdout, stderr) {
            sys.puts(stdout)
        }
        exec('sudo shutdown now');
    });

  
});


http.listen(serverPort, function() {
 console.log( nconf.get('server:name') + ' listening on *: ', serverPort); //
});