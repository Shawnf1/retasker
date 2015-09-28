var express = require('express');
var router = express.Router();
var Task = require('../models/task.js').Model;
var User = require('../models/user.js');

router.get('/:user?', function(req, res, next){
	// get user id for query
	var user = req.query.user_id;
	// query for tasks in user doc
	User.findById(user, function (err, user) {
		if(err) {
			res.status(400).send(err.message);
		}
		// if the array is empty, display nothing
		if(user.tasks.length == 0) {
			res.send('No tasks created.');
		}else {
			// send back tasks array as json
			res.json(user.tasks);
		}

	});
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
		var temp = req.body.task;
		var user = req.body.user_id;
		if(temp.start_date == null || temp.start_date === "undefined") {
			delete temp["start_date"];
		}
		//console.log("Pre task creation", temp, "for user ", user);
		var task = new Task(temp);
		//task.save(task, function(err, task) {
		//	if(err) {
		//		console.log(err, err.message);
		//		res.status(400).send(err.message);
		//	}else{
		//		res.json(task).status(200);
		//	}
		//});
		//User.findByIdAndUpdate(
		//	user,
		//		{ $push: {"tasks": req.body.task}},
		//		{  safe: true, upsert: true},
		//		function(err, model) {
		//			if(err){
		//				console.log(err);
		//				return res.send(err);
		//			}
		//			return res.json(model);
		//});
		console.log("final task to push", task);
		//User.findByIdAndUpdate(user, User.tasks.push(task), {safe: true, upsert: true, new: true}, function(err, task) {
		////User.findByIdAndUpdate({"_id": user}, {$push: {"tasks": task} }, {safe: true, upsert: true, new: true}, function(err, task) {
		////User.findByIdAndUpdate({"_id": user}, {$addToSet: {"tasks": task} }, {safe: true, upsert: true, new: true}, function(err, task) {
		//
		//// 1st is working:

		//User.findByIdAndUpdate({_id: user}, User.tasks.push(task), {safe: true, upsert: false, new: true}, function(err, task) {
		User.findByIdAndUpdate({_id: user}, {$push: {'tasks': task}}, {safe: true, upsert: false, new: true}, function(err, task) {
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