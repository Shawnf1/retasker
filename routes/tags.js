var express = require('express');
var router = express.Router();
var Tag = require('../models/tag.js');
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
	var temp = req.body.tag;
	var user = req.body.user_id;

	console.log("tags for user", temp, user);

	// if no id, need to insert
	if(!temp.id) {
		var tag = new Tag(temp);

		User.findByIdAndUpdate(user, {$push: {'tags': tag}}, {safe:true, upsert: false, new:true}, function (err, user) {
			if(err) {
				console.log(err, err.message);
				res.status(400).send(err.message);
			}else{
				res.status(200);
			}
		});
	}
});

module.exports = router;