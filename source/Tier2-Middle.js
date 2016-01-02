
var bodyparser = require('body-parser');
var express = require('express');
var status = require('http-status');
var fs = require('fs');

var db = JSON.parse(fs.readFileSync(__dirname + '/Tier3-DB.json'));
var arrIndex = createIndex(db);
var nextClientID = arrIndex.length + 1;

var app = express();

app.use('/api/v1', getApi());

app.get('/', function(req, res)
{
    res.sendFile(__dirname + '/Tier1-UI.html');
});

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
    });

    // Read
    api.get('/clients/:id', function(req, res)
    {
        var client = db[req.params.id];

        if (client === undefined)
        {
            res.status(status.NOT_FOUND).json({ error: 'Not found' });
        }
        else
        {
            res.json({data: client});
        }
    });

    api.get('/clients/pages/:pagenum', function(req, res)
    {
        var PAGESIZE = 20;
        var nPageNum = parseInt(req.params.pagenum);
        var nStart = (nPageNum-1) * 20;
        var arrItems = [];

        for (var n = 0; n < PAGESIZE; ++n)
        {
            var nIndex = nStart + n;

            if (nIndex >=0 && nIndex < arrIndex.length)
            {
                var client = {clientId: arrIndex[nIndex], fields: db[arrIndex[nIndex]]};
                arrItems.push(client);
            }
        }

        var arrLinks = [];

        if (req.params.pagenum > 1)
        {
            arrLinks.push({'rel': 'First', 'pageNumber': 1});
            arrLinks.push({'rel': 'Previous', 'pageNumber': (nPageNum - 1)});
        }
        else
        {
            arrLinks.push({'rel': 'First'});
            arrLinks.push({'rel': 'Previous'});
        }

        if (PAGESIZE * req.params.pagenum < arrIndex.length)
        {
            arrLinks.push({'rel': 'Next', 'pageNumber': (nPageNum + 1)});
            arrLinks.push({'rel': 'Last', 'pageNumber': Math.floor(arrIndex.length/PAGESIZE)});
        }
        else
        {
            arrLinks.push({'rel': 'Next'});
            arrLinks.push({'rel': 'Last'});
        }

        res.json(
        {
            'data': arrItems,
            'links': arrLinks
        });

    });

    // Update
    api.put('/clients/:id', function(req, res)
    {
        if (db[req.params.id] === undefined)
        {
            res.status(status.NOT_FOUND).json({ error: 'Not found' });
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
        if (db[clientA].Surname === db[clientB].Surname)
        {
            return (db[clientA].FirstName < db[clientB].FirstName) ? -1 : 1;
        }
        else
        {
            return (db[clientA].Surname < db[clientB].Surname) ? -1 : 1;
        }
    });

    return arrIndex;
}

