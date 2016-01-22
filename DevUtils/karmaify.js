
var fs = require('fs');
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

var sFilename = __dirname + '/../source/Tier1-UI.html';

// Make sure the directory exists
if (!fs.existsSync('../karmaified'))
{
    fs.mkdir('../karmaified');
}

require('jsdom').env(sFilename, function (errors, window)
{
	if (errors)
	{
		console.log(errors);
		return;
	}

	var $ = require('jquery')(window);

	var sInlineScript = '';

	// Add a script tag for angular-mocks
	$('script').eq(1).append('<script id="mocks"></script>');
	$('#mocks').attr('src', 'https://ajax.googleapis.com/ajax/libs/angularjs/1.4.0/angular-mocks.js');

	$('script').each(function(nIndex, elm)
	{
		var sUrl = $(elm).attr('src');

		if (sUrl)
		{
			var arrPath = sUrl.split('/');
			var sFilename = __dirname + '/../karmaified/' + arrPath[arrPath.length - 1];

			// If the JavaScript file doesn't exist...
			fs.exists(sFilename, function(bExists)
			{
				if (bExists === false)
				{
					console.log('Requesting ' + sFilename);

					// ...request the file...
					var oReq = new XMLHttpRequest();
					oReq.addEventListener('load', function()
					{
						// ...write the file
						console.log('Writing ' + sFilename);
						fs.writeFile(sFilename, this.responseText, function() {});
					});

					oReq.open('GET', sUrl);
					oReq.send();
				}
			});
		}
		else
		{
			// Collect inline scripts
			sInlineScript += $(elm).text();
		}
	});

	// Write inline scripts to app.js
	var sFilename = '../karmaified/app.js';
	console.log('Writing ' + sFilename);
	fs.writeFile(sFilename, sInlineScript, function() {});

});

