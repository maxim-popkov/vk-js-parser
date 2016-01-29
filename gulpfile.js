// get the dependencies
var gulp         = require('gulp');
var jetpack      = require('fs-jetpack');
var usemin       = require('gulp-usemin');
var uglify       = require('gulp-uglify');

var projectDir = jetpack;
var srcDir     = projectDir.cwd('./app');
var destDir    = projectDir.cwd('./build');

// Tasks

gulp.task('clean', function (callback) {
    return destDir.dirAsync('.', { empty: true });
});

gulp.task('copy', ['clean'], function () {
    return projectDir.copyAsync('app', destDir.path(), {
        overwrite: true, matching: [
            '*.html',
            '*.css',
            '*.svg',
            'main.js',
            'package.json',
            '!./node_modules/**/*',
            '!./bower_components/**/*'
       ]
    });
});

gulp.task('build', ['copy'], function () {
  return gulp.src('./app/index.html')
    .pipe(usemin({
      js: [uglify()]
    }))
    .pipe(gulp.dest('build/'));
});
