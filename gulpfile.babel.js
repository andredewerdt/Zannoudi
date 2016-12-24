// generated on 2016-11-03 using generator-gulp-webapp 1.1.1
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import browserSync from 'browser-sync';
import del from 'del';
import {stream as wiredep} from 'wiredep';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;
// convert scss to ./tmp/styles
gulp.task('scss', () => {
  return gulp.src('app/assets/styles/*.scss')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('.tmp/assets/styles'))
    .pipe(reload({stream: true}));
});
// convert sass to ./tmp/styles
gulp.task('sass', () => {
    return gulp.src('app/assets/styles/*.sass')
      .pipe($.plumber())
      .pipe($.sourcemaps.init())
      .pipe($.sass.sync({
        outputStyle: 'expanded',
        precision: 10,
        includePaths: ['.']
      }).on('error', $.sass.logError))
      .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
      .pipe($.sourcemaps.write())
      .pipe(gulp.dest('.tmp/assets/styles'))
      .pipe(reload({stream: true}));
});
// convert jade/pug to tmp/html
gulp.task('pug', () => {
    return gulp.src('app/**/*.pug')
      .pipe($.plumber())
      .pipe($.pug({pretty:true})) // pip to jade plugin
      .pipe(gulp.dest('.tmp/')) // tell gulp our output folder
      .pipe(reload({stream: true}));
});

gulp.task('scripts', () => {
  return gulp.src('app/assets/js/**/*.js')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.babel())
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('.tmp/scripts'))
    .pipe(reload({stream: true}));
});

// copy remaining css to ./tmp/styles
gulp.task('css',() => {
  return gulp.src('app/assets/styles/*.css')
    .pipe(gulp.dest('.tmp/styles'));
});

function lint(files, options) {
  return () => {
    return gulp.src(files)
      .pipe(reload({stream: true, once: true}))
      .pipe($.eslint(options))
      .pipe($.eslint.format())
      .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
  };
}
const testLintOptions = {
  env: {
    mocha: true
  }
};
const LintOptions = {
  env: {
        jquery: true,
        node: true
    },
  globals: {
    ga: true
  },
  extends: "eslint:recommended",
    rules: {
        "no-case-declarations": 0,
        "no-class-assign": 0,
        "no-const-assign": 0,
        "no-dupe-class-members": 0,
        "no-empty-pattern": 0,
        "no-new-symbol": 0,
        "no-self-assign": 0,
        "no-this-before-super": 0,
        "no-unexpected-multiline": 0,
        "no-unused-labels": 0,
        "constructor-super": 0,
        "no-unused-expressions": 0
      }
};
gulp.task('lint', lint('app/assets/scripts/**/*.js'));
gulp.task('lint:test', lint('test/spec/**/*.js', testLintOptions));


gulp.task('html', ['pug','scss','sass','css', 'scripts'], () => {
  return gulp.src(['app/*.html','.tmp/*.html'])
    .pipe($.useref({searchPath: ['.tmp', 'app', '.']}))
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.cssnano()))
    .pipe($.if('*.html', $.htmlmin({collapseWhitespace: true})))
    .pipe(gulp.dest('dist'));
});

gulp.task('images', () => {
  return gulp.src('app/assets/img/**/*')
    .pipe($.if($.if.isFile, $.cache($.imagemin({
      progressive: true,
      interlaced: true,
      // don't remove IDs from SVGs, they are often used
      // as hooks for embedding and styling
      svgoPlugins: [{cleanupIDs: false}]
    }))
    .on('error', function (err) {
      console.log(err);
      this.end();
    })))
    .pipe(gulp.dest('dist/assets/img'));
});

gulp.task('fonts', () => {
  return gulp.src(require('main-bower-files')('**/*.{eot,svg,ttf,woff,woff2}', function (err) {})
    .concat('app/assets/fonts/**/*'))
    .pipe(gulp.dest('.tmp/fonts'))
    .pipe(gulp.dest('dist/fonts'));
});

gulp.task('extras', () => {
  return gulp.src([
    'app/*.*',
    '!app/*.html',
    '!app/*.pug'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('talen',(){
  return gulp.src('app/*.pug' )
  .pipe(rename(function (path){
    path.dirname+= "/gb";
    path.basename +="gb";
  }))
  .pipe(gulp.dest(".dist"));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('serve', ['pug','sass','scss', 'scripts', 'fonts'], () => {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['.tmp', 'app'],
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });

  gulp.watch([
    'app/*.html',
    '.tmp/js/**/*.js',
    'app/assets/img/**/*',
    '.tmp/fonts/**/*'
  ]).on('change', reload);
  gulp.watch('app/**/*.pug', ['pug']);
  gulp.watch('app/assets/styles/**/*.scss', ['scscc']);
  gulp.watch('app/assets/styles/**/*.sass', ['sass']);
  gulp.watch('app/assets/js/**/*.js', ['scripts']);
  gulp.watch('app/assets/fonts/**/*', ['fonts']);
  gulp.watch('bower.json', ['wiredep', 'fonts']);
});

gulp.task('serve:dist', () => {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['dist']
    }
  });
});

gulp.task('serve:test', ['scripts'], () => {
  browserSync({
    notify: false,
    port: 9000,
    ui: false,
    server: {
      baseDir: 'test',
      routes: {
        '/scripts': '.tmp/scripts',
        '/bower_components': 'bower_components'
      }
    }
  });
  gulp.watch('app/**/*.pug', ['pug']);
  gulp.watch('app/assets/jss/**/*.js', ['scripts']);
  gulp.watch('test/spec/**/*.js').on('change', reload);
  gulp.watch('test/spec/**/*.js', ['lint:test']);
});

// inject bower components
gulp.task('wiredep', () => {
  gulp.src('app/assets/styles/*.scss')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)+/
    }))
    .pipe(gulp.dest('app/styles'));

  gulp.src('app/layouts/*.pug')
    .pipe(wiredep({
      exclude: ['bootstrap-sass'],
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('app/layouts'));
});

gulp.task('build', ['lint', 'html', 'images', 'fonts', 'extras'], () => {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], () => {
  gulp.start('build');
});
