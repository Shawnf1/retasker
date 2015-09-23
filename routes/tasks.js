var express = require('express');
var router = express.Router();
var Tasks = require('../models/task.js');
var jsonwebtoken = require('express-jwt');

router.get('/:id?', function(req, res, next){
	var token = req.body.token;
	// check if a token was sent
	if(token) {
		// validate the token
		jsonwebtoken.verify(token, 'kindaSecret', function (err, decoded) {
			if(err) {// reject the request
				res.status(403).send({
					success: false,
					message: 'Invalid token'
				});
			}else {// save the decoded token, continue
				req.decoded = decoded;
			}
		});

		//// get the task id request, if there is one
		//var search = {_id: req.user.id, tasks._id: req.id};
		//
		//
		//
		////console.log("notes authed");
		//var search = {user_id: req.user.id};
		//if(id) {
		//	search.id = id;
		//}
		//Note.find(search, function (err, notes) {
		//	if(err) {
		//		return err;
		//	}
		//	console.log("all notes", notes);
		//	// if requesting specific note, return that
		//	if(id) {
		//		res.json(notes);
		//	}else {// else go to notes page
		//		res.render('../views/notes', {title: "Notes", notes: notes});
		//	}
		//});
	}else {
		res.status(403).send({
			success: false,
			message: 'No token provided'
		});
	}
});

router.post('/', function(req, res, next) {
	var token = req.body.token;
	console.log("req: ", req.body);

	if(token) {
		console.log("token exists", token);
		jsonwebtoken.verify(token, 'kindaSecret', function (err, decoded) {
			res.status(403);
			console.log("in verify");
			if(err) {// reject the request
				console.log("error :'(");
				res.status(403).send({
					success: false,
					message: 'Invalid token'
				});
			}else {// save the decoded token, continue
				console.log("token verified");
				req.decoded = decoded;
			}
		});
		Tasks.Create(req.body, function(err, task) {
			if(err) {
				res.status(400).send(err.message);
			}else{
				res.status(200).send('Task successfully inserted.');
			}
		});

	}else {
		res.status(403).send({
			success: false,
			message: 'No token provided'
		});
	}
});

module.exports = router;