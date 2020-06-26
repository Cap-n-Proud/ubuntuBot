const cv = require('opencv4nodejs');
var server = require('../server');

//var exec = require('child_process').exec;

var nconf = require('nconf');
nconf.argv()
    .env()
    .file({
        file: __dirname + '/config.json'
    });

const FPS = nconf.get('video:FPS');
const screenMargin = nconf.get('video:screenMargin');
const videoSource = nconf.get('video:videoSource');
const hudColor = JSON.parse(server.nconf.get('video:hudColor'));
const onScreenColor = JSON.parse(server.nconf.get('video:onScreenColor'));
const videoWidth = JSON.parse(server.nconf.get('video:videoWidth'));
const fontSize = videoWidth * JSON.parse(server.nconf.get('video:fontBaseSize')) / 320;

var frame = 0;
var e = 0;
var heading = 0;

// initialize camera
/*
  function puts(error, stdout, stderr) { sys.puts(stdout) }
    exec('sudo modprobe bcm2835-v4l2', puts);
*/

const videoCap = new cv.VideoCapture(videoSource);

function startVideoFeed(socket, videoWidth, videoHeight, fps) {
    videoCap.set(cv.CAP_PROP_FRAME_WIDTH, Number(videoWidth));
    videoCap.set(cv.CAP_PROP_FRAME_HEIGHT, Number(videoWidth));
    var camInterval = 1000 / fps;
    var memory, rss, memoryLeakLimit;

    setInterval(function() {
        memory = process.memoryUsage();
        rss = memory.rss / 1024 / 1024;
        memoryLeakLimit = 100;
        //heading += 3;

        if (rss > memoryLeakLimit) {
            //console.log('Memory leak detected (' + rss.toFixed(1) + ' Mb) : call GC');
            // if (typeof global.gc === 'function') {
            //   global.gc();
            //}
        }

    }, 1 * 1000)

    setInterval(function() {
        var im;
        var start;
        var d = new Date();
        start = d.getTime();
        //camera.read(function(err, im)
        //{
        //	if (err) throw err;
        frame++;
        im = videoCap.ReadSync();
        if (server.nconf.get('video:drawCompass')) drawCompass(im, videoWidth, videoHeight, server.Telemetry['yaw']);
        if (server.nconf.get('video:drawCrosshair')) drawCrosshair(im, videoWidth, videoHeight);
        if (server.nconf.get('video:drawOverlayInfo')) drawOverlayInfo(im, videoWidth, videoHeight, rss, fps);
        if (im.size()[0] > 0 && im.size()[1] > 0) {
            socket.emit('frame', {
                buffer: im.toBuffer({
                    ext: ".jpg",
                    jpegQuality: 80
                })
            });
        } else {
            e++
        }

        im.release();
        d = new Date();
        fps = 1000 / (d.getTime() - start);
        //});
    }, camInterval);
};

function drawCrosshair(im, videoWidth, videoHeight) {
    im.drawLine(new Point2(videoWidth / 2 - 20, videoHeight / 2), new Point2(videoWidth / 2 - 40, videoHeight / 2), , new Vec(hudColor));
    im.drawLine(new Point2(videoWidth / 2 + 20, videoHeight / 2), new Point2(videoWidth / 2 + 40, videoHeight / 2), , new Vec(hudColor));
    im.drawLine(new Point2(videoWidth / 2, videoHeight / 2 - 20), new Point2(videoWidth / 2, videoHeight / 2 - 40), , new Vec(hudColor));
    im.drawLine(new Point2(videoWidth / 2, videoHeight / 2 + 20), new Point2(videoWidth / 2, videoHeight / 2 + 40), , new Vec(hudColor));
}

