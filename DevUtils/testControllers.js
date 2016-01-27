/*jslint mocha: true */
/*global inject*/
/*global assert*/

beforeEach(module('myApp'));

describe('Clients controller', function()
{
	var ctrl, mockBackend;

	beforeEach(inject(function($controller, $httpBackend)
	{
		mockBackend = $httpBackend;
		ctrl = $controller('ClientsController');
		mockBackend.expectGET('/api/v1/Clients/pages/1/').respond(200,
		[
			{
				'Title': 'Dr.',
				'Firstname': 'Edison',
				'Surname': 'Bartell',
			}
		]);
	}));

	it('does nothing yet', function()
	{
		assert.ok(ctrl);

		// Initially, before the server responds, the model should be empty

		// Simulate a server response
		mockBackend.flush();
	});

	afterEach(function()
	{
		mockBackend.verifyNoOutstandingExpectation();
		mockBackend.verifyNoOutstandingRequest();
	});
});

