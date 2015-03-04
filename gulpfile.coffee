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
beautify = require('gulp-jsbeautifier')

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
	.pipe(coffee(bare: true).on('error', util.log))
	.pipe(concat('uberbox.js'))
	.pipe(wrap({ src: 'exports.js.template'}))
	.pipe(header(banner()))
	.pipe(beautify())
	.pipe(gulp.dest('dist'))

	uberboxMin = uberbox.pipe(concat('uberbox.min.js'))
	.pipe(uglify())
	.pipe(header(banner()))
	.pipe(gulp.dest('dist'))

gulp.task 'watch', ['build'], -> gulp.watch('src/*.coffee', ['build'])




