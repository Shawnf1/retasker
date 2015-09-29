var express = require('express');
var router = express.Router();
var Tag = require('../models/tag.js').Model;
var User = require('../models/user.js').Model;

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
	var tags = req.body.tags;
	var user_id = req.body.user_id;
	console.log("tags, id ", tags, user_id);
	//tags.forEach(function (v, i, a) {
	//	console.log("user, tag to insert", id, v);


	//User.findById(user_id, function (err, user) {
	//	if(err) {
	//		console.log(err, err.message);
	//		res.status(400).send(err.message);
	//	}else {
	//		console.log(user);
	//		res.json(user).status(200);
	//	}
	//});


// working at this level
//User.findByIdAndUpdate(user_id, {$push: {'tags': {$each: tags}}}, {safe: true, upsert: true, new: true}, function(err, user) {
//	if(err) {
//		console.log(err, err.message);
//		res.status(400).send(err.message);
//	}else{
//		res.json(tags).status(200);
//	}
//});
	//})
	//console.log("UserModel", User);
	var newTags = Tag.processTags(user_id, tags, test);
	console.log("old->new tags", tags, newTags, test);
	res.status(200).json(newTags);
});

function test(tags) {
	console.log("test tags ", tags);
};

module.exports = router;