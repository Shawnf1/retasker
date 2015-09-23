var gulp = require('gulp');
var jade = require('gulp-jade');

gulp.task('jade-templates', function() {

	gulp.src('./client/views/*.jade')
		.pipe(jade({ }))
		.pipe(gulp.dest('./public/views'));
	gulp.src('./client/private/*.jade')
		.pipe(jade({ }))
		.pipe(gulp.dest('./private/views'));
});
gulp.task('default', ['jade-templates']);