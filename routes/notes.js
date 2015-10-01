var express = require('express');
var router = express.Router();
var Note = require('../models/note.js').Model;
var User = require('../models/user.js').Model;
var Tag = require('../models/tag.js').Model;

router.get('/:id?', function(req, res, next){
	// get user id for query
	var user_id = req.query.user_id;
	// query for notes in user doc
	User.findById(user_id, function (err, user) {
		if(err) {
			res.status(400).send(err.message);
		}

		// if the array is empty, display nothing
		if(user.notes.length == 0) {
			res.status(200).send('No notes created.');
		}else {
			// if looking for notes for a task, just return those
			if(req.query.task_id) {
				var temp = [];
				user.notes.forEach(function (v, i, a) {
					if(v.task_link == req.query.task_id) {
						temp.push(v);
					}
				});
				if(temp.length == 0) {
					res.status(200).send('No notes created.');
				}else {
					res.status(200).json(temp);
				}
			}else {
				// send back notes array as json
				res.status(200).json(user.notes);
			}
		}
	});
});

router.post('/', function(req, res, next) {
	//console.log("in notes post");
	if(req.body.user_id === undefined || !req.body.user_id.length) {
		res.status(400).send("No user sent.");
	}else if(req.body.note === undefined) {
		res.status(400).send("No note sent.");
	}else {
		//console.log("passed tests");
		// save task to temp for modification
		var temp = req.body.note;
		// get user id for queries
		var user_id = req.body.user_id;
		temp.created_on = new Date();
		temp.updated_on = new Date();
		temp.tags = [];

		// if set as sticky, doesn't have iteration date associated with it
		if(temp.sticky) {
			temp.iteration = null;
		}else {
			// if not sticky, needs date. if none, then assume current date
			if (temp.iteration == null || temp.iteration === "undefined") {
				temp.iteration = new Date();
			}
		}

		// if linked to a task, get the task title, save to note
		if(temp.task_link) {
			User.findById( {"_id": user_id}, function (err, user) {
				if(err) {
					console.log(err, err.message);
					res.status(400).send(err.message);
				}else {
					user.tasks.forEach(function (v, i, a) {
						if(v._id == temp.task_link) {
							temp.task_title = String(v.title);
							console.log("temp, v", temp.task_title, v.title);
							return true;
						}
					});
					var note = new Note(temp);
					//console.log("final note", note);
					// insert task to user, complete with tag ids array
					Tag.processTags(user_id, temp.tags, function (tags) {
						note.tags = [];
						note.tags = tags;
						//console.log("final to insert", note);
						// push new note to user
						User.findByIdAndUpdate(user_id, {$push: {'notes': note}}, {
							safe: true,
							upsert: false,
							new: true
						}, function (err, user) {
							if (err) {
								console.log(err, err.message);
								res.status(400).send(err.message);
							} else {
								res.status(200).json(user.notes[user.notes.length -1]);
							}
						});
					});
				}
			} );
		}
	}
});

router.delete('/', function (req, res, next) {
	//console.log("req", req.body);
	if(req.body.user_id === undefined || !req.body.user_id) {
		res.status(400).send("No user sent.");
	}else if(req.body.note_id === undefined) {
		res.status(400).send("No note sent.");
	}else {
		User.findOneAndUpdate({_id: req.body.user_id},
		{
			$pull: { notes: {_id: req.body.note_id } }
		},
		function (err, user) {
			if(err) {
				console.log(err, err.message);
				res.status(400).send(err.message);
			}else {
				//console.log("successfully updated ", req.body.task_id, " to ", req.body.read_only);
				res.status(200).send("Successfully deleted note.");
			}
		});
	}
});

module.exports = router;