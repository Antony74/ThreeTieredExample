/*jslint mocha: true */

var assert = require('assert');
var superagent = require('superagent');
var status = require('http-status');

require('../source/Tier2-Middle.js');

describe('Client CRUD tests', function()
{
    it('can create', function(done)
    {
        superagent.post('http://localhost:8080/api/v1/clients').send(
        {
            'Title': 'Dr.',
            'Firstname': 'Edison',
            'Surname': 'Bartell',
        }).end(function(error, res)
        {
            if (error)
            {
                return done(error);
            }

            assert.equal(res.status, status.OK);

            var result;

            assert.doesNotThrow(function()
            {
                result = JSON.parse(res.text);
            });

            assert.deepEqual(result, {id:101});

            done();
        });
    });

    it('can read', function(done)
    {
        superagent.get('http://localhost:8080/api/v1/clients/101').send().end(function(error, res)
        {
            if (error)
            {
                return done(error);
            }

            assert.equal(res.status, status.OK);

            var result;

            assert.doesNotThrow(function()
            {
                result = JSON.parse(res.text);
            });

            assert.deepEqual(result.data,
            {
                'Title': 'Dr.',
                'Firstname': 'Edison',
                'Surname': 'Bartell',
            });

            done();
        });
    });

    it('can update', function(done)
    {
        superagent.put('http://localhost:8080/api/v1/clients/101').send(
        {
            'Title': 'Dr.',
            'Firstname': 'Freddy',
            'Surname': 'Bartell',
        }).end(function(error, res)
        {
            if (error)
            {
                return done(error);
            }

            assert.equal(res.status, status.OK);

            superagent.get('http://localhost:8080/api/v1/clients/101').send().end(function(error, res)
            {
                if (error)
                {
                    return done(error);
                }

                assert.equal(res.status, status.OK);

                var result;
                assert.doesNotThrow(function()
                {
                    result = JSON.parse(res.text);
                });

                assert.deepEqual(result.data,
                {
                    'Title': 'Dr.',
                    'Firstname': 'Freddy',
                    'Surname': 'Bartell',
                });

                done();
            });

        });
    });

    it('can delete', function(done)
    {
        superagent.delete('http://localhost:8080/api/v1/clients/101').send().end(function(error, res)
        {
            if (error)
            {
                return done(error);
            }

            assert.equal(res.status, status.OK);

            superagent.get('http://localhost:8080/api/v1/clients/101').send().end(function(error, res)
            {
                assert.equal(res.status, status.NOT_FOUND);
                done();
            });
        });
    });

});

