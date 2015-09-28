var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TagSchema = new Schema({
	title: {type: String, required: true},
	desc: String
});

//TagSchema.pre('save', function(next) {
//	var tag = this;
//	//console.log("presave\n", note);
//
//	// set creation date
//	if(!tag.created_on) {
//		tag.created_on = new Date();
//	}
//
//	tag.updated_on = new Date();
//	console.log("final before saving\n", note);
//
//	next();
//});

module.exports.Model = mongoose.model('Tag', TagSchema);
module.exports.Schema = TagSchema;