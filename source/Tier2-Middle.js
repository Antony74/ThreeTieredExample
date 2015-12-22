
var bodyparser = require('body-parser');
var express = require('express');
var status = require('http-status');
var fs = require('fs');

var db = JSON.parse(fs.readFileSync(__dirname + '/Tier3-DB.json'));
var arrIndex = createIndex(db);
var nextClientID = arrIndex.length + 1;

var app = express();

app.use('/api/v1', getApi());

var port = 8080;
var sServerUrl = 'http://localhost:' + port + '/';

app.listen(port);
console.log('Server has been started (' + sServerUrl + ')');

//
// getApi
//
function getApi()
{
    var api = express.Router();
    api.use(bodyparser.json());

    // Create
    api.post('/clients', function(req, res)
    {
        db[nextClientID.toString()] = req.body;
        res.json({id: nextClientID});
        ++nextClientID;
        arrIndex = createIndex(db);
        res.send();
    });

    // Read
    api.get('/clients/:id', function(req, res)
    {
        var client = db[req.params.id];

        if (client === undefined)
        {
            res.status(status.NOT_FOUND).json({ error: 'Not found' });
            res.send();
        }
        else
        {
            res.json(client);
            res.send();
        }
    });

    // Update
    api.put('/clients/:id', function(req, res)
    {
        if (db[req.params.id] === undefined)
        {
            res.status(status.NOT_FOUND).json({ error: 'Not found' });
            res.send();
        }
        else
        {
            db[req.params.id] = req.body;
            res.send();
        }
    });

    // Delete
    api.delete('/clients/:id', function(req, res)
    {
        if (db[req.params.id] === undefined)
        {
            res.status(status.NOT_FOUND).json({ error: 'Not found' });
            res.send();
        }
        else
        {
            delete db[req.params.id];
            arrIndex = createIndex(db);
            res.send();
        }
    });

    return api;
}

//
// createIndex - unscalable nonsense because we're not using a proper database in this example
//
function createIndex(db)
{
    var arrIndex = [];

    for(var id in db)
    {
        arrIndex.push(id);
    }

    arrIndex.sort(function(clientA, clientB)
    {
        if (clientA.Surname === clientB.Surname)
        {
            return (clientA.FirstName < clientB.FirstName) ? -1 : 1;
        }
        else
        {
            return (clientA.Surname < clientB.Surname) ? -1 : 1;
        }
    });

    return arrIndex;
}

