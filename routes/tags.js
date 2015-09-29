var express = require('express');
var router = express.Router();
var Tag = require('../models/tag.js').Model;
var User = require('../models/user.js').Model;

router.get('/', function(req, res, next){
	console.log("get tags", req.query);
	if(req.query.user_id === undefined || !req.query.user_id.length) {
		res.status(400).send("No user sent.");
	}else if(!req.query.term.length) {
		res.status(400).send("No query sent.");
	}else {
		console.log("passed test");
		// setup query
		//var search = {
		//	id: req.query.user_id,
		//	tags: {
		//		title: new RegExp('.*'+ req.query.term +'.*', "i")
		//	}
		//};
		//console.log("query setup", search);
		//User.find({ _id: '5609556a1a272e091264617a' }, function (err, user) {
		//User.find({ first_name: { $regex: /(.*?(Shawn)[^$]*$)/i } }, function (err, user) {
		//var regPatt = new RegExp('(.*?('+ req.query.term +')[^$]*$)/i');
		var regPatt = new RegExp(req.query.term, 'i');
		console.log("regex: ", regPatt);
			//User.find({_id: req.query.user_id, tags: { $elemMatch: { title: "test" }} }, function (err, tags) {
			////User.find({_id: req.query.user_id, tags: { title:  { $regex: reg, $options: 'i'} } }, function (err, tags) {
			//	if(err) {
			//		console.log(err, err.message);
			//		res.status(400).send(err.message);
			//	}else {
			//		console.log(tags, "found tags");
			//		res.status(200).json(tags);
			//	}
			//});
		User.findById(req.query.user_id, function (err, user) {
			if(err) {
				console.log(err, err.message);
				res.status(400).send(err.message);
			}else {
				var useTags = [];
				// grabbed user, now filter out tags
				//console.log(user.tags, "found tags", regPatt);
				user.tags.forEach(function (v, i, a) {
					//console.log("tag: ", v, v.title, regPatt.test(v.title), regPatt);
					if(regPatt.test(v.title)) {
						//console.log("valid", v);
						useTags.push(v);
					}
				});
				//console.log("valid tags", useTags);
				res.status(200).json(useTags);
			}
		});
		//User.find({_id: req.query.user_id, tags: { title: { $regex: '/'+ req.query.term +'/'}}}, function (err, tags) {
		//	if(err) {
		//		console.log(err, err.message);
		//		res.status(400).send(err.message);
		//	}else {
		//		console.log("tags from query", tags);
		//		res.status(200).json(tags);
		//	}
		//});
	}
});


//router.post('/', function (req, res, next) {
//	var tags = req.body.tags;
//	var user_id = req.body.user_id;
//
//	Tag.processTags(user_id, tags, returnTags, res);
//});

// end of the callback loop to send response
//function returnTags(tags, res) {
//	res.status(200).json(tags);
//};

module.exports = router;