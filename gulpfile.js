const gulp = require('gulp');
const babel = require('gulp-babel');
const clean = require('gulp-rimraf');

const dest = 'dist'

gulp.task('src', () => {
	return gulp.src(['server.js', 'src/**/*.js'])
		.pipe(babel({
			plugins: ['syntax-async-functions','transform-async-to-generator', 'transform-runtime']
		}))
		.pipe(gulp.dest(dest));
});

gulp.task('node_modules', ['src'], () => {
	return gulp.src([
			'node_modules/vue/dist/vue.js', 
			'node_modules/vue-router/dist/vue-router.js', 
			'node_modules/vuex/dist/vuex.js'])
		.pipe(gulp.dest(dest+'/node_modules'));
});

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

gulp.task('default', ['node_modules', 'copy', 'src'])
