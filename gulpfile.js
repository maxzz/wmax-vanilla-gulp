const gulp = import('gulp');
const del = import('del');
const postcss = import('gulp-postcss');
const tailwindcss = import('tailwindcss');
const autoprefixer = import('autoprefixer');
const cssnano = import('cssnano');
const sassRaw = import('sass');
const sass = require('gulp-sass')(sassRaw);

const typescript = import('gulp-typescript');

const sync = import('browser-sync');

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
    del([paths.dest])
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
