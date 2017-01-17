"use strict";
// GULP использует VinylFs
const gulp = require("gulp");

/*
    gulp.src - возвращает readable поток (vinyl)
    gulp.dest - возвращает writable поток
 */

// задание по умолчанию
// достаточно вызвать gulp из консоли для выполнения задачи default
gulp.task("default", function (cb) {
    return gulp.src("source/**/*.{js,css}") // minimatch
        .on("data", function (file) { // у всех потоков есть событие data
            console.log({
                contents: file.contents, // Buffer в бинарном виде
                path: file.path, // полный путь (базовое свойство)
                cwd: file.cwd,
                base: file.base, // до звёзочек (базовое свойство)
                // path components helpers (вычисляются)
                relative: file.relative, // всё что после звёздочек
                dirname: file.dirname,
                basename: file.basename,
                stem: file.stem,
                extname: file.extname
            });
        })
        // в качестве параметра можно передать функцию
        // функция получает объект файла и возвращает строку куда положить файл
        .pipe(gulp.dest(function (file) {
            return file.extname == '.js' ? 'js' : file.extname == '.css' ? 'css' : 'dest';
        }));
});

gulp.task('example1', function () {
    // при таком варианте файлы не читаются
    // можно применять когда чтение не требуется, например при удалении файлов
    // либо нужно передать другому плагино, для которого содержимое не нужно и он работает с ним посвоему
    return gulp.src(['source/**/*.*'], {read: false})
        .on('data', function (file) {
            console.log(file.contents); // file.contents = null
        })
        .pipe(gulp.dest('build'));
});

/*
 * minimatch examples
 */

// искать файлы в папке source
// используя все вложенные папки и там файлы с любым именем и расширением
var e1 = 'source/**/*.*';

// как и в первом примере, только файлы с расширением js и css
var e2 = 'source/**/*.{js,css}';

// как и в первом примере, только файлы js
var e3 = 'source/**/*.js';

// как и в первом примере, только искать в папках source1 и source2
var e4 = '{source1,source2}/**/*.*';

// можно использовать массив
// искать сначала все js, а потом css
// такой вариант используется только в том случае, когда мы хотим получить
// сначала всё js, а потом css
var e5 = ['source/**/*.js', 'source/**/*.css'];
var e5a = ['{css,js,source}/**/*.*', 'gulpfile.js', 'package.json'];

// игнорирование
// искать все файлы, кроме файлов в папке node_modules
// !!! сначала gulp ищет всё файлы, а потом будет сверять с условием игнорирования
// !!! операция не выгодная
var e6 = ['**/*.*', '!node_modules/**'];