'use strict';


var http = require('http');
var sockjs = require('sockjs');

var echo = sockjs.createServer({ sockjs_url: 'http://cdn.jsdelivr.net/sockjs/0.3.4/sockjs.min.js' });

echo.on('connection', function(conn) {

	console.log(echo)

    conn.on('data', function(message) {
    	console.log(message);

    });
    conn.on('close', function() {});
});

var server = http.createServer();

echo.installHandlers(server, {prefix:'/backend'});

server.listen(4000, '0.0.0.0');
