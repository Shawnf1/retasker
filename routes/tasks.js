var express = require('express');
var router = express.Router();
var Task = require('../models/task.js');
var jsonwebtoken = require('express-jwt');

router.get('/', function(req, res, next){

	//var token = req.params.token;
	//console.log("req token: ", token);
	//// check if a token was sent
	//if(token) {
	//	console.log("In token");
	Task.find({}, function (err, tasks) {
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
});

router.post('/', function(req, res, next) {
	//var token = req.body.token;
	//console.log("req: ", req.body);

	//if(token) {
	//	console.log("token exists", token);
		//jsonwebtoken.verify(token, 'kindaSecret', function (err, decoded) {
		//	res.status(403);
		//	console.log("in verify");
		//	if(err) {// reject the request
		//		console.log("error :'(");
		//		res.status(403).send({
		//			success: false,
		//			message: 'Invalid token'
		//		});
		//	}else {// save the decoded token, continue
		//		console.log("token verified");
		//		req.decoded = decoded;
		//	}
		//});
		var temp = req.body;
		if(temp.start_date == null || temp.start_date === "undefined") {
			delete temp["start_date"];
		}
		console.log("Pre task creation", temp);
		var task = new Task(temp);
		task.save(task, function(err, task) {
			if(err) {
				console.log(err, err.message);
				res.status(400).send(err.message);
			}else{
				res.json(task).status(200);
			}
		});

	//var temp = req.body;
	//temp.user_id = req.user.id;
	//var note = new Note(temp);
	//console.log("authed note", note);
	//note.save(note, function (err, post) {
	//	if (err) {
	//		console.log("post error", err);
	//		res.status(500).send("post error");
	//		next(err);
	//	}else {
	//		res.status(200).send("Saved ok!");
	//	}
	//});

	//}else {
	//	res.status(403).send({
	//		success: false,
	//		message: 'No token provided'
	//	});
	//}
});

module.exports = router;