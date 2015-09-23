var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var TagSchema = require('./tag');
var TaskSchema = require('./task');

var NoteSchema = new Schema({
	title: {type: String, required: true},
	desc: String,
	note: {type: String, required: true},
	user_id: {type: String, required: true},
	created_on: Date,
	updated_on: Date,
	read_only: {type: Boolean, default: false},
	tags: [TagSchema],
	task_link: TaskSchema
});

NoteSchema.pre('save', function(next) {
	var note = this;
	//console.log("presave\n", note);

	// set creation date
	if(!note.created_on) {
		note.created_on = new Date();
	}

	note.updated_on = new Date();
	console.log("final before saving\n", note);

	next();
});

module.exports = mongoose.model('Note', NoteSchema);