import pkg from 'gulp';
const { src, dest, lastRun, watch, series, parallel, task } = pkg;

import * as nodePath from 'path';
import fs from 'fs';
import del from 'del';

import browsersync from 'browser-sync';
import notify from 'gulp-notify';
import rename from 'gulp-rename';
import replace from 'gulp-replace';
import plumber from 'gulp-plumber';
import webp from 'gulp-webp';
import imagemin from 'gulp-imagemin';
import fileInclude from 'gulp-file-include';
import webpHtmlNosvg from 'gulp-webp-html-nosvg';
import versionNumber from 'gulp-version-number';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import cleanCss from 'gulp-clean-css';
import webpCss from 'gulp-webpcss';
import autoprefixer from 'gulp-autoprefixer';
import groupCssMediaQueries from 'gulp-group-css-media-queries';
import fonter from 'gulp-fonter';
import ttf2woff from 'gulp-ttf2woff';
import ttf2woff2 from 'gulp-ttf2woff2';
import zipPlugin from 'gulp-zip';
import util from 'gulp-util';
import vinylFtp from 'vinyl-ftp';
import ftpconfig from './ftpconfig.js';
import rollup from 'gulp-better-rollup';
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import terser from 'gulp-terser';
import sourcemaps from 'gulp-sourcemaps';
import environments from 'gulp-environments';

const dev = environments.development;

const rootFolder = nodePath.basename(nodePath.resolve());

const srcFolder = './src';
const buildFolder = './build';

const path = {
  build: {
    html: `${buildFolder}/`,
    css: `${buildFolder}/assets/css/`,
    js: `${buildFolder}/assets/js/`,
    img: `${buildFolder}/assets/img/`,
    svg: `${buildFolder}/assets/img/svg/`,
    fonts: `${buildFolder}/assets/fonts/`,
    files: `${buildFolder}/assets/files/`,
  },
  src: {
    html: `${srcFolder}/*.html`,
    scss: `${srcFolder}/scss/style.+(scss|sass)`,
    js: `${srcFolder}/js/app.js`,
    img: `${srcFolder}/img/**/*.{jpg,jpeg,png,gif,webp}`,
    svg: `${srcFolder}/img/**/*.svg`,
    fonts: `${srcFolder}/fonts/`,
    files: `${srcFolder}/files/**/*.*`,
  },
  watch: {
    img: `${srcFolder}/img/**/*.{jpg,jpeg,png,gif,webp,svg,ico}`,
    js: `${srcFolder}/js/**/*.js`,
    scss: `${srcFolder}/scss/**/*.+(scss|sass)`,
    html: `${srcFolder}/**/*.html`,
    files: `${srcFolder}/files/**/*.*`,
  },
  srcFolder: srcFolder,
  buildFolder: buildFolder,
  rootFolder: rootFolder,
  ftp: ``,
};

/**
 * onError
 */
const onError = (err) => {
  notify.onError({
    title: `Error in ${err.plugin}`,
    message: '<%= error.message %>',
    sound: true,
    onLast: true,
    wait: true,
  })(err);
  this.emit('end');
};

/**
 * Server
 */
const server = (done) => {
  browsersync.init({
    server: {
      baseDir: `${path.build.html}`,
    },
    notify: true,
    port: 3000,
    // tunnel: 'project', // Demonstration page: http://project.localtunnel.me
    // online: false, // Work Offline Without Internet Connection
  });
};

/**
 * HTML
 */
