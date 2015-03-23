'use strict';

var bacon = require('baconjs');

module.exports = ['$injector', function($injector) {

	var Store = function() {
		var self = this;

		this.$$downStream = new bacon.Bus();
		this.$$upStream = new bacon.Bus();


		this.$$upStream.onValue(function(e) {

			if(e.request) {

				e.request.resolve( self._adapter.request(e.payload) );

			}

		});


		this.$$collections = {};
	};

	var proto = Store.prototype;

	proto.useAdapter = function(methods) {
		var self = this;

		this._adapter = methods;

		if(methods.notifier) {
			methods.notifier(function send(payload) {
				self.$$downStream.push(payload);
			});
		}

	};

	proto.collection = function(path) {

		var createCollection = $injector.invoke( require('./Collection.js') );


		if(!path || path === null || !angular.isString(path)) {
			throw new Error('Collection path has to be a string like \'/collectionName\'');
		}

		if(path in this.$$collections) {
			return this.$$collections[path];
		}

		var collection = createCollection(this, path, this.$$downStream, this.$$upStream);

		this.$$collections[path] = collection;

		return collection;

	};

	return Store;

}];
