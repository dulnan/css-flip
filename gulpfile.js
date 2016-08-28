var gulp = require('gulp'),     
    sass = require('gulp-ruby-sass') ,
    notify = require("gulp-notify") ,
    uglify = require('gulp-uglify'),
    htmlmin = require('gulp-htmlmin'),
    cleanCSS = require('gulp-clean-css'),
    closureCompiler = require('gulp-closure-compiler'),
    fs = require('fs'),
    size = require('gulp-size'),
    rename = require('gulp-rename'),
    replace = require('gulp-replace');


// compile sass
gulp.task('sass', ['script'], function () {
    return sass('src/flip-style.scss',{
        compass: true,
        style: 'compressed'
    })
    .pipe(cleanCSS())
    .pipe(rename("flip-style-minified.css"))
    .pipe(gulp.dest('demo'));
});

// closure compiler
gulp.task('script', function() {
  return gulp.src('src/flip-script.js')
    .pipe(closureCompiler({
        compilerPath: 'node_modules/google-closure-compiler/compiler.jar',
        fileName: 'flip-script-minified.js',
        compilerFlags: {
            compilation_level: 'ADVANCED_OPTIMIZATIONS',
            output_wrapper: '(function(){%output%}).call(window);',
            jscomp_off: 'checkVars',
            warning_level: 'VERBOSE'
        }
    }))
    .pipe(gulp.dest('demo'));
});

// build the demo
gulp.task('build', ['sass'], function () {
    return gulp.src('src/flip-markup.html')
        .pipe(replace('%SCRIPT%', fs.readFileSync('demo/flip-script-minified.js', 'utf8')))
        .pipe(replace('%STYLE%', fs.readFileSync('demo/flip-style-minified.css', 'utf8')))
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeTagWhitespace: true
        }))
        .pipe(size({
            title: 'Demo size:',
            pretty: false
        }))
        .pipe(rename("flip.html"))
        .pipe(gulp.dest('demo'));
});


// watch files
gulp.task('watch', function() {
    gulp.watch('src/*.js', ['script', 'build']);
    gulp.watch('src/*.scss', ['sass', 'build']);
    gulp.watch('src/*.html', ['build','sass']);
});


// Default Task
gulp.task('default', ['sass', 'script', 'watch', 'build']);