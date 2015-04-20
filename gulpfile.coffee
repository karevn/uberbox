pkg			= require('./package.json')
argv		= require('minimist')(process.argv.slice(2))

gulp		= require('gulp')
util		= require('gulp-util')
coffee		= require('gulp-coffee')
header		= require('gulp-header')
concat		= require('gulp-concat')
uglify		= require('gulp-uglify')
watch		= require('gulp-watch')
wrap		= require('gulp-wrap')
sourcemaps	= require('gulp-sourcemaps')
beautify 	= require('gulp-jsbeautifier')
sass 		= require 'gulp-sass'
autoprefixer= require 'gulp-autoprefixer'
beautifyCSS = require 'gulp-cssbeautify'
minifyCSS	= require('gulp-minify-css')
gutil		= require('gulp-util')
rename		= require('gulp-rename')
fs			= require('fs')
templateCompile = require('gulp-template-compile')
merge = require('gulp-merge')

banner = ()-> [
	'// Uberbox.js',
	'// version: ' + pkg.version,
	'// author: ' + pkg.author,
	'// license: ' + pkg.licenses[0].type
	].join('\n') + '\n'

sources = [
	'uberbox',
	'utils',
	'models',
	'sliding_window_item',
	'sliding_window',
	'carousel',
	'toolbar',
	'item_views',
	'lightbox'
].map((file)-> "src/#{file}.coffee")

handleError = (error)->
	util.log
	@emit 'end'
	
gulp.task 'jst', ->
	gulp.src('./templates/*.html')
	.pipe(templateCompile(name: ((name)-> name.relative.replace('.html', '')), namespace: 'Uberbox.Templates'))
	.pipe(concat('templates.js'))
	.pipe(gulp.dest('./dist'))
	
gulp.task 'js', ['jst'], ->
	sourcesStream = gulp.src(sources)
	.pipe(coffee(bare: true).on('error', (-> gutil.log(arguments); @emit('end'))))
	.pipe(concat('uberbox.js'))
	
	sourcesStream.pipe(wrap({ src: 'exports.js.template'}))
	.pipe(header(banner()))
	.pipe(beautify())
	.pipe(gulp.dest('dist')).on('error', handleError)
	
gulp.task 'jsmin', ['js'], ->
	gulp.src(['./dist/templates.js', './dist/uberbox.js'])
	.pipe(concat('uberbox.min.js'))
	.pipe(uglify())
	.pipe(gulp.dest('dist'))
gulp.task 'css', ->
	css = gulp.src('./uberbox.sass')
	.pipe(sourcemaps.init())
	.pipe(sass(indentedSyntax: true, errLogToConsole: true).on('error', -> @emit('end')))
	.pipe(autoprefixer('last 2 version', 'safari 5', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
	css = css.pipe(beautifyCSS())
	.pipe(sourcemaps.write("."))
	.pipe(gulp.dest('dist')).on('error', handleError)
	css.pipe(minifyCSS())
	.pipe(rename('uberbox.min.css'))
	.pipe(sourcemaps.write("."))
	.pipe(gulp.dest('dist')).on('error', handleError)
	
gulp.task 'build', ['js', 'css']
gulp.task 'watch', -> 
	gulp.watch(['src/*.coffee', 'templates/*.html', 'exports.js.template'], ['js'])
	gulp.watch(['*.sass', 'sass/*.sass'], ['css'])
gulp.task 'default', ['build', 'watch']




