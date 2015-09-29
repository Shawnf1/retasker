var express = require('express');
var router = express.Router();
var Tag = require('../models/tag.js').Model;
var User = require('../models/user.js');

router.get('/:term?', function(req, res, next){
	console.log("params", req.params);
	//console.log("param", req.param);
	console.log("body", req.body);
	var search = req.query.term || "";
	console.log("Search term: ", search);
	//var token = req.params.token;
	//console.log("req token: ", token);
	//// check if a token was sent
	//if(token) {
	//	console.log("In token");
	Tag.find({}, function (err, tasks) {
		if(err) {
			res.status(400).send(err.message);
		}
		if(tasks.length == 0) {
			res.send('No tasks created.');
		}else {
			res.json(tasks);
		}

	});
	//}else {
	//	res.status(403).send({
	//		success: false,
	//		message: 'No token provided'
	//	});
	//}
	//var tags = ["Tag1", "Tag2", "Tag3"];
	console.log(tags);
	//return tags;
	res.json(tags);
});


router.post('/', function (req, res, next) {
	// if no tags sent
	//if(req.body.tags === undefined || !req.body.tags.length) {
	//	res.status(400).send("No tags sent.");
	//}else if(req.body.user_id === undefined || !req.body.user_id.length) {
	//	res.status(400).send("No user sent.");
	//}else {
	//	var temp = req.body.tags;
	//	var id = req.body.user_id;
	//
	//	console.log("tags for user", temp, id);
	//
	//	// if no id, need to insert
	//	if(!temp.id) {
	//		var tag = new Tag(temp);
	//
	var temp = req.body.tags;
	var id = req.body.user_id;
			//User.findById(id, function (err, user) {
			//	if(err) {
			//		console.log(err, err.message);
			//		res.status(400).send(err.message);
			//	}else {
			//		console.log("user", user);
			//		res.status(200).json(tag);
			//	}
			//});
	console.log("user, tag to insert", id, temp);
			User.findByIdAndUpdate(id, {$push: {'tags': temp}}, {safe: true, upsert: true, new: true}, function(err, user) {
				if(err) {
					console.log(err, err.message);
					res.status(400).send(err.message);
				}else{
					res.json(temp).status(200);
				}
			});
	//	}
	//}
});

module.exports = router;