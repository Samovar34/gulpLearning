'use strict';

//
//    ОБРАБОТКА ОШИБОК
//
// модули
//
// gulp-notify - оповещение об ошибке
//
// notify.onError(err) {
//     return {
//         title: 'less',
//         message: err.message
//     }
// }
//
//
// gulp-plumber - возвращает специальный потомк, с особым методом pipe
// Если в одном из поток вылетит ошибка, то она будет обработана plumber
//
// plumber({
//  errorHandler: notify.onError(err) {
//          title: 'less',
//          message: err.message
//      }
//  title: 'less',
//  message: err.message
//  }).pipe(...).pipe(...);
//
// multipipe - объединяет несколько потоков в один
//
// multipipe(a, b, c).on('error', function (err) {...});




const gulp = require('gulp');
const less = require('gulp-less');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps')
const debug = require('gulp-debug');
const gulpIf = require('gulp-if');
const del = require('del');

const path = require('path');

const autoprefixer = require('gulp-autoprefixer');
const newer = require('gulp-newer');
const remember = require('gulp-remember');


const browserSync = require('browser-sync').create();

const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';

gulp.task('less', function () {

    return gulp.src('frontend/style1/main.less')
        .pipe(gulpIf(isDevelopment, sourcemaps.init()))
        .pipe(less())

        // ставится после того потока, в котором мы хотим отлавливать ошибки
        .on('error', function (err) {
            console.log(err);
        })
        .pipe(autoprefixer())
        .pipe(gulpIf(isDevelopment, sourcemaps.write()))
        .pipe(gulp.dest('public'));
});


gulp.task('clean', function () {
    return del('public'); // del return Promise
});

gulp.task('assets', function () {
    return gulp.src('frontend/assets/**')
        .pipe(newer('public'))
        .pipe(debug({title: 'assets'}))
        .pipe(gulp.dest('public'));
});

gulp.task('build', gulp.series(
    'clean',
    gulp.parallel('less', 'assets'))
);

gulp.task('watch', function () {
    gulp.watch('frontend/style1/**/*.*', gulp.series('less')).on('unlink', function (filepath) {
        remember.forget('less', path.resolve(filepath));
    });

    gulp.watch('frontend/assets/**/*.*', gulp.series('assets'));
});

gulp.task('serve', function () {
    // bS - сам инжектит свой скрипт в html файлы, дли синхронизации
    browserSync.init({
        server: 'public'
    });

    // при изменениях файлов в public, вызывать перезагрузку браузера
    browserSync.watch('public/**/*.*').on('change', browserSync.reload);
});

gulp.task('dev', gulp.series('build', gulp.parallel('serve', 'watch')));