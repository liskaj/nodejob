var mongo = require('mongodb');

var server = new mongo.Server('localhost', 27017, { auto_reconnect: true}),
    db = new mongo.Db('jobs', server, { safe: true}),
    BSON = mongo.BSONPure;

db.open(function(err, db) {
    if (!err) {
        console.log('Connected to database');
        db.collection('jobs', { strict: true }, function(err, collection) {
            if (err) {
                console.log("The jobs collection doesn't exist.");
            }
        });
    }
});

exports.addJob = function(req, res) {
    var data = req.body,
        newJob = { name: data.name, description: data.description, status: 0, result: "" };

    db.collection('jobs', function(err, collection) {
        collection.insert(newJob, { safe: true }, function(err, result) {
            if (err) {
                console.log('Error adding job: ' + err);
                res.send({'error':'An error has occurred'});
            }
            else
            {
                res.send(newJob);
            }
        });
    });
};

exports.updateJob = function(req, res) {
    var id = req.params.id,
        data = req.body;

    data._id = BSON.ObjectID(id);
    db.collection('jobs', function(err, collection) {
        collection.update({'_id': BSON.ObjectID(id)}, data, { safe: true }, function(err, result) {
            if (err) {
                console.log('Error updating job: ' + err);
                res.send({'error':'An error has occurred'});
            }
            else
            {
                collection.findOne({'_id': BSON.ObjectID(id)}, function(err, items) {
                    res.send(items);
                });
            }
        });
    });
};

exports.getAllJobs = function(req, res) {
    db.collection('jobs', function(err, collection) {
        var status = req.query['status'],
            query = undefined;

        if (status) {
            query = { status : parseInt(status) };
        }
        collection.find(query).toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.getJobById = function(req, res) {
    var id = req.params.id;

    db.collection('jobs', function(err, collection) {
        collection.findOne({'_id': BSON.ObjectID(id)}, function(err, items) {
            res.send(items);
        });
    });
};


