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

TagSchema.statics.processTags = function processTags (user_id, tags, cb) {
	var User = mongoose.model('User');
	console.log("in TagSchema->processTags");
	// for holding tags to be inserted
	var temp = [];
	// for holding ids of all tags (new tags will be pushed after)
	var ids = [];
	// loop through tags and find ones without an id property
	tags.forEach(function (v, i, a) {
		if(!v.id) {
			console.log("need to insert", v);
			temp.push(v);
		}else {
			console.log("don't need to insert", v);
			ids.push(v.id);
		}
	});
	// number of tags being inserted
	var count = temp.length;
	console.log("tags to insert: ", count, temp, "user", user_id);

	//console.log("model in tags", User);
	var newTags = [];
	User.findById(user_id, function (err, user) {
		if(err) {
			console.log(err, err.message);
			//res.status(400).send(err.message);
		}else {
			console.log("inside complete", user.tags);
			//res.status(200).json(user);
			//return user.tags;
			newTags = user.tags;
			cb(newTags);
			//return true;
		}
	});
	console.log("after query", newTags);
	//console.log(test);
	//User.findByIdAndUpdate(id, {$push: {'tags': {$each: temp}}}, {safe: true, upsert: true, new: true}, function(err, user) {
	//	if(err) {
	//		console.log(err, err.message);
	//		res.status(400).send(err.message);
	//	}else{
	//		res.json(temp).status(200);
	//	}
	//});



	//User.findByIdAndUpdate(user_id, {$push: {'tags': {$each: temp}}}, {safe: true, upsert: true, new: true}, function(err, user) {
	//	console.log("query done ", user);
	//	if(err) {
	//		console.log(err, err.message);
	//		res.status(400).send(err.message);
	//	}else{
	//		console.log("no errors", user);
	//		// get length of new tags array, offset
	//		var length = user.tags.length - 1;
	//		// loop through the newly added elements
	//		for(var i = length - count; i < length; i++) {
	//			ids.push(user.tags[i]);
	//		}
	//		res.status(200).json(tags);
	//	}
	//});
	//console.log("returning tags", newTags);
	//return newTags;
};

module.exports.Model = mongoose.model('Tag', TagSchema);
module.exports.Schema = TagSchema;