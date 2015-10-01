var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Tag = require('./tag.js').Schema;
var Task = require('./task.js').Schema;
var User = require('./user.js').Schema;

var NoteSchema = new Schema({
	title: String,
	text: {type: String, required: true},
	created_on: Date,
	iteration: Date,
	read_only: {type: Boolean, default: false},
	sticky: {type: Boolean, default: false},
	tags: [{type: Schema.ObjectId, ref: 'Tag'}],
	task_link: {type: Schema.ObjectId, ref: 'User.tasks'},
	task_title: String
});

NoteSchema.pre('save', function(next) {
	var note = this;
	//console.log("presave\n", note);

	// set creation date
	if(!note.created_on) {
		note.created_on = new Date();
	}

	note.iteration = new Date();
	console.log("final before saving\n", note);

	next();
});

module.exports.Model = mongoose.model('Note', NoteSchema);
module.exports.Schema = NoteSchema;