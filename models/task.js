var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//var Tag = require('./tag.js').Schema;
//var User = require('./user.js');

var TaskSchema = new Schema({
	title: {type: String, required: true},
	desc: String,
	frequency: String,
	created_on: Date,
	updated_on: Date,
	start_date: Date,
	repetitions: Number,
	end_date: Date,
	read_only: {type: Boolean, default: false}
	//,
	//tags: [{type: Schema.ObjectId,  ref: 'Tag'}]
});

TaskSchema.pre('save', function(next) {
	var self = this;
	console.log("in presave", task);
	//console.log("presave\n", note);

	//// first need to process tags, add them to the user (parent) document if no id
	//if(self.tags) {
	//	self.tags.forEach(function (v, i, a) {
	//		if(!a[i].id) {
	//			var tag = new Tag(a[i]);
	//
	//		}
	//	});
	//}
	//User.findByIdAndUpdate()

	// set creation date
	if(!self.created_on) {
		self.created_on = new Date();
	}

	self.updated_on = new Date();

	self.start_date = new Date();
	// default to start date today
	//if(!task.start_date) {
	//	task.start_date = new Date();
	//}

	console.log("final before saving\n", task);

	next();
});

module.exports.Model = mongoose.model('Task', TaskSchema);
module.exports.Schema = TaskSchema;