var nconf = require('nconf');
nconf.argv()
    .env()
    .file({
        file: __dirname + '/config.json'
    });


var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
//var port = process.env.PORT || 3000;
var port =3000;

// load the routes
require('./routes')(app);

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
    console.log(msg);
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});



module.exports.nconf = nconf;
