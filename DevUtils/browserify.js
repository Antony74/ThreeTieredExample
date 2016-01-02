
var fs = require('fs');

if (!fs.existsSync('../browserified'))
{
    fs.mkdir('../browserified');
}

// Tier 1 just needs an extra <script> tag

var arrLines = fs.readFileSync(__dirname + '/../source/Tier1-UI.html', {encoding: 'utf8'}).split('<script');
arrLines[2] += '<script src="Tier2-Middle.js"></script>\r\n    ';
fs.writeFile(__dirname + '/../browserified/Tier1-UI.html', arrLines.join('<script'), {encoding: 'utf8'});

// Tier 2 needs browserifying
/*
var browserify = require('browserify');
var b = browserify();
b.add(__dirname +'/../source/Tier2-Middle.js');
b.bundle().pipe(fs.createWriteStream(__dirname + '/../browserified/Tier2-Middle.js'));
*/

fs.createReadStream(__dirname + '/../source/Tier2-Middle.js').pipe(fs.createWriteStream(__dirname + '/../browserified/Tier2-Middle.js'));

// Tier 3 just needs copying

fs.createReadStream(__dirname + '/../source/Tier3-DB.json').pipe(fs.createWriteStream(__dirname + '/../browserified/Tier3-DB.json'));
