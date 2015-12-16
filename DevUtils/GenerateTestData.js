
var faker = require('Faker');
var fs = require('fs');

faker.locale = 'en_GB';
faker.seed(1);

var data = {};
for (var n = 1; n <= 100; ++n)
{
    data[n] = generateTestClient();
}

fs.writeFileSync(__dirname + '/../source/Tier3-DB.json', JSON.stringify(data, null, 4));

console.log('Done');

//
// generateTestClient
//
function generateTestClient()
{
    var nGender = faker.random.number(1);
    var sTitle = faker.random.arrayElement(nGender ? ['Mr.', 'Mr.','Mr.', 'Dr.'] : ['Ms.', 'Miss.', 'Mrs.', 'Dr.']);
    var sFirstName = faker.name.firstName(nGender);
    var sLastName = faker.name.lastName(nGender);

    var retval =
    {
        Title        : sTitle,
        Firstname    : sFirstName,
        Initial      : faker.name.firstName().substr(0,1),
        Surname      : sLastName,
        AddressLine1 : faker.address.streetAddress(),
        AddressLine2 : faker.address.streetName(),
        Town         : faker.address.city(),
        Postcode     : faker.helpers.replaceSymbols('??# #??'),
        HomeNumber   : faker.phone.phoneNumber(),
        MobileNumber : faker.phone.phoneNumber(faker.random.arrayElement(faker.locales.en_GB.cell_phone.formats)), // jshint ignore:line
        EmailAddress : faker.internet.email(sFirstName, sLastName),
        Notes        : faker.lorem.sentence(),
        IsActive     : true
    };

    return retval;
}

