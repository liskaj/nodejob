var express = require('express'),
    http = require('http'),
    io = require('socket.io'),
    models = require('./models'),
    jobServer = require('./jobserver');

var app = express(),
    server = http.createServer(app),
    io = io.listen(server);

app.configure(function() {
    app.use(express.bodyParser());
    app.use(express.static(__dirname + '/public'));
});

io.sockets.on('connection', function(socket) {
    socket.on('workerStart', function(data) {
        console.log('Worker started');
        console.log('> id: ' + data._id);
        console.log('> name: ' + data.name);
        socket.broadcast.emit('jobStart', data);
    });

    socket.on('workerEnd', function(data) {
        console.log('Worker finished');
        console.log('> status: ' + data.status);
        console.log('> result: ' + data.result);
        socket.broadcast.emit('jobEnd', data);
    });
});

var port = process.env.PORT || 3000;

// display default page
app.get('/', function(req, res) {
    res.sendfile(__dirname + '/public/index.html');
});

// API methods
app.get('/models', models.getAll);
app.get('/models/:name/properties', models.getModelPropertiesByName);
app.get('/jobs', jobServer.getAllJobs);
app.post('/jobs', jobServer.addJob);
app.get('/jobs/:id', jobServer.getJobById);
app.put('/jobs/:id', jobServer.updateJob);

server.listen(port, function() {
    console.log('Listening on ' + port);
});



