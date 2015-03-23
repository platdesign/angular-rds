'use strict';

var $ = require('jquery');

var bacon = require('baconjs');

var angular = require('angular');
var extend = require('extend');


var RDS = require('./DS');

var app = angular.module('app', [RDS.name]);



var socket = require('socket.io-client')('http://localhost:3000');




app.factory('backend', ['$q', 'RDS', function($q, RDS){
	var backend = RDS.createStore();



	backend.useAdapter({

		request: function(payload) {
			var body = payload.data;

			var defer = $q.defer();

			socket.emit('data', JSON.parse(angular.toJson(payload)), function(res) {
				defer.resolve(res);
			});

			return defer.promise;
		},

		notify: function(payload) {

		},

		notifier: function(send) {

			socket.on('data', function(message) {
				console.log(message)
				send(message);
			});

/*			setInterval(function() {

				send({
					path: '/projects',
					method: 'update',
					data: {
						id: 123,
						name: Math.random().toString(36).substring(7)
					}
				});

			}, 1500);
*/
		}

	});



	return backend;
}]);


app.run(['$rootScope', 'backend', function($scope, backend) {

	$scope.items = backend.collection('/projects');

	$scope.items.subscribe();


	$scope.bItems = backend.collection('/projects');

}]);



angular.bootstrap($('body'), [app.name]);

