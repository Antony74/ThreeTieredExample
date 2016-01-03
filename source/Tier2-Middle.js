
var db = {};
var arrIndex = [];
var nextClientID = 1;

//
// databaseReady
//
var databaseReady = function(callback)
{
    /*global window, angular*/
    if (typeof(window) !== 'undefined')
    {
        // We're running within the browser so use http to load the 'database'
        angular.injector(['ng']).invoke(function($http)
        {
            $http.get('Tier3-DB.json').success(gotDatabase);
        });
    }
    else
    {
        // We're running within nodejs so use fs to load the 'database'
        var fs = require('fs');
        gotDatabase(JSON.parse(fs.readFileSync(__dirname + '/Tier3-DB.json')));
    }

    // Once we've got the database, finish readying it
    function gotDatabase(loadedDatabase)
    {
        db = loadedDatabase;
        arrIndex = createIndex(db);
        nextClientID = arrIndex.length + 1;

        // Closure.  Once the database is ready it stays ready.
        databaseReady = function(callback)
        {
            callback();
        };


        callback();
    }
};

//
// jsApi
//
var jsApi =
{
    // Create
    create: function($http, client, callback)
    {
        databaseReady(function()
        {
            db[nextClientID.toString()] = client;
            var retval = {id: nextClientID};
            ++nextClientID;
            arrIndex = createIndex(db);
            callback(retval);
        });
    },

    // Read
    read: function($http, clientId, callback)
    {
        databaseReady(function()
        {
            var client = db[clientId];
            callback({data: client});
        });
    },

    readPage: function($http, nPageNum, callback)
    {
        databaseReady(function()
        {
            nPageNum = parseInt(nPageNum);

            var PAGESIZE = 20;
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

            if (nPageNum > 1)
            {
                arrLinks.push({'rel': 'First', 'pageNumber': 1});
                arrLinks.push({'rel': 'Previous', 'pageNumber': (nPageNum - 1)});
            }
            else
            {
                arrLinks.push({'rel': 'First'});
                arrLinks.push({'rel': 'Previous'});
            }

            if (PAGESIZE * nPageNum < arrIndex.length)
            {
                arrLinks.push({'rel': 'Next', 'pageNumber': (nPageNum + 1)});
                arrLinks.push({'rel': 'Last', 'pageNumber': Math.floor(arrIndex.length/PAGESIZE)});
            }
            else
            {
                arrLinks.push({'rel': 'Next'});
                arrLinks.push({'rel': 'Last'});
            }

            callback(
            {
                'data': arrItems,
                'links': arrLinks
            });
        });
    },

    // Update
    update: function($http, clientId, client, callback)
    {
        databaseReady(function()
        {
            db[clientId] = client;
            callback();
        });
    },

    // Delete
    delete: function($http, clientId, callback)
    {
        databaseReady(function()
        {
            if (db[clientId] === undefined)
            {
                callback(false);
            }
            else
            {
                delete db[clientId];
                arrIndex = createIndex(db);
                callback(true);
            }
        });
    },
};

if (typeof(window) !== 'undefined')
{
    // We're running in the browser so expose the JavaScript API
    window.threeTieredExampleApi = jsApi;
}
else
{
    // We're running within nodejs so expose the http API
    databaseReady(function()
    {
        var express = require('express');

        var app = express();

        app.use('/api/v1', getHttpApi(jsApi));

        app.get('/', function(req, res)
        {
            res.sendFile(__dirname + '/Tier1-UI.html');
        });

        var port = 8080;
        var sServerUrl = 'http://localhost:' + port + '/';

        app.listen(port);
        console.log('Server has been started (' + sServerUrl + ')');
    });
}

//
// getHttpApi
//
function getHttpApi(api)
{
    var bodyparser = require('body-parser');
    var express = require('express');
    var status = require('http-status');

    var httpApi = express.Router();
    httpApi.use(bodyparser.json());

    // Create
    httpApi.post('/clients', function(req, res)
    {
        api.create(null, req.body, function(data)
        {
            res.json(data);
        });
    });

    // Read
    httpApi.get('/clients/:id', function(req, res)
    {
        api.read(null, req.params.id, function(data)
        {
            if (data.data === undefined)
            {
                res.status(status.NOT_FOUND).json({ error: 'Not found' });
            }
            else
            {
                res.json(data);
            }
        });
    });

    httpApi.get('/clients/pages/:pagenum', function(req, res)
    {
        api.readPage(null, req.params.pagenum, function(data)
        {
            res.json(data);
        });
    });

    // Update
    httpApi.put('/clients/:id', function(req, res)
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
    httpApi.delete('/clients/:id', function(req, res)
    {
        api.delete(null, req.params.id, function(bDone)
        {
            if (bDone)
            { 
                res.send();
            }
            else
            {
                res.status(status.NOT_FOUND).json({ error: 'Not found' });
            }
        });
    });

    return httpApi;
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