function map(x, in_min, in_max, out_min, out_max) {
    return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function reduce(val, base) {
    return val - parseInt(val / base) * base;
}

function drawCompass(im, videoWidth, videoHeight, heading) {
    var minI = 0; //videoWidth / 5,
    maxI = 360; //(4 / 5) * videoWidth,
    compassRange = maxI - minI;
    var compassRange = maxI - minI;
    for (i = minI; i < maxI; i++) {
        if (i % 20 == 0)
            im.drawLine(new Point2(reduce(i + heading, compassRange) + minI, -screenMargin), new Point2(reduce(i + heading, compassRange) + minI, +screenMargin + 10), , new Vec(hudColor));
        if (i % 10 == 0)
            im.drawLine(new Point2(reduce(i + heading, compassRange) + minI, -screenMargin), new Point2(reduce(i + heading, compassRange) + minI, +screenMargin + 5), , new Vec(hudColor));
        if (i == map(0, 0, 360, minI, maxI))
            im.putText("N", reduce(i + heading + videoWidth / 2, compassRange) + minI, 25, "CV_FONT_HERSHEY_SIMPLEX", onScreenColor, 0.7 * fontSize);
        if (i == map(270, 0, 360, minI, maxI))
            im.putText("E", reduce(i + heading + videoWidth / 2, compassRange) + minI, 25, "CV_FONT_HERSHEY_SIMPLEX", onScreenColor, 0.7 * fontSize);
        if (i == map(180, 0, 360, minI, maxI))
            im.putText("S", reduce(i + heading + videoWidth / 2, compassRange) + minI, 25, "CV_FONT_HERSHEY_SIMPLEX", onScreenColor, 0.7 * fontSize);
        if (i == map(90, 0, 360, minI, maxI))
            im.putText("W", reduce(i + heading + videoWidth / 2, compassRange) + minI, 25, "CV_FONT_HERSHEY_SIMPLEX", onScreenColor, 0.7 * fontSize);
        drawHeading(im, videoWidth, videoHeight, heading);
    }
}

function drawHeading(im, videoWidth, videoHeight, heading) {
    const lenght = fontSize * 80;
    const height = fontSize * 30;
    im.drawLine(new Point2(videoWidth / 2 - lenght / 2, +45), new Point2(videoWidth / 2 + lenght / 2, +45), , new Vec(hudColor));
    im.drawLine(new Point2(videoWidth / 2 - lenght / 2, +45), new Point2(videoWidth / 2 - lenght / 2, +45 - height), , new Vec(hudColor));
    im.drawLine(new Point2(videoWidth / 2 + lenght / 2, +45), new Point2(videoWidth / 2 + lenght / 2, +45 - height), , new Vec(hudColor));
    im.drawLine(new Point2(videoWidth / 2 - lenght / 2, +45 - height), new Point2(videoWidth / 2, +45 - height - 8), , new Vec(hudColor));
    im.drawLine(new Point2(videoWidth / 2 + lenght / 2, +45 - height), new Point2(videoWidth / 2, +45 - height - 8), , new Vec(hudColor));
    im.putText(heading, videoWidth / 2 - lenght / 2 + 2 * screenMargin, 45 - screenMargin, "CV_FONT_HERSHEY_SIMPLEX", onScreenColor, fontSize);
}

function drawOverlayInfo(im, videoWidth, videoHeight, memory, fps) {
    const lineSpace = 3 * 10 * fontSize;
    const leftCol = 0.01 * videoWidth,
        rightCol = 0.75 * videoWidth;

    im.putText(videoWidth + "x" + videoHeight, leftCol, videoHeight - 0 * lineSpace - screenMargin, "CV_FONT_HERSHEY_SIMPLEX", onScreenColor, fontSize);
    // im.putText("f:" + frame, leftCol, videoHeight - 1 * lineSpace - screenMargin, "CV_FONT_HERSHEY_SIMPLEX", onScreenColor, fontSize);
    im.putText("fps: " + parseInt(fps), leftCol, videoHeight - 1 * lineSpace - screenMargin, "CV_FONT_HERSHEY_SIMPLEX", onScreenColor, fontSize);
    im.putText("y: " + server.Telemetry['yaw'], rightCol, videoHeight - 3 * lineSpace - screenMargin, "CV_FONT_HERSHEY_SIMPLEX", onScreenColor, fontSize);
    im.putText("r: " + server.Telemetry['roll'], rightCol, videoHeight - 2 * lineSpace - screenMargin, "CV_FONT_HERSHEY_SIMPLEX", onScreenColor, fontSize);
    im.putText("p: " + server.Telemetry['pitch'], rightCol, videoHeight - 4 * lineSpace - screenMargin, "CV_FONT_HERSHEY_SIMPLEX", onScreenColor, fontSize);
    im.putText("t: " + server.temperature, rightCol, videoHeight - 1 * lineSpace - screenMargin, "CV_FONT_HERSHEY_SIMPLEX", onScreenColor, fontSize);
    im.putText("m: " + parseInt(memory), rightCol, videoHeight - 0 * lineSpace - screenMargin, "CV_FONT_HERSHEY_SIMPLEX", onScreenColor, fontSize);
    //im.putText("t: " + server.nconf.get('server:version'), 0.8 * videoWidth, 0.3 * videoHeight - 3 * lineSpace, "CV_FONT_HERSHEY_SIMPLEX", server.nconf.get('video:onScreenColor'), 0.5);
    // im.putText(" x " + videoHeight, 0.01 * videoWidth + 10, 0.9 * videoHeight, "CV_FONT_HERSHEY_SIMPLEX", onScreenColor, fontSize);
}
exports.startVideoFeed = startVideoFeed;
