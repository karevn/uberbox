pkg    = require('./package.json')
argv   = require('minimist')(process.argv.slice(2))

gulp   = require('gulp')
util   = require('gulp-util')
coffee = require('gulp-coffee')
header = require('gulp-header')
concat = require('gulp-concat')
uglify = require('gulp-uglify')
watch  = require('gulp-watch')
wrap   = require('gulp-wrap')
sourcemaps = require('gulp-sourcemaps')

fs = require('fs')

banner = ()->
	[
			'// Uberbox.js',
			'// version: ' + pkg.version,
			'// author: ' + pkg.author,
			'// license: ' + pkg.licenses[0].type
	].join('\n') + '\n'

sources = [
	'uberbox',
	'models',
	'sliding_window_item',
	'sliding_window',
	'carousel',
	'lightbox'
].map((file)-> "src/#{file}.coffee")

gulp.task 'build', ->
	uberbox = gulp.src(sources)
	.pipe(concat('uberbox.js'))
	.pipe(coffee(bare: true).on('error', util.log))
	.pipe(wrap({ src: 'exports.js'}))
	.pipe(header(banner()))
	.pipe(gulp.dest('dist'))

	uberboxMin = uberbox.pipe(concat('uberbox.min.js'))
	.pipe(uglify())
	.pipe(header(banner()))
	.pipe(gulp.dest('dist'))

gulp.task 'watch', ['build'], -> gulp.watch('src/*.coffee', ['build'])




