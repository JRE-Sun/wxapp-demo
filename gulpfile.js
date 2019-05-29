var gulp       = require('gulp'),
    babel      = require('gulp-babel'),
    autoprefix = require('gulp-autoprefixer'),
    sass       = require('gulp-sass'),
    replace    = require('gulp-replace'),
    changed    = require('gulp-changed'),
    imagemin   = require('gulp-imagemin'),
    jsonminify = require('gulp-jsonmin'),
    debug      = require('gulp-debug'),
    px2rpx     = require('gulp-px2rpx'),
    clean      = require('gulp-clean'),
    watchPath  = require('gulp-watch-path'),
    rename     = require('gulp-rename'),
    uglify     = require('gulp-uglify'),
    plumber    = require('gulp-plumber');

const config = {
    // 开发目录
    devPath : 'src',
    // 编译目录
    prodPath: 'dist',
    file    : {
        // js文件
        js  : '/**/*.js',
        // wxss文件
        wxss: '/**/**.scss',
        // wxml文件
        wxml: '/**/**.wxml',
        // json文件
        json: '/**/**.json',
        wxs : '/**/**.wxs',
        // 图片文件(jpg|jpeg|png|gif)
        img : '/**/{**.jpg,**.jpeg,**.png,**.gif}',
    }
};

for (let fileKey in config.file) {
    // 清理编译目录
    gulp.task("clean" + fileKey, function (e) {
        return gulp.src('dist' + config.file[fileKey])
                   .pipe(clean());
    });
}

// 清理编译目录
gulp.task("clean", function (e) {
    console.error(e)
    return gulp.src('dist')
               .pipe(clean());
});

gulp.task('sass', ['cleanwxss'], function () {
    return gulp.src('src/**/*.scss')
               .pipe(plumber({
                   errorHandler: function (error) {
                       console.log(error);
                       this.emit('end');
                   }
               }))
               .pipe(sass({outputStyle: 'compressed'}))
               .pipe(autoprefix({
                   browsers: ['last 2 versions', 'Android >= 4.0', '> 1%'],
                   cascade : false,
               }))
               .pipe(px2rpx({
                   screenWidth     : 750, // 设计稿屏幕, 默认750
                   wxappScreenWidth: 750, // 微信小程序屏幕, 默认750
                   remPrecision    : 6 // 小数精度, 默认6
               }))
               .pipe(changed('src'))
               .pipe(debug())
               .pipe(rename((path) => path.extname = '.wxss')) //重命名
               .pipe(gulp.dest('dist'))
});

gulp.task('wxml', ['cleanwxml'], function () {
    return gulp.src('src/**/*.wxml')
               // .pipe(changed('src'))
               .pipe(debug())
               .pipe(replace(/\n+|\t+/g, ' '))
               // 将连续空格替换为单个空格
               .pipe(replace(/\s+/g, ' '))
               // 将" <"和"> "的空格删除
               .pipe(replace(/(>\s)/g, '>'))
               .pipe(replace(/(\s<)/g, '<'))
               // 删除注释
               .pipe(replace(/<!--[\w\W\r\n]*?-->/g, ''))
               .pipe(gulp.dest('dist'))
});

gulp.task('json', ['cleanjson'], function () {
    return gulp.src('src/**/*.json')
               .pipe(jsonminify())
               .pipe(gulp.dest('dist'))
});


gulp.task('js', ['cleanjs'], function () {
    return gulp.src('src/**/*.js')
               // .pipe(babel())
               // .pipe(uglify())
               .pipe(gulp.dest('dist'))
});

gulp.task('wxs', ['cleanwxs'], function () {
    return gulp.src('src/**/*.wxs')
               // .pipe(babel())
               // .pipe(uglify())
               .pipe(gulp.dest('dist'))
});

gulp.task('img', ['cleanimg'], function () {
    return gulp.src('src/**/{**.jpg,**.jpeg,**.png,**.gif}')
               .pipe(imagemin([
                   imagemin.gifsicle(),
                   imagemin.jpegtran(),
                   imagemin.optipng(),
                   imagemin.svgo()
               ], [
                   {optimizationLevel: 3},
                   {},
                   {optimizationLevel: 7},
                   {}
               ], true))
               .pipe(gulp.dest('dist'))
});

gulp.task('watch', function () {
    gulp.watch('src/**/*.scss', ['sass']);
    gulp.watch('src/**/*.wxml', ['wxml']);
    gulp.watch('src/**/*.json', ['json']);
    gulp.watch('src/**/*.js', ['js']);
    gulp.watch('src/**/*.wxs', ['wxs']);
    gulp.watch('src/**/{**.jpg,**.jpeg,**.png,**.gif}', ['img']);
});

gulp.task('default', ['clean'], function () {
    gulp.start('sass', 'wxml', 'json', 'js', 'img', 'wxs');
    gulp.start(['watch']);
});