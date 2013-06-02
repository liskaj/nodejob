var fs = require('fs'),
    path = require('path'),
    http = require('http'),
    jobServer = require('./jobserver');

exports.getAll = function(req, res) {
    //res.send({models:[{name:'Box.ipt'}, {name:'Corner.ipt'}, {name:'Plate.ipt'}]});
    res.writeHead(200, { 'Content-Type':'application/json'});
    var folderPath = path.resolve('./models').toString();

    fs.readdir(folderPath, function(err, files) {
        if (err) throw err;
        var result = { models: [] };

        for (var i = 0; i < files.length; i++) {
            var fileName = files[i];

            if (path.extname(fileName) == ".ipt") {
                var model = { id: i, name: files[i] };

                result.models.push(model);
            }
        }
        res.end(JSON.stringify(result));
    });
};

exports.getModelPropertiesByName = function(req, res) {
    var name = req.params.name;

    console.log(name);
    var jsonObject = JSON.stringify({ name: name, description: ""});

    var options = {
        host: "localhost",
        port: 3000,
        path: '/jobs',
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json',
            'Content-Length' : Buffer.byteLength(jsonObject, 'utf8')
        }
    };
    var result = '';

    var request = http.request(options, function(response) {
        console.log("statusCode: ", response.statusCode);
        response.on('data', function(data) {
            result += data;
        });

        response.on('end', function() {
            res.writeHead(200, { 'Content-Type':'application/json'});
            res.end(result);
        });
    });

    request.write(jsonObject);
    request.end();
    /*jobServer.addJob(name, function(job, err) {
        console.log(job);
        res.writeHead(200, { 'Content-Type':'application/json'});
        res.end(JSON.stringify(job));
    });*/
}
