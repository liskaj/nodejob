var fs = require('fs'),
    child_proc = require('child_process'),
    path = require('path'),
    request = require('request'),
    io = require('socket.io-client');

var server = 'http://localhost:3000',
    isExecutingJob = false,
    jobInterval = 5000;

var socket = io.connect('http://localhost:3000');

setTimeout(function() {
    getJob();
}, 100);

var getJob = function() {
    console.log('Checking job queue');
    if (isExecutingJob) {
        setTimeout(getJob, jobInterval);
        return;
    }
    var url = server  + '/jobs?status=0';

    request.get({ url: url }, function(err, res, body) {
        var jobs = JSON.parse(body);

        console.log(jobs.length);
        if (jobs.length > 0) {
            var j = jobs[0];

            executeJob(j);
        }
        setTimeout(getJob, jobInterval);
    });
}

var executeJob = function(job) {
    console.log('Starting job: ' + job._id.toString());
    isExecutingJob = true;
    socket.emit('workerStart', job);
    var appPath = path.resolve('./bin/' + 'GetMassProps.exe').toString();

    console.log(' STARTING WORKER: ' + appPath);
    var outputFile = path.resolve('./results/' + job._id + '.json').toString();
    var params = [ job.name, outputFile];

    var childProcess = child_proc.spawn(appPath, params);

    childProcess.stdout.on('data', function(data) {
        console.log(' ' + data.toString());
    });

    childProcess.on('exit', function(code) {
        console.log(' WORKER FINISHED: ' + code.toString());
        var url = server  + '/jobs/' + job._id.toString();

        if (code == 0)
        {
            fs.readFile(outputFile, 'utf8', function(err, data) {
                if (err) {
                    job.status = 2;
                    job.result = { error: err };
                }
                else {
                    var model = JSON.parse(data);

                    job.status = 1;
                    job.result = model;
                }


                request.put({ url: url, json: job }, function(err, res, body) {
                    socket.emit('workerEnd', job);
                    isExecutingJob = false;
                });
            });
        }
        else
        {
            job.status = 2;
            job.result = { error: code };

            request.put({ url: url, json: job }, function(err, res, body) {
                socket.emit('workerEnd', job);
                isExecutingJob = false;
            });
        }
    });

    /*
    var url = server  + '/jobs/' + job._id.toString();

    console.log(url);
    //request.put({url:url}, function)
    job.status = 1;
    job.result = { model: { name: job.name, mass: 0.0, volume: 0.0, bbox: { x: 0.0, y: 0.0, z: 0.0}}};
    request.put({ url: url, json: job }, function(err, res, body) {
        socket.emit('workerEnd', job);
        isExecutingJob = false;
    });*/
}
