var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//var User = require('./user.js').Model;

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

// for processing tags in any note/task, just need to call Tag.processTags and will strip out tags, insert any and return tag ids
// takes in user_id, tags, callback, response
TagSchema.statics.processTags = function processTags (user_id, tags, cb, res) {
	var User = mongoose.model('User');
	// for holding tags to be inserted
	var temp = [];
	// for holding ids of all tags (new tags will be pushed after)
	var ids = [];
	// loop through tags and find ones without an id property
	tags.forEach(function (v, i, a) {
		if(!v.id) {
			temp.push(v);
		}else {
			ids.push(v.id);
		}
	});
	// number of tags being inserted
	var count = temp.length;


	User.findByIdAndUpdate(user_id, {$push: {'tags': {$each: temp}}}, {safe: true, upsert: true, new: true}, function(err, user) {
		if(err) {
			console.log(err, err.message);
			res.status(400).send(err.message);
		}else{
			// get length of new tags array, offset
			var length = user.tags.length;
			// loop through the newly added elements, push to ids - other side will replace all tags with just ids
			for(var i = length - count; i < length; i++) {
				ids.push(user.tags[i]);
			}
			cb(ids, res);
		}
	});
};

module.exports.Model = mongoose.model('Tag', TagSchema);
module.exports.Schema = TagSchema;