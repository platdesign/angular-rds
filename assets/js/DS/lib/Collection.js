'use strict';

var bacon = require('baconjs');

module.exports = ['$rootScope', '$q', function($rootScope, $q) {

	function createCollection(store, path, down, up) {

		var collection = [];

		collection.$$downStream = down.filter(function(e) {
			return e.path === path;
		});

		collection.$$upStream = new bacon.Bus();

		up.plug(collection.$$upStream);

		collection.$$downStream.onValue(function(e) {

			var attrs = e.data;

			if(e.method === 'create' || e.method === 'update') {
				$rootScope.$apply(function() {
					collection._addAsModelOrMerge(e.data);
				});
			}

			if(e.method === 'destroy') {
				$rootScope.$apply(function() {
					var model = collection.filter(function(item) {
						return e.data.id === item.id;
					})[0];

					if(model) {
						collection.removeModel(model);
					}
				})
			}

		});


		collection._push = collection.push;
		collection.push = function(item) {

			if(!item || item === null || !angular.isObject(item)) {
				throw new Error('Can only push objects to collection \''+path+'\'');
			}

			var model = this._addAsModelOrMerge(item);
			return model;
		};





		collection._addAsModelOrMerge = function(attrs) {

			var id = attrs.id;

			var existing = this.filter(function(item) {
				return item.id && item.id === attrs.id;
			})[0];

			if( existing ) {
				angular.extend(existing, attrs);
				return existing;
			} else {
				var model = this._createModel(attrs);
				this._push(model);
				return model;
			}

		};




		collection._createModel = function(attrs) {
			attrs = attrs || {};
			var model = new Model(attrs, this);

			return model;
		};



		collection._request = function(method, data) {
			data = data || {};

			var defer = $q.defer();

			this.$$upStream.push({
				request: defer,
				payload: {
					method: method,
					path: path,
					data: data
				}
			});

			return defer.promise;
		};

		collection.subscribe = function() {
			this._request('subscribe').then(function(data) {

				Object.keys(data).forEach(function(key) {
					collection._addAsModelOrMerge(data[key]);
				});

			});
		};



		collection.create = function(attrs) {

			var model = this._createModel(attrs);

			this._push(model);

			return this._request('create', model)
			.then(function(res) {
				angular.extend(model, res);
			});

		};

		collection.saveModel = function(model) {
			var self = this;

			return this._request(model.id ? 'update' : 'create', model)
			.then(function(res) {
				self._addAsModelOrMerge(res);
				return model;
			});

		};

		collection.removeModel = function(model) {
			var index = this.indexOf(model);

			if(index > -1) {
				this.splice(index, 1);
			}
		};

		collection.destroyModel = function(model) {

			this.removeModel(model);

			return this._request('destroy', model);
		};


		return collection;
	}


	var Model = function(attrs, collection) {
		attrs = attrs || {};

		this.$$collection = collection;
		angular.extend(this, attrs);
	};

	var proto = Model.prototype;

	proto.save = function() {
		return this.$$collection.saveModel(this);
	};

	proto.destroy = function() {
		return this.$$collection.destroyModel(this);
	};



	return createCollection;


}];