const html = () => {
  return src(path.src.html)
    .pipe(plumber({ errorHandler: onError }))
    .pipe(fileInclude())
    .pipe(replace(/@img\//g, 'assets/img/'))
    .pipe(webpHtmlNosvg())
    .pipe(
      versionNumber({
        value: '%DT%',
        append: {
          key: '_v',
          cover: 0,
          to: ['css', 'js'],
        },
        output: {
          file: `${path.srcFolder}/version.json`,
        },
      })
    )
    .pipe(dest(path.build.html))
    .pipe(
      browsersync.reload({
        stream: true,
      })
    );
};

/**
 * SCSS
 */

const sass = gulpSass(dartSass);
const scss = () => {
  return src(path.src.scss)
    .pipe(dev(sourcemaps.init()))
    .pipe(plumber({ errorHandler: onError }))
    .pipe(replace(/@img\//g, '../img/'))
    .pipe(
      sass({
        outputStyle: 'expanded',
      })
    )
    .pipe(groupCssMediaQueries())
    .pipe(
      webpCss({
        webpClass: '.webp',
        noWebpClass: '.no-webp',
      })
    )
    .pipe(
      autoprefixer({
        grid: true,
        overrideBrowserslist: ['last 2 versions'],
        cascade: true,
      })
    )
    .pipe(dest(path.build.css))
    .pipe(cleanCss())
    .pipe(
      rename({
        extname: '.min.css',
      })
    )
    .pipe(dev(sourcemaps.write('.')))
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream());
};

/**
 * JS
 */
const js = () => {
  return src(path.src.js, { sourcemaps: true })
    .pipe(dev(sourcemaps.init()))
    .pipe(plumber({ errorHandler: onError }))
    .pipe(
      rollup(
        {
          plugins: [
            babel({ babelrc: false, exclude: 'node_modules/**' }),
            resolve(),
            commonjs(),
          ],
        },
        'umd'
      )
    )
    .pipe(
      terser({
        keep_fnames: true,
        mangle: false,
      })
    )
    .pipe(
      rename({
        suffix: '.min',
      })
    )
    .pipe(dev(sourcemaps.write('.')))
    .pipe(dest(path.build.js))
    .pipe(
      browsersync.reload({
        stream: true,
      })
    );
};

/**
 * Images
 */
const img = () => {
  return src(path.src.img, { since: lastRun(img) })
    .pipe(plumber({ errorHandler: onError }))
    .pipe(webp())
    .pipe(dest(path.build.img))
    .pipe(src(path.src.img, { since: lastRun(img) }))
    .pipe(
      imagemin({
        interlaced: true,
        quality: 95,
        progressive: true,
        optimizationLevel: 3,
        svgoPlugins: [{ removeViewBox: false }, { cleanupIDs: false }],
      })
    )
    .pipe(dest(path.build.img))
    .pipe(src(path.src.svg))
    .pipe(dest(path.build.img))
    .pipe(browsersync.stream());
};

/**
 * Fonts
 */
const otfToTtf = () => {
  return src(`${path.srcFolder}/fonts/*.otf`, {})
    .pipe(plumber({ errorHandler: onError }))
    .pipe(
      fonter({
        formats: ['ttf'],
      })
    )
    .pipe(dest(`${path.srcFolder}/fonts/`));
};

const ttfToWoff = () => {
  return src(`${path.srcFolder}/fonts/**/*.ttf`, {})
    .pipe(plumber({ errorHandler: onError }))
    .pipe(ttf2woff())
    .pipe(dest(`${path.build.fonts}`))
    .pipe(src(`${path.src.fonts}**/*.ttf`))
    .pipe(ttf2woff2())
    .pipe(dest(`${path.build.fonts}`));
};

const cb = () => {};
const fontsStyleSheet = `${path.srcFolder}/scss/_fonts.scss`;
const fontsPath = `${path.build.fonts}`;

const fontsStyle = (done) => {
  fs.readFileSync(fontsStyleSheet);
  fs.writeFile(fontsStyleSheet, '', cb);
  fs.readdir(fontsPath, (err, items) => {
    if (items) {
      let cFontname = '';

      for (const item of items) {
        let fontFileName = item.split('.');
        [fontFileName] = fontFileName;
        if (cFontname !== fontFileName) {
          let fontName = fontFileName.split('-')[0]
            ? fontFileName.split('-')[0]
            : fontFileName;
          let fontWeight = fontFileName.split('-')[1]
            ? fontFileName.split('-')[1]
            : fontFileName;

          fontWeight = fontWeight.toLowerCase();

          let fontStyle =
            fontWeight.indexOf('italic') !== -1 ? 'italic' : 'normal';

          if (fontWeight.indexOf('thin') !== -1) {
            fontWeight = 100;
          } else if (fontWeight.indexOf('extralight') !== -1) {
            fontWeight = 200;
          } else if (fontWeight.indexOf('light') !== -1) {
            fontWeight = 300;
          } else if (fontWeight.indexOf('medium') !== -1) {
            fontWeight = 500;
          } else if (fontWeight.indexOf('semibold') !== -1) {
            fontWeight = 600;
          } else if (fontWeight.indexOf('bold') !== -1) {
            fontWeight = 700;
          } else if (
            fontWeight.indexOf('extrabold') !== -1 ||
            fontWeight.indexOf('havy') !== -1
          ) {
            fontWeight = 800;
          } else if (fontWeight.indexOf('black') !== -1) {
            fontWeight = 900;
          } else {
            fontWeight = 400;
          }

          fs.appendFile(
            fontsStyleSheet,
            `@font-face {\n  font-family: ${fontName};\n  font-display: swap;\n  src: url("../fonts/${fontFileName}.woff2") format("woff2"), url("../fonts/${fontFileName}.woff") format("woff");\n  font-weight: ${fontWeight};\n  font-style: ${fontStyle};\n}\r\n`,
            cb
          );
        }
        cFontname = fontFileName;
      }
    }
  });

  done();
};

const fonts = series(otfToTtf, ttfToWoff, fontsStyle);

/**
 * Clean
 */
const clean = () => {
  return del([buildFolder]).then((dir) => {
    console.log('Deleted files and folders:\n', dir.join('\n'));
  });
};

/**
 * Copy files
 */
const copy = () => {
  return src(path.src.files).pipe(dest(path.build.files));
};

const copyHtaccess = () => {
  return src(`${path.srcFolder}/.htaccess`).pipe(dest(path.buildFolder));
};

/**
 * ZIP
 */
const zip = () => {
  del(`./${path.rootFolder}.zip`);
  return src(`${path.buildFolder}/**/*.*`, {})
    .pipe(plumber({ errorHandler: onError }))
    .pipe(zipPlugin(`./${path.rootFolder}.zip`))
    .pipe(dest('./'));
};

/**
 * FTP
 */
const ftp = () => {
  ftpconfig.log = util.log;
  const ftpConnect = vinylFtp.create(ftpconfig);
  console.log(ftpConnect);
  return src(`${path.buildFolder}/**/*.*`, {})
    .pipe(plumber({ errorHandler: onError }))
    .pipe(ftpConnect.dest(`/${path.ftp}/${path.rootFolder}`));
};

/**
 * Watcher
 */
const watcher = () => {
  watch(path.watch.files, copy);
  watch(path.watch.html, html);
  watch(path.watch.scss, scss);
  watch(path.watch.js, js);
  watch(path.watch.img, img);
};

/**
 * Main tasks
 */
const mainTasks = series(
  fonts,
  parallel(copy, html, scss, js, img),
  copyHtaccess
);

/**
 * Building task scripts
 */
const development = series(clean, mainTasks, parallel(watcher, server));
const build = series(clean, mainTasks);
const deployZip = series(clean, mainTasks, zip);
const deployFtp = series(clean, mainTasks, ftp);

task('clean', clean);
task('fonts', fonts);
task('build', build);
task('zip', deployZip);
task('deploy', deployFtp);
task('default', development);
