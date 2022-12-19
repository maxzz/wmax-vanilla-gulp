const fs = require('fs');
const gulp = require('gulp');
const postcss = require('gulp-postcss');
const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const sass = require('gulp-sass')(require('sass'));

const typescript = require('gulp-typescript');

const sync = require('browser-sync');
const server = sync.create();

const IS_DEV_TASK = process.argv.includes('dev') || process.argv.includes('--dev');

/////////////////////////////////////////////////////////////////////////////

const config = {
    pages: ["src/*.html"],
    src: 'src',
    dest: 'dist',
    sass: './scss/*.scss',
    tsConfig: null,
};

/////////////////////////////////////////////////////////////////////////////

const clean = () => {
    return fs.rm(config.dest, { force: true, recursive: true });
};

exports.clean = clean;

/////////////////////////////////////////////////////////////////////////////

function taskTypescript() {
    !config.tsConfig && (config.tsConfig = typescript.createProject('tsconfig.json'));
    return config.tsConfig
        .src()
        .pipe(config.tsConfig())
        .pipe(gulp.dest(config.dest));
}

/////////////////////////////////////////////////////////////////////////////

function pipeTraceTask() {
    return through(function transform(file, enc, callback) {
        console.log('through filename:', file.basename);
        callback(null, file);
    });
}

/////////////////////////////////////////////////////////////////////////////

function copyHtml() {
    return gulp.src(config.pages).pipe(gulp.dest(config.dest));
}

/////////////////////////////////////////////////////////////////////////////

function taskCompileSass() {
    const processors = [tailwindcss,];
    return gulp
        .src(config.sass)
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss(processors))
        .pipe(gulp.dest('./css'));
}

function taskCompileSassProd() {
    const processors = [tailwindcss, autoprefixer, cssnano];
    return gulp
        .src(config.sass)
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss(processors))
        .pipe(gulp.dest('./css'));
}

/////////////////////////////////////////////////////////////////////////////

const reload = (done) => {
    server.reload();
    done();
};

const serve = (done) => {
    sync.init({
        ui: false,
        notify: false,
        server: {
            baseDir: 'dist',
        }
    });
    done();
};

const watch = () => {
    gulp.watch('./src/*.ts', gulp.series(taskTypescript, reload));
    gulp.watch(config.sass, gulp.series(taskCompileSass, reload));
};

const dev = gulp.series(serve, watch);

/////////////////////////////////////////////////////////////////////////////

exports.ts = taskTypescript;
exports.copyHtml = copyHtml;
exports.sass = taskCompileSass;

exports.default = dev;
