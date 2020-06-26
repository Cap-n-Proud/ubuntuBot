// * @emits open
// * @emits data
// * @emits close
// * @emits error
// * @alias module:serialport

const serPort = "/dev/ttyACM0"
const serBaud = "9600"


const com = require('serialport')
const Readline = require('@serialport/parser-readline')
const sPort = new com(serPort,{
  baudRate: Number(serPort)
});

const serialPort = sPort.pipe(new Readline({ delimiter: '\r\n' }))


serialPort.on('open',function() {
  console.log('Arduino connected on '+ serPort + ' @' + serBaud);

});
serialPort.on('data', console.log)
