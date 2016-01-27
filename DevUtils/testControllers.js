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

    it('create a new client', function()
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

