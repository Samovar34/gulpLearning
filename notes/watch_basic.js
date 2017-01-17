"use strict";

/*
 инкрементальная сборка (когда что-либо меняет в src, то эти изменения автоматически синхронизируется на public)
 gulp.watch
 */

const gulp = require('gulp');
const less = require('gulp-less');
const concat = require('gulp-concat'); // объединяет все файлы в один
const debug = require('gulp-debug'); // выводит в консоль, что происходит с gulp
const sourcemaps = require('gulp-sourcemaps');
const gulpIf = require('gulp-if');
const del = require('del');


const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';

gulp.task('less', function () {

    return gulp.src('frontend/style1/main.less', {base: 'frontend'})
        .pipe(gulpIf(isDevelopment, sourcemaps.init())) // проверка условия
        .pipe(less())
        .pipe(gulpIf(isDevelopment, sourcemaps.write())) // проверка условия
        .pipe(gulp.dest('public'));
});


gulp.task('clean', function () {
    return del('public'); // del return Promise
});

gulp.task('assets', function () {
    // lastRun - возвращает дату запуска последней задачи
    // Это нужно, что бы при watch не все файлы скопировались в assets
    // а только те, которые изменились.
    // При первом копировании, скопируются все файлы.
    return gulp.src('frontend/assets/**', {since: gulp.lastRun('assets')})
        .pipe(gulp.dest('public'));
});

gulp.task('build', gulp.series(
    'clean',
    gulp.parallel('less', 'assets'))
);

// WATCH BLOCK

// в качестве колбека передается либо gulp.series, либо gulp.parallel
// gulp.watch возврщает объект chokidar (watcher)
// при удалении файлов необходимо по watcher подписать на событие unlink
// В реальных проектах это нужно достаточно редко
//
// EXAMPLES
//
// gulp.watch('frontend/style1/**/*.*', gulp.series('less'));
// gulp.watch('frontend/assets/**/*.*', gulp.series('assets'));


// Задача для запуска наблюдения за файлами
gulp.task('watch', function () {
    gulp.watch('frontend/style1/**/*.*', gulp.series('less'));
    gulp.watch('frontend/assets/**/*.*', gulp.series('assets'));
});

// задача которая сначало выполнает build, а после того как эта задача завершиться - выполнит watch
// при серийном запуске задач (gulp.series) watch нужно размешать в конце, так как задача не завершается
gulp.task('dev', gulp.series('build', 'watch'));