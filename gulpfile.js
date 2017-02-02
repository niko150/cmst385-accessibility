const gulp = require('gulp')
const plumber = require('gulp-plumber')
const rename = require('gulp-rename')
const autoprefixer = require('gulp-autoprefixer');
const sass = require('gulp-sass');
const babel = require('gulp-babel');
const clean = require('gulp-rimraf');
const gutil = require('gulp-util');
const vueify = require('vueify');
const babelify = require('babelify');
const browserify  = require('browserify');
const glob = require('glob');
const fs = require('fs')
const mkdirp = require('mkdirp');

const dest = 'dist'

gulp.task('src', () => {
	return gulp.src(['server.js', 'src/**/*.js'])
		.pipe(babel({
			plugins: ['syntax-async-functions','transform-async-to-generator', 'transform-runtime']
		}))
		.pipe(gulp.dest(dest));
});

/*gulp.task('node_modules', ['src'], () => {
	return gulp.src([
			'node_modules/vue/dist/vue.js', 
			'node_modules/vue-router/dist/vue-router.js', 
			'node_modules/vuex/dist/vuex.js'])
		.pipe(gulp.dest(dest+'/public/node_modules'));
});*/

gulp.task('public', ['public/styles'], () => {
	mkdirp.sync(dest+'/public/scripts')
	return browserify({entries:'public/scripts/demo.js', debug:true})
		.transform(vueify)
		.transform(babelify)
  	.bundle()
 	.pipe(fs.createWriteStream(dest+'/public/scripts/index.js'))
})

gulp.task('public/styles', () => {
	return gulp.src(['public/styles/**/*.scss','public/styles/**/*.sass', 'public/styles/**/*.css'])
	.pipe(plumber({
		errorHandler: function (error) {
			console.log(error.message);
			this.emit('end');
	}}))
	.pipe(sass())
	.pipe(autoprefixer('last 2 versions'))
	.pipe(gulp.dest(dest+'/public/styles/'))
})

gulp.task('copy', () => {
	gulp.src(['serverCredentials.json'])
		.pipe(gulp.dest(dest))
	return gulp.src(['config/*.js'])
		.pipe(gulp.dest(dest + '/config'))
})

gulp.task('clean', () => {
	gulp.src(dest+'/*', {read:false})
		.pipe(clean())         
})

gulp.task('default', ['copy', 'public', 'src'])
