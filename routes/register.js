var express = require('express');
var router = express.Router();
var path = require('path');
var Users = require('../models/user').Model;

router.get('/', function(req, res, next){
	res.render('../views/register', {title: "Register"});
});

router.post('/', function(req, res, next) {
	Users.Create(req.body, function(err, user) {
		if(err) {
			res.status(400).send(err.message);
		}else{
			res.redirect('/');
		}
	});
});

module.exports = router;