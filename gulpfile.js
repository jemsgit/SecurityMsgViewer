'use strict'

var gulp = require('gulp');
var inject = require('gulp-inject');
var minify = require('gulp-minify');
var cleanCSS = require('gulp-clean-css');
var clean = require('gulp-clean');
var fs = require('fs');

gulp.task('clean', function(){
  if (!fs.existsSync('publishBuild')){
    fs.mkdirSync('publishBuild');
  }

  if (!fs.existsSync('devBuild')){
    fs.mkdirSync('devBuild');
  }
  gulp.src('devBuild', {read: false})
        .pipe(clean());

  return gulp.src('publishBuild', {read: false})
        .pipe(clean());
})

gulp.task('compress-js', function(){
	return gulp.src('scripts/*.js')
    .pipe(minify({
        ext:{
            min:'-min.js'
        },
        ignoreFiles: ['-min.js']
    }))
    .pipe(gulp.dest('publishBuild/scripts'))
})

gulp.task('compress-css', function() {
  return gulp.src('styles/*.css')
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest('publishBuild/styles'));
});

gulp.task('inject-min-links', function () {
  var target = gulp.src('./popup.html');
  // It's not necessary to read the files (will speed up things), we're only after their paths: 
  var sources = gulp.src(['publishBuild/scripts/popup-min.js', 'publishBuild/styles/*.css'], {read: false});
 
  return target.pipe(inject(sources))
    .pipe(gulp.dest('publishBuild/'));
});

gulp.task('inject-links', function () {
  var target = gulp.src('./popup.html');
  var sources = gulp.src(['./scripts/popup.js', './styles/popupStyles.css'], {read: false});
 
  return target.pipe(inject(sources))
    .pipe(gulp.dest('./'));
});

gulp.task('copy-publish-files', function(){
  return gulp.src(['_locales/**/*', 'icons/**/*', 'images/**/*', 'popup.html', 'manifest.json'], {
            base: './'
        })
          .pipe(gulp.dest('publishBuild/'))
})

gulp.task('copy-dev-files', function(){
  return gulp.src(['_locales/**/*', 'icons/**/*', 'images/**/*', 'scripts/**/*', 'styles/**/*', 'popup.html', 'manifest.json'], {
            base: './'
        })
          .pipe(gulp.dest('devBuild/'))
})

gulp.task('build-publish', gulp.series('clean', 'compress-js', 'compress-css', 'inject-min-links','copy-publish-files'))

gulp.task('build-dev', gulp.series('clean', 'inject-links', 'copy-dev-files'))