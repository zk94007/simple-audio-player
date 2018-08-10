var gulp = require('gulp'),
    minifyCSS = require('gulp-minify-css'),
    concat = require('gulp-concat')
    uglify = require('gulp-uglify')
    prefix = require('gulp-autoprefixer')
    sass = require('gulp-sass');

// Minifies JS
gulp.task('js', function(){
    return gulp.src('src/js/*.js')
    // .pipe(uglify())
    .pipe(uglify().on('error', (error) => {console.log(error)}))
    .pipe(gulp.dest('dist/js'))
});

// SCSS Version
gulp.task('styles', function(){
    return gulp.src('src/scss/*.scss')
    .pipe(sass())
    .pipe(prefix('last 2 versions'))
    .pipe(concat('simpleaudioplayer.min.css'))
    .pipe(minifyCSS())
    .pipe(gulp.dest('dist/css'))
});

gulp.task('default', function() {
    gulp.run('styles')
    gulp.run('js')
    gulp.watch('src/scss/*.scss', function(){
        gulp.run('styles')
    })
});
