var express = require('express');
var router = express.Router();
var Note = require('../models/note.js').Model;
var User = require('../models/user.js').Model;
var Tag = require('../models/tag.js').Model;

router.get('/', function(req, res, next){
	// get user id for query
	var id = req.query.user_id;
	// query for notes in user doc
	User.findById(id, function (err, user) {
		if(err) {
			res.status(400).send(err.message);
		}
		// if the array is empty, display nothing
		if(user.notes.length == 0) {
			res.status(400).send('No notes created.');
		}else {
			// send back tasks array as json
			res.status(200).json(user.notes);
		}
	});
});

router.post('/', function(req, res, next) {
	console.log("in notes post");
	if(req.body.user_id === undefined || !req.body.user_id.length) {
		res.status(400).send("No user sent.");
	}else if(req.body.note === undefined) {
		res.status(400).send("No note sent.");
	}else {
		// save task to temp for modification
		var temp = req.body.task;
		// get user id for queries
		var user_id = req.body.user_id;

		var note = new Note(temp);

		// insert task to user, complete with tag ids array
		Tag.processTags(user_id, temp.tags, function (tags) {
			note.tags = [];
			note.tags = tags;
			// push new note to user
			User.findByIdAndUpdate(user_id, {$push: {'note': note}}, {
				safe: true,
				upsert: false,
				new: true
			}, function (err, user) {
				if (err) {
					console.log(err, err.message);
					res.status(400).send(err.message);
				} else {
					res.status(200).send("Successfully inserted new note.");
				}
			});
		});
		//console.log("passed tests for posting notes");
		//// save task to temp for modification
		//var temp = req.body.note;
		//// get user id for queries
		//var user = req.body.user_id;
		//
		//var note = new Note(temp);
		//
		//console.log("final note to push", note);
		//
		//// push new note to user
		//User.findByIdAndUpdate({_id: user}, {$push: {'notes': note}}, {safe: true, upsert: false, new: true}, function(err, user) {
		//	if(err) {
		//		console.log(err, err.message);
		//		res.status(400).send(err.message);
		//	}else{
		//		res.json(note).status(200);
		//	}
		//});
	}
});

module.exports = router;