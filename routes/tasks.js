var express = require('express');
var router = express.Router();
var Tasks = require('../models/tasks');
var jwt = require('express-jwt');

router.get('/:id?', function(req, res, next){
	var token = req.body.token;
	// check if a token was sent
	if(token) {
		// validate the token
		jwt.verify(token, 'Über_spaß_token', function (err, decoded) {
			if(err) {// reject the request
				res.status(403).send({
					success: false,
					message: 'Invalid token'
				});
			}else {// save the decoded token, continue
				req.decoded = decoded;
			}
		});
		// get the task id request, if there is one
		var search = {_id: req.user.id};
		if(id) {
			search.id = id;
		}



		//console.log("notes authed");
		var search = {user_id: req.user.id};
		if(id) {
			search.id = id;
		}
		Note.find(search, function (err, notes) {
			if(err) {
				return err;
			}
			console.log("all notes", notes);
			// if requesting specific note, return that
			if(id) {
				res.json(notes);
			}else {// else go to notes page
				res.render('../views/notes', {title: "Notes", notes: notes});
			}
		});
	}else {
		res.status(403).send({
			success: false,
			message: 'No token provided'
		})
	}
});

router.post('/', function(req, res, next) {
	Tasks.Create(req.body, function(err, user) {
		if(err) {
			res.status(400).send(err.message);
		}else{
			res.redirect('/');
		}
	});
});

module.exports = router;