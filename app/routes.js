// Routers
// expose the routes to our app with module.exports
module.exports = function(app) {

var path = require('path'); 

    //app.use(express.static(__dirname + '/public'));
    // Routers
  
        app.get('/', function(req, res) {
            res.sendFile('/home/pi/bo-Pi/wwwroot/index.html');
            res.end;
        });

        app.get('/vj', function(req, res) {
            res.sendFile('/home/pi/bo-Pi/wwwroot/robotj.html');
            res.end;
        });

        app.get('/test', function(req, res) {
            res.sendFile(path.resolve(__dirname + '/../wwwroot/test.html'));
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