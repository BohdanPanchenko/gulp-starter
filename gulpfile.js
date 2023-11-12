const gulp = require("gulp");

const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const groupQueries = require("gulp-group-css-media-queries");
const sourceMaps = require("gulp-sourcemaps");
const imagemin = require("gulp-imagemin");
const csso = require("gulp-csso");
const autoPrefixer = require("gulp-autoprefixer");
const minify = require("gulp-minify");
const changed = require("gulp-changed");
const server = require("gulp-server-livereload");
const fs = require("fs");

const fileInclude = require("gulp-file-include");
const fileIncludeSettings = {
  prefix: "@@",
  basepath: "@file",
};
const plumberHtmlConfig = {
  errorHandler: notify.onError({
    title: "html",
    message: "Error <%= error.message %>",
    sound: false,
  }),
};
gulp.task("html", () => {
  return (
    gulp
      .src(["./src/*.html"])
      // .src(["./src/**/*.html", "!./src/components/*.html"])
      .pipe(plumber(plumberHtmlConfig))
      .pipe(fileInclude(fileIncludeSettings))
      .pipe(gulp.dest("./dist"))
  );
});

const sass = require("gulp-sass")(require("sass"));
const plumberSassConfig = {
  errorHandler: notify.onError({
    title: "styles",
    message: "Error <%= error.message %>",
    sound: false,
  }),
};
gulp.task("sass", () => {
  return (
    gulp
      .src("./src/scss/*.scss")
      .pipe(plumber(plumberSassConfig))
      .pipe(autoPrefixer())
      .pipe(sourceMaps.init())
      .pipe(sass())
      .pipe(csso())
      // .pipe(groupQueries())
      .pipe(sourceMaps.write())
      .pipe(gulp.dest("./dist/css"))
  );
});

gulp.task("images", () => {
  return gulp
    .src("./src/images/**/*")
    .pipe(changed("./dist/images/"))
    .pipe(imagemin({ verbose: true }))
    .pipe(gulp.dest("./dist/images/"));
});
gulp.task("fonts", () => {
  return gulp
    .src("./src/fonts/**/*")
    .pipe(changed("./dist/fonts"))
    .pipe(gulp.dest("./dist/fonts"));
});
gulp.task("js", () => {
  return gulp
    .src("./src/js/**/*.js")
    .pipe(minify())
    .pipe(gulp.dest("./dist/js"));
});
gulp.task("server", (done) => {
  if (fs.existsSync("./dist")) {
    return gulp.src("./dist").pipe(
      server({
        livereload: true,
        open: true,
        port: 8000,
      })
    );
  } else done();
});

const clean = require("gulp-clean");

gulp.task("clean", (done) => {
  if (fs.existsSync("./dist/"))
    return gulp.src("./dist/", { read: false }).pipe(clean({ force: true }));
  done();
});

gulp.task("watch", () => {
  gulp.watch("./src/scss/**/*.scss", gulp.parallel("sass"));
  gulp.watch("./src/**/*.html", gulp.parallel("html"));
  gulp.watch("./src/images/**/*", gulp.parallel("images"));
  gulp.watch("./src/fonts/**/*", gulp.parallel("fonts"));
  gulp.watch("./src/js/**/*.js", gulp.parallel("js"));
});

gulp.task(
  "default",
  gulp.series(
    "clean",
    gulp.series("html", "sass", "images", "fonts", "js"),
    gulp.parallel("server", "watch")
  )
);
