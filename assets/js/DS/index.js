'use strict';

var app = module.exports = angular.module('RDS', []);


app.provider('RDS', [function() {

	var config = {};


	this.$get = ['$injector', function($injector) {

		return {
			createStore: function(config) {
				var Store = $injector.invoke( require('./lib/Store.js') );


				var store = new Store();

				return store;
			}
		};


	}];

}]);
