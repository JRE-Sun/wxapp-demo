var gulp = require('gulp'),
    babel = require('gulp-babel'),
    autoprefix = require('gulp-autoprefixer'),
    sass = require('gulp-sass'),
    changed = require('gulp-changed'),
    debug = require('gulp-debug'),
    watchPath = require('gulp-watch-path'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    plumber = require('gulp-plumber'),
    projectName = 'wxapp';
gulp.task('sass', function() {
    return gulp.src(projectName + '/**/*.scss')
        .pipe(plumber({
            errorHandler: function(error) {
                console.log(error);
                this.emit('end');
            }
        }))
        .pipe(sass({ outputStyle: 'compressed' }))
        .pipe(autoprefix({
            browsers: ['last 2 versions', 'Android >= 4.0', '> 1%'],
            cascade: false,
        }))
        .pipe(changed(projectName + '/'))
        .pipe(debug())
        .pipe(rename((path) => path.extname = '.wxss')) //重命名
        .pipe(gulp.dest(projectName + '/'))
});

gulp.task('watch', function() {
    gulp.watch(projectName + '/**/*.scss', ['sass']);
});

gulp.task('default', ['watch']);