"use strict";

// модуль node-static - простейший http-сервер для статичных файлов
// npm i -g node-static
// запуск из консоли static [path]

const gulp = require('gulp');
const less = require('gulp-less');
const concat = require('gulp-concat'); // объединяет все файлы в один
const debug = require('gulp-debug'); // выводит в консоль, что происходит с gulp

// модуль показывает исходные файлы из которых был собран конкретный файл
// эти исходники можно посмотреть будет в браузере
// показывает что было и что стало
const sourcemaps = require('gulp-sourcemaps');

// проверка условия if gulpIf(boolean, func)
// проверка условия if-else gulpIf(boolean, trueFunc, falseFunc)
// в зависимости от условия, пропускает управление через тот или иной покок
const gulpIf = require('gulp-if');

// удаление директорий
const del = require('del');

// проверка development or production
// вызов из консоли NODE_ENV=production gulp taskName
const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';

gulp.task('less:concat', function () {
    return gulp.src('frontend/style/*.less')
        .pipe(debug({title: 'src'}))
        .pipe(less())
        .pipe(debug({title: 'less'}))
        .pipe(concat('all.css'))// ждет пока завершиться обработка всех файлов, затем объединяет их в all.css
        .pipe(debug({title: 'concat'}))
        .pipe(gulp.dest('public')); // записать файлы в public
});

gulp.task('less:import:without-if', function () {
    // base для файлов прописываем вручную, передавая функции src 2ой параметр
    // это означает что gulp положит результаты в public/style1/...
    var pipeline = gulp.src('frontend/style1/main.less', {base: 'frontend'});

    // если это разработка то пишем sourceMap
    if (isDevelopment) {
        pipeline = pipeline.pipe(sourcemaps.init()) // пишет свойство file.sourceMap, в котором отражаются изменения
    }

    // преобразуем файлы из less в css
    pipeline = pipeline.pipe(less());

    if (isDevelopment) {
        // добавить итоговый sourceMap в файл (пишиться в base64) - запись в файл
        pipeline = pipeline.pipe(sourcemaps.write());
        // pipeline = pipeline.pipe(sourcemaps.write('.')) //запись в отдельный файл в томже каталоге
    }

    return pipeline.pipe(gulp.dest('public'));

});

gulp.task('less:import:with-if', function () {

    return gulp.src('frontend/style1/main.less', {base: 'frontend'})
        .pipe(gulpIf(isDevelopment, sourcemaps.init())) // проверка условия
        .pipe(less())
        .pipe(gulpIf(isDevelopment, sourcemaps.write())) // проверка условия
        .pipe(gulp.dest('public'));
});


/*
 * в качестве аргумента gulpIf можно передать функцию, которой передаётся файл
 */
gulp.task('example:gulp-if-func', function () {
    return gulp.src('frontend/style1/*.*', {base: 'frontend'})
        .pipe(sourcemaps.init())
        .pipe(gulpIf(function (file) {
            // если расширение less, то пишим вызываем less()
            return file.extname == '.less';
        }, less()))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('public'));
});

// удаление директории public
gulp.task('clean', function () {
    return del('public'); // del return Promise
});

// скопировать все файлы из frontend/assets/ в public
gulp.task('assets', function () {
    return gulp.src('frontend/assets/**')
        .pipe(gulp.dest('public'));
});

// общая задача, которая вызывает сначала clean, а затем less:import:without-if и assets
gulp.task('build:sync', gulp.series('clean', 'less:import:without-if', 'assets'));

// общая задача
// сначало выполнить clean, после того как задача завершиться
// выполнить параллельно(асинхронно) less:import:without-if и assets
gulp.task('build:async', gulp.series(
    'clean',
    gulp.parallel('less:import:without-if', 'assets'))
);