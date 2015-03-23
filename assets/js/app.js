'use strict';

var $ = require('jquery');

var bacon = require('baconjs');

var angular = require('angular');
var extend = require('extend');


var RDS = require('./DS');

var app = angular.module('app', [RDS.name]);


var sockjs = require('sockjs-client');


app.factory('backend', ['$q', 'RDS', function($q, RDS){
	var backend = RDS.createStore();

	var socket = sockjs('http://localhost:4000/backend');




	backend.useAdapter({

		request: function(payload) {
			var body = payload.data;

			socket.send(angular.toJson(payload));

			return $q.when({
				id: body.id || Date.now(),
				name: body.name
			});
		},

		notify: function(payload) {

		},

		notifier: function(send) {

			socket.onmessage = function(message) {
				send(JSON.parse(message.data));
			};

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
	$scope.bItems = backend.collection('/projects');

}]);



angular.bootstrap($('body'), [app.name]);

