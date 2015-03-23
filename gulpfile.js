'use strict';

var gulp = require('gulp');



// Load js generator
var js = require('pd-gulp-js')(gulp);

js.register({
	assets: {
		src: './assets/js/*.js',
		dest: './public/js'
	}
});



