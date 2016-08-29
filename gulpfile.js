var gulp = require('gulp'),     
    sass = require('gulp-ruby-sass') ,
    htmlmin = require('gulp-htmlmin'),
    packer = require('gulp-packer'),
    streamify = require('gulp-streamify'),
    cleanCSS = require('gulp-clean-css'),
    closureCompiler = require('gulp-closure-compiler'),
    fs = require('fs'),
    gutil = require('gulp-util'),
    rename = require('gulp-rename'),
    replace = require('gulp-replace');

var sizeCSS, sizeJSCompiled, sizeJSInjected, sizeJSPacked, sizeTotal;

// compile sass
gulp.task('sass', function () {
    return sass('src/flip-style.scss')
    .pipe(cleanCSS({
        aggressiveMerging: true,
        advanced: true,
        semanticMerging: true
    }))
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
    // .pipe(replace('%STYLE%', fs.readFileSync('demo/flip-style-minified.css', 'utf8')))
    .pipe(rename("flip-script-minified-with-inject.js"))
    .pipe(gulp.dest('demo'));
});

gulp.task('packscript', ['injectstyle'], function() {
  return gulp.src('demo/flip-script-minified-with-inject.js')
    // .pipe(streamify(packer({base62: true, shrink: true})))
    .pipe(rename("flip-script-packed.js"))
    .pipe(gulp.dest('demo'));
});


// build the demo
gulp.task('build', ['packscript'], function () {
    return gulp.src('src/flip-markup.html')
        .pipe(replace('%SCRIPT%', fs.readFileSync('demo/flip-script-packed.js', 'utf8')))
        .pipe(replace('%STYLE%', fs.readFileSync('demo/flip-style-minified.css', 'utf8')))
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeTagWhitespace: true,
            removeAttributeQuotes: true
        }))
        .pipe(replace('</style>', ''))
        .pipe(rename("flip.html"))
        .pipe(gulp.dest('demo'));
});

gulp.task('getfilesize', ['build'], function () {

    fs.stat('demo/flip-style-minified.css', function(err, stat) {
        sizeCSS = stat.size;
    });

    fs.stat('demo/flip-script-minified.js', function(err, stat) {
        sizeJSCompiled = stat.size;
    });

    fs.stat('demo/flip-script-minified-with-inject.js', function(err, stat) {
        sizeJSInjected = stat.size;
    });

    fs.stat('demo/flip-script-packed.js', function(err, stat) {
        sizeJSPacked = stat.size;
    });

    fs.stat('demo/flip.html', function(err, stat) {
        sizeTotal = stat.size;
    });

});

gulp.task('writelog', ['getfilesize'], function () {
    
    // debate me
    setTimeout(function() {
        gutil.log('CSS:             ' + sizeCSS + ' b');
        gutil.log('JS Compiled:    '  + sizeJSCompiled + ' b');
        gutil.log('JS Injected:    '  + sizeJSInjected + ' b');
        gutil.log('JS Packed:      '  + sizeJSPacked + ' b');
        gutil.log('----------------------');
        gutil.log('Total:          '  + sizeTotal + ' b');
        gutil.log('----------------------');
    }, 100);
});

// watch files
gulp.task('watch', function() {
    gulp.watch('src/*.js',   ['writelog']);
    gulp.watch('src/*.scss', ['writelog']);
    gulp.watch('src/*.html', ['writelog']);
});


// Default Task
gulp.task('default', ['sass', 'script', 'watch', 'writelog']);