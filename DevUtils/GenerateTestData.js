
var faker = require('Faker');

faker.locale = 'en_GB';
faker.seed(2);

console.log(generateTestClient());

function generateTestClient()
{
    

    var retval =
    {
        Title        : faker.name.prefix(),
        Firstname    : faker.name.firstName(),
        Initial      : faker.name.firstName().substr(0,1),
        Surname      : faker.name.lastName(),
        AddressLine1 : faker.address.streetAddress(),
        AddressLine2 : faker.address.streetName(),
        Town         : faker.address.city(),
        Postcode     : faker.helpers.replaceSymbols('??# #??'),
        HomeNumber   : faker.phone.phoneNumber(),
        MobileNumber : faker.phone.phoneNumber(faker.locales.en_GB.cell_phone.formats),
        EmailAddress : faker.internet.email(),
        Notes        : '',
        IsActive     : true
    };

    return retval;
}

