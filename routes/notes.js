var express = require('express');
var router = express.Router();
var Note = require('../models/note.js').Model;
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
		if(user.notes.length == 0) {
			res.send('No notes created.');
		}else {
			// send back tasks array as json
			res.json(user.notes);
		}

	});
});

router.post('/', function(req, res, next) {
	if(req.body.user_id === "undefined") {
		res.status(400).send("No user sent.");
	}else if(req.body.note === "undefined") {
		res.status(400).send("No note sent.");
	}else {
		// save task to temp for modification
		var temp = req.body.note;
		// get user id for queries
		var user = req.body.user_id;

		var note = new Note(temp);

		console.log("final note to push", task);

		// push new task to user
		User.findByIdAndUpdate({_id: user}, {$push: {'notes': note}}, {safe: true, upsert: false, new: true}, function(err, user) {
			if(err) {
				console.log(err, err.message);
				res.status(400).send(err.message);
			}else{
				res.json(note).status(200);
			}
		});
	}
});

module.exports = router;