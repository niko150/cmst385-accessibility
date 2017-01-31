const gulp = require('gulp');
const babel = require('gulp-babel');
//const clean = require('gulp-clean');
 
gulp.task('src', ['clean'] , () => {
	return gulp.src(['server.js', 'src/**/*.js'])
		.pipe(babel({
			plugins: ['syntax-async-functions','transform-async-to-generator', 'transform-runtime']
		}))
		.pipe(gulp.dest('dist'));
});

gulp.task('node_modules', ['clean'], () => {
	return gulp.src(['node_modules/vue/dist/vue.js', 'node_modules/vue-router/dist/vue-router.js', 'node_modules/vuex/dist/vuex.js'])
		.pipe(gulp.dest('dist/node_modules'));
});

gulp.task('clean', () => {
//	gulp.src('dist', {read:false})
//		.pipe(clean())         
})

gulp.task('default', ['node_modules', 'src'])
