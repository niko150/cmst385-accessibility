const gulp = require('gulp');
const babel = require('gulp-babel');
const clean = require('gulp-rimraf');
const sourcemaps = require('gulp-sourcemaps');
 
const dest = 'dist'

gulp.task('src', ['clean'], () => {
	return gulp.src(['server.js', 'src/**/*.js'])
    .pipe(sourcemaps.init())
			.pipe(babel({
				plugins: ['syntax-async-functions','transform-async-to-generator', 'transform-runtime']
			}))
    .pipe(sourcemaps.write())
		.pipe(gulp.dest(dest));
});

gulp.task('node_modules', ['clean', 'src'], () => {
	return gulp.src(['node_modules/vue/dist/vue.js', 'node_modules/vue-router/dist/vue-router.js', 'node_modules/vuex/dist/vuex.js'])
		.pipe(gulp.dest(dest+'/node_modules'));
});

gulp.task('clean', () => {
	gulp.src(dest+'/*', {read:false})
		.pipe(clean())         
})

gulp.task('default', ['node_modules', 'src'])
