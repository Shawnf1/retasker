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
			res.status(200).send('No notes created.');
		}else {
			// store notes in temp array
			var temp = user.notes;
			var tasks = user.tasks;
			//console.log("tasks", tasks);
			// loop through temp array to be able to get task title
			temp.forEach(function (v, i, a) {
				console.log("temp ", v.title, v.task);
				// loop through all tasks to match up title
				tasks.forEach(function (tv, ti, ta) {
					//console.log("notes ref", typeof v.task, " task id", typeof tv._id);
					if(String(v.task) == String(tv._id)) {
						a[i].task_name = String(tv.title);
						console.log("Changed task to ", a[i].task, "(", String(tv.title), ")");
					}else {
						//console.log("no task found", v.task, tv._id);
					}
				});
				console.log("task is now", a[i].task);
			});
			console.log("Post foreach", temp);
			// send back notes array as json
			res.status(200).json(user.notes);
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

		//console.log("pre task_link");
		if(temp.task_link) {
			//User.findById({id: user_id, "tasks._id": temp.task_link}, function (err, user) {
			//	console.log("found user", user);
			//});
			//var task = User.tasks.id(temp.task_link);
			//console.log("found task", task);]
			//console.log("Looking for", temp.task_link);
			User.findById( {"_id": user_id}, function (err, user) {
				//if(err) {
				//	console.log(err, err.message);
				//	res.status(400).send(err.message);
				//}else {
				//	console.log("found task", task);
				//}
				user.tasks.forEach(function (v, i, a) {
					//console.log("tasks", v._id);
					if(v._id == temp.task_link) {
						temp.task_title = String(v.title);
					}
				});
				//console.log("final note", temp);
			} );
			//User.findOne({"_id": user_id, "tasks.id": ObjectId(temp.task_link)}, function (err, task) {
			//	if(err) {
			//		console.log(err, err.message);
			//		res.status(400).send(err.message);
			//	}else {
			//		console.log("2nd query", task);
			//	}
			//});
			//User.findOne( { "tasks": ObjectId(temp.task_link) }, function (err, task) {
			//	console.log("found task", task);
			//} );
		}
		var note = new Note(temp);
		//console.log("note", note);
		// insert task to user, complete with tag ids array
		//Tag.processTags(user_id, temp.tags, function (tags) {
		//	note.tags = [];
		//	note.tags = tags;
		//	//console.log("final to insert", note);
		//	// push new note to user
		//	User.findByIdAndUpdate(user_id, {$push: {'notes': note}}, {
		//		safe: true,
		//		upsert: false,
		//		new: true
		//	}, function (err, user) {
		//		if (err) {
		//			console.log(err, err.message);
		//			res.status(400).send(err.message);
		//		} else {
		//			res.status(200).json(user.notes[user.notes.length -1]);
		//		}
		//	});
		//});
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