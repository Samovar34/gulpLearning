'use strict';
const gulp = require('gulp');
const less = require('gulp-less');
const concat = require('gulp-concat');
const debug = require('gulp-debug');
const gulpIf = require('gulp-if');
const del = require('del');

const path = require('path');

// добавляет браузерные префиксы к стилям
const autoprefixer = require('gulp-autoprefixer');

// решает сходнкую задачу с since
// пропускает все файлы через себя и запоминает
// и файлы с одним и темже именем и содержимым, второй раз через себя не пропускает
const cached = require('gulp-cached');

// фильтр, который отслеживает файлы
// Если исходный файл, отличается от файла в папке назначения
// то скопирует его в папку назначения
// альтернатива: gulp-changed
const newer = require('gulp-newer');


// модуль пропускает через себя файлы
// и запоминает их в своём внутреннем кеше
const remember = require('gulp-remember');


const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';

gulp.task('less', function () {

    return gulp.src('frontend/style1/*.less')
        // less - имя кеша
        // Принцип: все файлы, содержимое которых не изменилось - отметаются
        .pipe(cached('less'))
        .pipe(less())
        .pipe(autoprefixer())
        // less - имя кеша
        .pipe(remember('less'))
        .pipe(concat('all.css'))
        .pipe(gulp.dest('public'));
});


gulp.task('clean', function () {
    return del('public'); // del return Promise
});

gulp.task('assets', function () {
    return gulp.src('frontend/assets/**')

        // проверка файлов
        // newer проверяет файлы по дате модификации
        .pipe(newer('public'))
        .pipe(debug({title: 'assets'}))
        .pipe(gulp.dest('public'));
});

gulp.task('build', gulp.series(
    'clean',
    gulp.parallel('less', 'assets'))
);

gulp.task('watch', function () {

    // gulp.watch возвращает вотчерк, который можно подписать на обработку unlink события (удаление файлов)
    // filepath - относительный путь к файлу
    gulp.watch('frontend/style1/**/*.*', gulp.series('less')).on('unlink', function (filepath) {

        // для remember нужен абсолютный путь к файлу
        // удаление их кеша файла, который был удален
        // это нужно для того, что бы при пересборку стилей, удаленные файлы
        // были также удалены из кеша. Иначе они попадут в сборку.
        remember.forget('less', path.resolve(filepath));

        // удаление из кеша cached
        delete cached.caches.less[path.resolve(filepath)];
    });

    gulp.watch('frontend/assets/**/*.*', gulp.series('assets'));
});

gulp.task('dev', gulp.series('build', 'watch'));