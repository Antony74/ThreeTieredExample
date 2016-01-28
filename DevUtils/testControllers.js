/*jslint mocha: true */
/*global inject*/
/*global assert*/

beforeEach(module('myApp'));

describe('Clients controller', function()
{
	var ctrl, mockBackend, location;

	beforeEach(inject(function($controller, $httpBackend, $location)
	{
		mockBackend = $httpBackend;
		ctrl = $controller('ClientsController');
        location = $location;
		mockBackend.expectGET('/api/v1/Clients/pages/1/').respond(200,
		{
            data:
            [
			    {
				    'Title': 'Dr.',
				    'Firstname': 'Edison',
				    'Surname': 'Bartell',
			    },
                {
                    'Title': 'Miss.',
                    'Firstname': 'Luther',
                    'Surname': 'Dickens'
                }
            ],
            links:
            [
                {'rel':'First'},
                {'rel':'Previous'},
                {'rel':'Next', 'pageNumber' : 2},
                {'rel':'Last', 'pageNumber' : 4},
            ]
		});
	}));

	it('populates page 1', function()
	{
		assert.ok(ctrl);

		// Initially, before the server responds, the model should be empty
        assert.equal(ctrl.clients, undefined);
        assert.equal(ctrl.links, undefined);
        assert.equal(ctrl.filter, '');

		// Simulate a server response
		mockBackend.flush();

        // Now check the model has been populated as expected for page 1
        assert.deepEqual(ctrl.clients,
        [
			{
				'Title': 'Dr.',
				'Firstname': 'Edison',
				'Surname': 'Bartell',
			},
            {
                'Title': 'Miss.',
                'Firstname': 'Luther',
                'Surname': 'Dickens'
            }
        ]);

        assert.deepEqual(ctrl.links,
        [
            {'rel':'First'},
            {'rel':'Previous'},
            {'rel':'Next', 'pageNumber' : 2},
            {'rel':'Last', 'pageNumber' : 4},
        ]);
        
	});

    it('can filter', function()
    {
		mockBackend.flush();
        ctrl.filter = 'Edison';
        ctrl.filterChanged();

		mockBackend.expectGET('/api/v1/Clients/pages/1/Edison').respond(200,
		{
            data:
            [
			    {
				    'Title': 'Dr.',
				    'Firstname': 'Edison',
				    'Surname': 'Bartell',
			    }
            ],
            links:
            [
                {'rel':'First'},
                {'rel':'Previous'},
                {'rel':'Next'},
                {'rel':'Last'},
            ]
        });

		// Simulate a server response
		mockBackend.flush();

        // Now check the model has been populated as expected for page 1
        assert.deepEqual(ctrl.clients,
        [
			{
				'Title': 'Dr.',
				'Firstname': 'Edison',
				'Surname': 'Bartell',
			}
        ]);

        assert.deepEqual(ctrl.links,
        [
            {'rel':'First'},
            {'rel':'Previous'},
            {'rel':'Next'},
            {'rel':'Last'},
        ]);
    });

    it('can go to a client', function()
    {
        assert.equal(location.path(), '');

		mockBackend.flush();
        ctrl.gotoClient(2);

        assert.equal(location.path(), '/client/2');
    });

    it('can create a new client', function()
    {
        assert.equal(location.path(), '');

		mockBackend.flush();
        ctrl.createNew();

        assert.equal(location.path(), '/client/');
    });

	afterEach(function()
	{
		mockBackend.verifyNoOutstandingExpectation();
		mockBackend.verifyNoOutstandingRequest();
	});
});

describe('Client controller - existing client', function()
{
	var ctrl, mockBackend, location;

	beforeEach(inject(function($controller, $httpBackend, $location, $routeParams)
	{
		mockBackend = $httpBackend;
        location = $location;
		$routeParams.clientId = 1;
		$routeParams.filter = '';
		ctrl = $controller('ClientController');

		mockBackend.expectGET('/api/v1/Clients/1').respond(200,
		{
			'data':
			{
				'Title': 'Dr.',
				'Firstname': 'Edison',
				'Surname': 'Bartell'
			}
		});
	}));

	it('populates', function()
	{
	    assert.equal(ctrl.client, undefined);

		mockBackend.flush();

		assert.deepEqual(ctrl.client,
		{
			'Title': 'Dr.',
			'Firstname': 'Edison',
			'Surname': 'Bartell',
		});
	});

	it('OKs (applies and closes)', function()
	{
		mockBackend.flush();

		ctrl.client = 
		{
			'Title': 'Mr.',
			'Firstname': 'Eddy',
			'Surname': 'Barnes',
		};

		ctrl.apply(true);

		mockBackend.expectPUT('/api/v1/Clients/1', 
		{
			'Title': 'Mr.',
			'Firstname': 'Eddy',
			'Surname': 'Barnes',
		}).respond(200);

		mockBackend.flush();

		assert.equal(location.path(), '/1/');
	});

	it('deletes', function()
	{
		mockBackend.flush();
		ctrl.delete();

		mockBackend.expectDELETE('/api/v1/Clients/1').respond(200);

		mockBackend.flush();

		assert.equal(location.path(), '/1/');
	})

	afterEach(function()
	{
		mockBackend.verifyNoOutstandingExpectation();
		mockBackend.verifyNoOutstandingRequest();
	});

});

describe('Client controller - new client', function()
{
	var ctrl, mockBackend, location;

	beforeEach(inject(function($controller, $httpBackend, $location, $routeParams)
	{
		mockBackend = $httpBackend;
        location = $location;
		$routeParams.filter = '';
		ctrl = $controller('ClientController');
	}));

	it('populates (blank)', function()
	{
		assert.deepEqual(ctrl.client,
		{
			'Title': '',
			'Firstname': '',
			'Initial': '',
			'Surname': '',
			'AddressLine1': '',
			'AddressLine2': '',
			'Town': '',
			'Postcode': '',
			'HomeNumber': '',
			'MobileNumber': '',
			'EmailAddress': '',
			'Notes': '',
			'IsActive': true
		});
	});

	it('OKs (applies and closes)', function()
	{
		ctrl.client = 
		{
			'Title': 'Mr.',
			'Firstname': 'Eddy',
			'Surname': 'Barnes',
		};

		ctrl.apply(true);

		mockBackend.expectPOST('/api/v1/Clients/',
		{
			'Title': 'Mr.',
			'Firstname': 'Eddy',
			'Surname': 'Barnes',
		}).respond(200, {id: 66});

		mockBackend.flush();

		assert.equal(location.path(), '/1/');
	});

	it('deletes/discards', function()
	{
		ctrl.delete();

		assert.equal(location.path(), '/1/');
	})

	afterEach(function()
	{
		mockBackend.verifyNoOutstandingExpectation();
		mockBackend.verifyNoOutstandingRequest();
	});

});
