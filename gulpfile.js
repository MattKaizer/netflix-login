// Initialize modules
// Importing specific gulp API functions lets us write them below as series() instead of gulp.series()
const { src, dest, watch, series, parallel } = require('gulp');
// Importing all the Gulp-related packages we want to use
const sass = require('gulp-sass');
const uglify = require('gulp-uglifyes');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');
const plumber = require('gulp-plumber');
const imagemin = require('gulp-imagemin');
const browserSync = require('browser-sync').create();
const notify = require( 'gulp-notify' ); // Sends message notification to you.
const filter = require( 'gulp-filter' ); // Enables you to work on a subset of the original files by filtering them using a glob.


// File paths
const files = { 
    scssPath: './scss/**/*.scss',
    jsPath: './js/custom/**/*.js',
    imgPath: './orig/*.{png,jpg,svg,ico}',
    htmlPath: './index.html',
    cssPath: './dist/css/**/*.css'
}

function htmlTask() {
    return src(files.htmlPath)
    .pipe(dest('./dist/'));
}

//Compressing images
function images() {
    return src(files.imgPath)
      .pipe(imagemin())
      .pipe(dest('./dist/images'))
      .pipe( notify({ message: '\n\n✅  ===> IMAGES — completed!\n', onLast: true }) );
  };

function scssTask() {
    return src(files.scssPath)
        .pipe(sourcemaps.init()) // initialize sourcemaps first
        .pipe(plumber())
        .pipe(sass()) // nested, compact, expanded, compressed
        .pipe(postcss([ autoprefixer(), cssnano() ])) // PostCSS plugins
        .pipe(rename('style.min.css'))
        .pipe(sourcemaps.write('.')) // write sourcemaps file in current directory
        .pipe( dest('./dist/css'))
        .pipe( notify({ message: '\n\n✅  ===> STYLES — completed!\n', onLast: true }) );
}

// JS task: concatenates and uglifies JS files to script.js
function jsTask(){
    return src([
        files.jsPath
        //,'!' + 'includes/js/jquery.min.js', // to exclude any specific files
        ])
        .pipe(uglify({ 
            mangle: false, 
            ecma: 6 
         }))
        .pipe(rename('scripts.min.js'))
        .pipe(dest('./dist/js'))
        .pipe( notify({ message: '\n\n✅  ===> STYLES — completed!\n', onLast: true }));

}

//Function serve
const serve = () => {
    browserSync.init({
        server: './dist/',
            files: [files.scssPath, files.jsPath, files.imgPath, files.htmlPath, files.cssPath],
            watch: true,
            watchOptions: {
                awaitWriteFinish : true
            }
    });
};


// Helper function to allow browser reload with Gulp 4.
const reload = done => {
    browserSync.reload();
    done();
};

// Watch task: watch SCSS , images, html and JS files for changes
// If any change, run scss and js tasks simultaneously
function watchTask(){
    watch([files.scssPath, files.jsPath, files.htmlPath, files.imgPath], series(htmlTask, parallel(scssTask, jsTask, images), reload)
    ); 
}


// Export the default Gulp task so it can be run
// Runs the scss, images and js tasks simultaneously, serve and watch mus be in parallel to brosersync to work

exports.scssTask = scssTask;
exports.jsTask = jsTask;
exports.images = images;
exports.watchTask = watchTask;
exports.default = series(htmlTask, parallel(scssTask, jsTask, images), parallel(serve, watchTask));