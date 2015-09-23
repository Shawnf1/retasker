var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var TagSchema = require('./tag.js');

var TaskSchema = new Schema({
	title: {type: String, required: true},
	desc: String,
	frequency: String,
	created_on: Date,
	updated_on: Date,
	start_date: {type: Date, required: true},
	repetitions: Number,
	end_date: Date,
	read_only: {type: Boolean, default: false},
	tags: [TagSchema]
});

TaskSchema.pre('save', function(next) {
	var task = this;
	//console.log("presave\n", note);

	// set creation date
	if(!task.created_on) {
		task.created_on = new Date();
	}

	task.updated_on = new Date();

	// default to start date today
	if(!task.start_date) {
		task.started_on = new Data();
	}

	console.log("final before saving\n", note);

	next();
});

module.exports = mongoose.model('Task', TaskSchema);