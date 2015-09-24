var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Tag = require('./tag.js');

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
	//tags: [{type: mongoose.Schema.ObjectId, ref: 'Tag'}]
});

TaskSchema.pre('save', function(next) {
	var task = this;
	console.log("in presave", task);
	//console.log("presave\n", note);

	// set creation date
	if(!task.created_on) {
		task.created_on = new Date();
	}

	task.updated_on = new Date();

	task.start_date = new Date();
	// default to start date today
	//if(!task.start_date) {
	//	task.start_date = new Date();
	//}

	console.log("final before saving\n", task);

	next();
});

module.exports = mongoose.model('Task', TaskSchema);