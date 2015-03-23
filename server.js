'use strict';

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var extend = require('extend');


app.use('/public', express.static(__dirname + '/public'));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});


var store = {};



io.on('connection', function(socket){
	console.log('a user connected');

	socket.join('schoolId');


	socket.on('data', function(msg, cb) {

		if(msg.method === 'subscribe') {

			var data = store[msg.path] || {};

			return cb(data);

		}


		if(msg.method === 'create') {

			msg.data.id = Date.now();

			store[msg.path] = store[msg.path] || {};

			store[msg.path][msg.data.id] = msg.data;
		}

		if(msg.method === 'update') {

			extend(true, store[msg.path][msg.data.id], msg.data);

			msg.data = store[msg.path][msg.data.id];
		}

		if(msg.method === 'destroy') {
			delete store[msg.path][msg.data.id];
		}

		console.log(msg.data);
		cb(msg.data);

		socket.to('schoolId').emit('data', msg);

	});

});

http.listen(3000, function(){
	console.log('listening on *:3000');
});