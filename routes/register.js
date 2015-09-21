var express = require('express');
var router = express.Router();
var passport = require('passport');
var path = require('path');
var Users = require('../models/user');
//var extractDuplicateField = require('mongoose-extract-duplicate-field');

router.get('/', function(req, res, next){
	res.render('../views/register', {title: "Register"});
});

router.post('/', function(req, res, next) {
	Users.Create(req.body, function(err, user) {
		//if(err) {
		//	//if(err.code === 11000) {
		//	//	var field = extractDuplicateField(err);
		//	//	console.log('error ', err, field);
		//	//}else {
		//	//	console.log('non-duplicate error', err);
		//	//}
		//	var errors;
		//	Users.findOne({'username': req.body.username}, function (err, user) {
		//		if(err) {
		//			return err;
		//		}
		//		console.log('duplicate username found: ', req.body.username);
		//		errors += 'Username already in use. ';
		//	});
		//	Users.findOne({'email': req.body.email}, function (err, user) {
		//		if(err) {
		//			return err;
		//		}
		//		console.log('duplicate email found: ', req.body.email);
		//		errors += 'Email already in use. ';
		//	});
		//	//if(errors) {
		//	//	res.send(400).status('Error: '+ errors);
		//	//}
		//	//var error = new Error('Error: '+ errors);
		//	//error.status = 400;
		//	//next(error);
		//
		//}else {
		//	res.redirect('/');
		//}
		if(err) {
			res.status(400).send(err.message);
		}else{
			res.redirect('/');
		}
	});
});

module.exports = router;