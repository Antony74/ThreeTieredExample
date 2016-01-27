module.exports = function(config) {
  config.set({
    basePath: '../karmaified',
    frameworks: ['mocha', 'chai'],
    files: [
		'angular.js',
		'angular-route.js',
		'angular-mocks.js',
		'app.js',
		'../devutils/testControllers.js'
    ],
    port: 8080,
    browsers: ['Chrome'],
    singleRun: true
  });
};

