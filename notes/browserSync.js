'use strict';

//    browser-sync
//    ^          ^
//  Chrome     Safari


const gulp = require('gulp');
const less = require('gulp-less');
const concat = require('gulp-concat');
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

    return gulp.src('frontend/style1/*.less')
        .pipe(less())
        .pipe(autoprefixer())
        .pipe(remember('less'))
        .pipe(concat('all.css'))
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