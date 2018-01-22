
var db = {};
var arrIndex = [];
var nextClientID = 1;

//
// jsApi
//
var jsApi =
{
    // Create
    create: function(client, callback)
    {
        db[nextClientID.toString()] = client;
        var retval = {id: nextClientID};
        ++nextClientID;
        arrIndex = createIndex(db);
        callback(retval);
    },

    // Read
    read: function(clientId, callback)
    {
        var client = db[clientId];
        callback({data: client});
    },

    readPage: function(nPageNum, sFilter, callback)
    {
        nPageNum = parseInt(nPageNum);
        sFilter = sFilter.toString().toLowerCase();

        var PAGESIZE = 20;
        var nFirst = ((nPageNum-1) * PAGESIZE) + 1;
        var nLast  = nFirst + PAGESIZE - 1;
        var nCurrentItem = 0;
        var bMore = false;

        var arrItems = [];

        for (var nIndex = 0; nIndex < arrIndex.length; ++nIndex)
        {
            var client = db[arrIndex[nIndex]];
            var bFound = false;

            for (var fieldname in client)
            {
                if (client[fieldname].toString().toLowerCase().indexOf(sFilter) !== -1)
                {
                    bFound = true;
                    break;
                }
            }

            if (bFound)
            {
                ++nCurrentItem;

                if (nCurrentItem >= nFirst)
                {
                    if (nCurrentItem > nLast)
                    {
                        bMore = true;
                    }
					else
					{
						var oClient = {clientId: arrIndex[nIndex], fields: client};
						arrItems.push(oClient);
					}
                }
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

        if (bMore)
        {
            arrLinks.push({'rel': 'Next', 'pageNumber': (nPageNum + 1)});
            arrLinks.push({'rel': 'Last', 'pageNumber': Math.ceil(nCurrentItem/PAGESIZE)});
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
    update: function(clientId, client, callback)
    {
        clientId = parseInt(clientId);

        if (db[clientId] === undefined)
        {
            callback(false);
        }
        else
        {
            db[clientId] = client;
            arrIndex = createIndex(db);
            callback(true);
        }
    },

    // Delete
    delete: function(clientId, callback)
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

	// databaseReady
	databaseReady: function(callback)
	{
		var url = 'Tier3-DB.json';

		/*global XMLHttpRequest:true*/
		if (typeof(XMLHttpRequest) === 'undefined')
		{
			XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
			url = 'file://' + __dirname + '/Tier3-DB.json';
		}

		var oReq = new XMLHttpRequest();
		oReq.addEventListener('load', function()
		{
			db = JSON.parse(this.responseText);

			arrIndex = createIndex(db);
			nextClientID = arrIndex.length + 1;

			// Closure.  Once the database is ready it stays ready.
			jsApi.databaseReady = function(callback)
			{
				callback();
			};

			callback();
		});

		oReq.open('GET', url);
		oReq.send();
	}
};

/*global window*/
if (typeof(window) !== 'undefined')
{
    // We're running in the browser so expose the JavaScript API
    window.threeTieredExampleApi = jsApi;
}
else
{
    // We're running within nodejs so expose the http API

    exports.serverStarted = function() {};

    jsApi.databaseReady(function()
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
        exports.serverStarted();
    });
}

//
// getHttpApi
//
function getHttpApi(jsApi)
{
    var bodyparser = require('body-parser');
    var express = require('express');
    var status = require('http-status');

    var httpApi = express.Router();
    httpApi.use(bodyparser.json());

    // Create
    httpApi.post('/clients', function(req, res)
    {
        jsApi.create(req.body, function(data)
        {
            res.json(data);
        });
    });

    // Read
    function setNoCacheHeaders(res)
    {
        res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
//        res.header('Pragma:', 'no-cache');
//        res.header('Expires:', '0');
    }

    httpApi.get('/clients/:id', function(req, res)
    {
        setNoCacheHeaders(res);

        jsApi.read(req.params.id, function(data)
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

    httpApi.get('/clients/pages/:pagenum/:filter?', function(req, res)
    {
        setNoCacheHeaders(res);

        var sFilter = req.params.filter ? req.params.filter : '';

        jsApi.readPage(req.params.pagenum, sFilter, function(data)
        {
            res.json(data);
        });
    });

    // Update
    httpApi.put('/clients/:id', function(req, res)
    {
        jsApi.update(req.params.id, req.body, function(bOK)
        {
            if (bOK)
            {
                res.send();
            }
            else
            {
                res.status(status.NOT_FOUND).json({ error: 'Not found' });
            }
        });
    });

    // Delete
    httpApi.delete('/clients/:id', function(req, res)
    {
        jsApi.delete(req.params.id, function(bDone)
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
        var surnameA = db[clientA].Surname.toString().toLowerCase();
        var surnameB = db[clientB].Surname.toString().toLowerCase();

        if (surnameA === surnameB)
        {
            var firstnameA = db[clientA].Firstname.toString().toLowerCase();
            var firstnameB = db[clientB].Firstname.toString().toLowerCase();
            return (firstnameA < firstnameB) ? -1 : 1;
        }
        else
        {
            return (surnameA < surnameB) ? -1 : 1;
        }
    });

    return arrIndex;
}

