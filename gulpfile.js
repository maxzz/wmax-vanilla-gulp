const gulp = require('gulp');
const del = require('del');
const postcss = require('gulp-postcss');
const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const sass = require('gulp-sass')(require('sass'));

const typescript = require('gulp-typescript');

const sync = require('browser-sync');

/////////////////////////////////////////////////////////////////////////////

const paths = {
    pages: ["src/*.html"],
    src: 'src',
    dest: 'dist',
    sass: './scss/*.scss',
    tsConfig: null,
};

/////////////////////////////////////////////////////////////////////////////

const clean = () => {
    del.sync([paths.dest])
};

/////////////////////////////////////////////////////////////////////////////

function taskTypescript() {
    !paths.tsConfig && (paths.tsConfig = typescript.createProject('tsconfig.json'));
    return paths.tsConfig
        .src()
        .pipe(paths.tsConfig())
        .pipe(gulp.dest(paths.dest));
}

/////////////////////////////////////////////////////////////////////////////

function pipeTraceTask() {
    return through(function transform(file, enc, callback) {
        console.log('through filename:', file.basename);
        callback(null, file);
    });
}

/////////////////////////////////////////////////////////////////////////////

gulp.task("copy-html", function () {
    return gulp.src(paths.pages).pipe(gulp.dest(paths.dest));
});

/////////////////////////////////////////////////////////////////////////////

function compileSass() {
    const processors = [tailwindcss,];
    return gulp.src(paths.sass)
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss(processors))
        .pipe(gulp.dest('./css'));
}

gulp.task('compile-sass-prod', function () {
    const processors = [tailwindcss, autoprefixer, cssnano];
    return gulp.src(paths.sass)
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss(processors))
        .pipe(gulp.dest('./css'));
});

gulp.task('watch', function () {
    gulp.watch("./**/*.scss", gulp.series('compile-sass-prod'));
});

/////////////////////////////////////////////////////////////////////////////

const server = () => {
    sync.init({
        ui: false,
        notify: false,
        server: {
            baseDir: 'dist',
        }
    });
};

const watch = () => {
    gulp.watch(paths.sass, gulp.series(compileSass));
};

/////////////////////////////////////////////////////////////////////////////

exports.ts = taskTypescript;
