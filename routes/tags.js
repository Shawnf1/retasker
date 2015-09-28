var express = require('express');
var router = express.Router();
var Tag = require('../models/tag.js');

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


module.exports = router;