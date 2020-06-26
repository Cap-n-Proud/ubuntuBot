const serPort = "/dev/ttyACM0"
const serBaud = "9600"
const SerialPort = require('serialport')
const serialPort = new SerialPort(serPort, {
  baudrate: serBaud,
  parser: com.parsers.readline('\n')
});

port.write('main screen turn on', function(err) {
  if (err) {
    return console.log('Error on write: ', err.message)
  }
  console.log('message written')
})

// Open errors will be emitted as an error event
port.on('error', function(err) {
  console.log('Error: ', err.message)
})
//dsdsds
// Read data that is available but keep the stream in "paused mode"
//port.on('readable', function () {

//console.log("Data received")

//console.log(port.read().toString('utf8'))
//  console.log('Data:', port.read())
//})

// Switches the port into "flowing mode"
//port.on('data', function (data) {
//  console.log('Data:', data)
//})

// Pipe the data into another stream (like a parser or standard out)
//const lineStream = port.pipe(new Readline())
//const parser = port.pipe(new Readline({ delimiter: '\r\n' }))
serialPort.on('data', console.log)
