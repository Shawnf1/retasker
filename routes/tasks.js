var express = require('express');
var router = express.Router();
var Task = require('../models/task.js').Model;
var User = require('../models/user.js');

router.get('/', function(req, res, next){
	// get user id for query
	var id = req.query.user_id;
	// query for tasks in user doc
	User.findById(id, function (err, user) {
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
	// save task to temp for modification
	var temp = req.body.task;
	// get user id for queries
	var user = req.body.user_id;
	// clear out the start_date property if not set, model will update that
	if(temp.start_date == null || temp.start_date === "undefined") {
		delete temp["start_date"];
	}
	var task = new Task(temp);

	console.log("final task to push", task);

	// push new task to user
	User.findByIdAndUpdate({_id: user}, {$push: {'tasks': task}}, {safe: true, upsert: false, new: true}, function(err, user) {
		if(err) {
			console.log(err, err.message);
			res.status(400).send(err.message);
		}else{
			res.json(task).status(200);
		}
	});
});

module.exports = router;