const gulp = require('gulp');
const sass = require('gulp-sass');
const browserSync = require('browser-sync');
const reload = browserSync.reload;
const autoprefixer = require('gulp-autoprefixer');
const browserify = require('gulp-browserify');
const clean = require('gulp-clean');
const concat = require('gulp-concat');
const merge = require('merge-stream');
const newer = require('gulp-newer');
const imagemin = require('gulp-imagemin');
const injectPartials = require('gulp-inject-partials');

const SOURCEPATHS = {
  sassSource: 'src/scss/*.scss',
  htmlSource: 'src/*.html',
  htmlPartialSource: 'src/partial/*.html',
  jsSource: 'src/js/**',
  imgSource: 'src/img/**'
}
const APPPATH = {
  root: 'app/',
  css: 'app/css',
  js: 'app/js',
  fonts: 'app/fonts',
  img: 'app/img'
}

gulp.task('clean-html', function(){
  return gulp.src(`${APPPATH.root}/*.html`, { read: false, force: true })
    .pipe(clean());
});

gulp.task('clean-scripts', function(){
  return gulp.src(`${APPPATH.js}/*.js`, { read: false, force: true })
    .pipe(clean());
});

gulp.task('sass', function(){
  var bootstrapCSS = gulp.src('./node_modules/bootstrap/dist/css/bootstrap.css');
  var sassFiles;

  sassFiles = gulp.src(SOURCEPATHS.sassSource)
    .pipe(autoprefixer())
    .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError));

    return merge(sassFiles, bootstrapCSS)
      .pipe(concat('app.css'))
      .pipe(gulp.dest(APPPATH.css));
});

gulp.task('images', function() {
  return gulp.src(SOURCEPATHS.imgSource)
    .pipe(newer(APPPATH.img))
    .pipe(imagemin())
    .pipe(gulp.dest(APPPATH.img));
});

gulp.task('moveFonts', function() {
  gulp.src('./node_modules/bootstrap/dist/fonts/*.{eot,svg,ttf,woff,woff2}')
    .pipe(gulp.dest(APPPATH.fonts));
});

gulp.task('scripts', ['clean-scripts'], function() {
  gulp.src(SOURCEPATHS.jsSource)
    .pipe(concat('main.js'))
    .pipe(browserify())
    .pipe(gulp.dest(APPPATH.js))
});

gulp.task('html', function() {
  return gulp.src(SOURCEPATHS.htmlSource)
    .pipe(injectPartials())
    .pipe(gulp.dest(APPPATH.root))
});
/*
gulp.task('copy', ['clean-html'], function(){
  gulp.src(SOURCEPATHS.htmlSource)
    .pipe(gulp.dest(APPPATH.root))
});
*/

gulp.task('serve', ['sass'], function() {
  browserSync.init([`${APPPATH.css}/*.css`, `${APPPATH.root}/*.html`, `${APPPATH.js}/*.js`], {
    server: {
      baseDir: APPPATH.root
    }
  })
});


gulp.task('watch', ['serve', 'sass', 'clean-html', 'clean-scripts', 'scripts', 'moveFonts', 'images', 'html'], function() {
  gulp.watch([SOURCEPATHS.sassSource], ['sass']);
  //gulp.watch([SOURCEPATHS.htmlSource], ['copy']);
  gulp.watch([SOURCEPATHS.jsSource], ['scripts']);
  gulp.watch([SOURCEPATHS.imgSource], ['images']);
  gulp.watch([SOURCEPATHS.htmlSource, SOURCEPATHS.htmlPartialSource], ['html']);
});

gulp.task('default', ['watch']);
