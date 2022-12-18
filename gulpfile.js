const gulp = require('gulp');
const postcss = require('gulp-postcss');
const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const sass = require('gulp-sass')(require('sass'));
const typescript = require('gulp-typescript');

/////////////////////////////////////////////////////////////////////////////

const destRoot = 'dist';

/////////////////////////////////////////////////////////////////////////////

let tsProject;

function taskTypescript() {
    !tsProject && (tsProject = typescript.createProject('tsconfig.json'));
    return tsProject
        .src()
        .pipe(tsProject())
        .pipe(gulp.dest(destRoot));
}

/////////////////////////////////////////////////////////////////////////////

function pipeTraceTask() {
    return through(function transform(file, enc, callback) {
        console.log('trace task filename:', file.basename);
        callback(null, file);
    });
}

/////////////////////////////////////////////////////////////////////////////

const paths = {
    pages: ["src/*.html"],
};

gulp.task("copy-html", function () {
    return gulp.src(paths.pages).pipe(gulp.dest(destRoot));
});

/////////////////////////////////////////////////////////////////////////////

gulp.task('compile-sass', function () {
    const processors = [tailwindcss,];
    return gulp.src('./scss/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss(processors))
        .pipe(gulp.dest('./css'));
});

gulp.task('compile-sass-prod', function () {
    const processors = [tailwindcss, autoprefixer, cssnano];
    return gulp.src('./scss/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss(processors))
        .pipe(gulp.dest('./css'));
});

gulp.task('watch', function () {
    gulp.watch("./**/*.scss", gulp.series('compile-sass-prod'));
});

/////////////////////////////////////////////////////////////////////////////

exports.ts = taskTypescript;
