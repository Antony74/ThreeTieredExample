
var db = {};

var callbackQueue = [];

/*global window*/
if (typeof(window) !== 'undefined')
{
    window.threeTieredExampleApi =
    {
        read: function($http, clientId, callback)
        {
            callbackQueue.push(['read', [$http, clientId, callback]]);
        },

        readPage: function($http, pageNumber, callback)
        {
            callbackQueue.push(['readPage', [$http, pageNumber, callback]]);
        },

        update: function($http, clientId, client, callback)
        {
            callbackQueue.push(['update', [$http, clientId, client, callback]]);
        },

        delete: function($http, clientId, callback)
        {
            callbackQueue.push(['delete', [$http, clientId, callback]]);
        }
    };

    /*global angular*/
    angular.injector(['ng']).invoke(function($http)
    {
        $http.get('Tier3-DB.json').success(exposeDatabase);
    });
}
else
{
    var fs = require('fs');
    var db = JSON.parse(fs.readFileSync(__dirname + '/Tier3-DB.json'));
    exposeDatabase(db);
}

//
// exposeDatabase
//
function exposeDatabase(db)
{
    var arrIndex = createIndex(db);
    var nextClientID = arrIndex.length + 1;

    var api =
    {
        // Create
        create: function($http, client, callback)
        {
            db[nextClientID.toString()] = client;
            var retval = {id: nextClientID};
            ++nextClientID;
            arrIndex = createIndex(db);
            callback(retval);
        },

        // Read
        read: function($http, clientId, callback)
        {
            var client = db[clientId];
            callback({data: client});
        },

        readPage: function($http, nPageNum, callback)
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
        },

        // Update
        update: function($http, clientId, client, callback)
        {
            db[clientId] = client;
            callback();
        },

        // Delete
        delete: function($http, clientId, callback)
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
        },
    };

    if (typeof(window) !== 'undefined')
    {
        // We are in the browser so expose the JavaScript API
        window.threeTieredExampleApi = api;

        // Also make any API calls which have been queued
        while (callbackQueue.length)
        {
            var queuedItem = callbackQueue.shift();
            api[queuedItem[0]].apply(api, queuedItem[1]);
        }
    }
    else
    {
        // We are not in the browser so expose the http API
        var express = require('express');

        var app = express();

        app.use('/api/v1', getHttpApi(api));

        app.get('/', function(req, res)
        {
            res.sendFile(__dirname + '/Tier1-UI.html');
        });

        var port = 8080;
        var sServerUrl = 'http://localhost:' + port + '/';

        app.listen(port);
        console.log('Server has been started (' + sServerUrl + ')');
    }
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

