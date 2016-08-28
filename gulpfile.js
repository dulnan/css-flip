var gulp = require('gulp'),     
    sass = require('gulp-ruby-sass') ,
    notify = require("gulp-notify") ,
    uglify = require('gulp-uglify'),
    htmlmin = require('gulp-htmlmin'),
    packer = require('gulp-packer'),
    streamify = require('gulp-streamify'),
    cleanCSS = require('gulp-clean-css'),
    closureCompiler = require('gulp-closure-compiler'),
    fs = require('fs'),
    size = require('gulp-size'),
    rename = require('gulp-rename'),
    replace = require('gulp-replace');



// compile sass
gulp.task('sass', function () {
    return sass('src/flip-style.scss',{
        compass: true,
        style: 'compressed'
    })
    .pipe(cleanCSS())
    .pipe(rename("flip-style-minified.css"))
    .pipe(gulp.dest('demo'));
});

// closure compiler
gulp.task('script', ['sass'], function() {
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

gulp.task('injectstyle', ['script'], function() {
  return gulp.src('demo/flip-script-minified.js')
    .pipe(replace('%STYLE%', fs.readFileSync('demo/flip-style-minified.css', 'utf8')))
    .pipe(rename("flip-script-minified-with-inject.js"))
    .pipe(gulp.dest('demo'));
});

gulp.task('packscript', ['injectstyle'], function() {
  return gulp.src('demo/flip-script-minified-with-inject.js')
    .pipe(streamify(packer({base62: true, shrink: true})))
    .pipe(rename("flip-script-packed.js"))
    .pipe(gulp.dest('demo'));
});

// build the demo
gulp.task('build', ['packscript'], function () {
    return gulp.src('src/flip-markup.html')
        .pipe(replace('%SCRIPT%', fs.readFileSync('demo/flip-script-packed.js', 'utf8')))
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeTagWhitespace: true,
            removeAttributeQuotes: true
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